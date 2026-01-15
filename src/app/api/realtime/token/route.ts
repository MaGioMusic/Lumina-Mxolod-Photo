import { NextRequest } from 'next/server';
import { ensureRealtimeAccess } from '@/lib/auth/devGuard';
import { enforceRateLimit } from '@/lib/security/rateLimiter';
import { HttpError } from '@/lib/repo/errors';

// Create a short-lived Realtime session token for the browser (ephemeral)
// This endpoint must run server-side with OPENAI_API_KEY set in the environment.
export async function GET(req: NextRequest) {
  try {
    const access = ensureRealtimeAccess(req);
    enforceRateLimit(access.rateLimitKey, {
      limit: 10,
      windowMs: 60_000,
      feature: 'realtime token request',
    });
  } catch (error) {
    if (error instanceof HttpError) {
      return new Response(
        JSON.stringify({
          error: {
            code: error.code,
            message: error.message,
          },
        }),
        { status: error.status, headers: { 'content-type': 'application/json' } },
      );
    }

    console.error('Realtime guard failure', error);
    return new Response(
      JSON.stringify({
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to authorize realtime access',
        },
      }),
      { status: 500, headers: { 'content-type': 'application/json' } },
    );
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'Server missing OPENAI_API_KEY' }),
      { status: 500, headers: { 'content-type': 'application/json' } }
    );
  }

  // Query overrides (lang/model) from client
  const url = new URL(req.url);
  const langParam = (url.searchParams.get('lang') || '').toLowerCase();
  const cookieLang = (req.cookies?.get?.('lumina_language')?.value || '').toLowerCase();
  const modelParam = url.searchParams.get('model');

  // Defaults can be overridden via env, aligned with the user-provided Playground
  const model = modelParam || process.env.VOICE_MODEL || 'gpt-realtime-mini';
  const voice = process.env.VOICE_TTS_VOICE || 'verse';
  const temperatureEnv = process.env.VOICE_TEMPERATURE;
  const temperatureNum = temperatureEnv !== undefined && temperatureEnv !== '' ? Number(temperatureEnv) : undefined;
  // Only apply temperature if provided and meets provider minimums (>=0.6). Otherwise, omit to use platform defaults.
  const includeTemperature = typeof temperatureNum === 'number' && isFinite(temperatureNum) && temperatureNum >= 0.6;

  const toolChoiceEnv = process.env.VOICE_TOOL_CHOICE as 'auto' | 'none' | undefined;
  const transcriptionLanguage = process.env.VOICE_TRANSCRIPTION_LANG;
  const transcriptionModel = process.env.VOICE_TRANSCRIPTION_MODEL || 'whisper-1';
  const SUPPORTED_TRANSCRIPTION_LANGS = new Set([
    'af','ar','az','be','bg','bs','ca','cs','cy','da','de','el','en','es','et','fa','fi','fr','gl','he','hi','hr','hu','hy','id','is','it','ja','kk','kn','ko','lt','lv','mi','mk','mr','ms','ne','nl','no','pl','pt','ro','ru','sk','sl','sr','sv','sw','ta','th','tl','tr','uk','ur','vi','zh'
  ]);

  // Clamp idle timeout to provider max (30s). Default to max to avoid unintended drops.
  const requestedIdle = Number(process.env.VOICE_VAD_IDLE_TIMEOUT_MS ?? 30000);
  const idleTimeoutMs = Number.isFinite(requestedIdle) ? Math.min(30000, Math.max(0, requestedIdle)) : 30000;

  // Optional: allow system instructions via env (kept server-side)
  let systemInstructions = process.env.VOICE_SYSTEM_INSTRUCTIONS;
  // Inject language-specific instruction if not provided by env/prompt
  const lang = langParam || cookieLang || (process.env.DEFAULT_VOICE_LANG || 'ka');
  // Prefer resolved UI language for STT; fallback to env if valid; else auto
  // Only force RU/EN; let Whisper auto-detect for others (e.g., KA)
  const sttLangFromQuery = (lang === 'ru' ? 'ru' : (lang === 'en' ? 'en' : undefined));
  const includeTranscriptionLanguage = sttLangFromQuery
    || (transcriptionLanguage && SUPPORTED_TRANSCRIPTION_LANGS.has(transcriptionLanguage) ? transcriptionLanguage : undefined);
  const langInstructions = (
    lang === 'ru'
      ? 'Ты русскоязычный ассистент по недвижимости на Lumina Estate. Для поиска/фильтрации/навигации сначала вызывай инструменты (search_properties, set_filters, open_page), затем кратко подтверждай на русском.'
      : lang === 'en'
      ? 'You are an English real estate assistant on Lumina Estate. For search/filtering/navigation, call tools first (search_properties, set_filters, open_page), then confirm briefly in English.'
      : 'შენ ხარ ქართულენოვანი უძრავი ქონების ასისტენტი Lumina Estate-ზე. ძიების/ფილტრების/ნავიგაციისთვის ჯერ გამოიყენე შესაბამისი tool-ი, შემდეგ მოკლედ დაადასტურე ქართულად.'
  );
  let promptModel: string | undefined;

  // Optional: fetch instructions from Prompt API if ID provided
  // Accept ?prompt=pmpt_... and/or VOICE_PROMPT_ID env; optional VOICE_PROMPT_VERSION
  const promptId = url.searchParams.get('prompt') || process.env.VOICE_PROMPT_ID || '';
  const promptVersion = url.searchParams.get('version') || process.env.VOICE_PROMPT_VERSION || '';
  if (!systemInstructions && promptId) {
    try {
      const promptUrl = promptVersion
        ? `https://api.openai.com/v1/prompts/${promptId}/versions/${promptVersion}`
        : `https://api.openai.com/v1/prompts/${promptId}`;
      const pres = await fetch(promptUrl, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          // Prompts API beta header
          'OpenAI-Beta': 'prompts=v1',
        },
      });
      if (pres.ok) {
        const pjson: any = await pres.json();
        // Robust extraction of instructions from various shapes
        const extractInstructions = (data: any): string | undefined => {
          if (!data) return undefined;
          if (typeof data.instructions === 'string') return data.instructions;
          if (typeof data.content === 'string') return data.content;
          if (Array.isArray(data.content)) {
            const texts: string[] = [];
            for (const item of data.content) {
              if (typeof item === 'string') texts.push(item);
              else if (typeof item?.text === 'string') texts.push(item.text);
              else if (typeof item?.input_text === 'string') texts.push(item.input_text);
              else if (typeof item?.content === 'string') texts.push(item.content);
            }
            if (texts.length) return texts.join('\n');
          }
          if (Array.isArray(data.messages)) {
            const texts: string[] = [];
            for (const m of data.messages) {
              if (typeof m?.content === 'string') texts.push(m.content);
              else if (Array.isArray(m?.content)) {
                for (const c of m.content) {
                  if (typeof c?.text === 'string') texts.push(c.text);
                }
              }
            }
            if (texts.length) return texts.join('\n');
          }
          if (typeof data?.definition?.instructions === 'string') return data.definition.instructions;
          return undefined;
        };
        const extracted = extractInstructions(pjson);
        if (extracted && extracted.trim().length > 0) {
          systemInstructions = extracted.trim();
        }
        // Try to extract a model from the prompt payload so session model matches
        const extractModel = (data: any): string | undefined => {
          if (!data) return undefined;
          if (typeof data.model === 'string') return data.model;
          if (typeof data?.definition?.model === 'string') return data.definition.model;
          if (typeof data?.version?.definition?.model === 'string') return data.version.definition.model;
          if (Array.isArray(data?.versions)) {
            for (const v of data.versions) {
              const m = extractModel(v);
              if (m) return m;
            }
          }
          return undefined;
        };
        const m = extractModel(pjson);
        if (m && typeof m === 'string') {
          promptModel = m;
        }
      }
    } catch {
      // ignore prompt fetch errors; fall back to env instructions
    }
  }

  try {
    // Align session model with Prompt's model when a Prompt is provided
    // Default to 'gpt-realtime' to satisfy Prompt API requirement when model isn't extractable
    const sessionModel = promptId ? (promptModel || 'gpt-realtime') : model;
    // Build base headers/body once
    const baseHeaders = {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'OpenAI-Beta': 'realtime=v1',
    } as const;
    const baseBody: any = {
      model: sessionModel,
      voice,
      modalities: ['audio', 'text'],
      output_audio_format: 'pcm16',
      ...(includeTemperature ? { temperature: temperatureNum } : {}),
      tool_choice: toolChoiceEnv || 'auto',
      tools: [
        
        // tools list inlined below (unchanged)
      ],
      ...(promptId
        ? { prompt: { id: promptId, ...(promptVersion ? { version: promptVersion } : {}) } }
        : { instructions: (
            (systemInstructions ? systemInstructions + '\n\n' : '') +
            langInstructions + '\n' +
            'When the user asks for search/filtering/navigation, call the corresponding tools and not only reply with text:\n' +
            '- search_properties, set_filters, open_first_property, open_nth_result, navigate_to_property, set_view, open_page.'
          ) } ),
      turn_detection: (
        process.env.VOICE_VAD_MODE === 'server'
          ? {
              type: 'server_vad' as const,
              threshold: Number(process.env.VOICE_VAD_THRESHOLD ?? 0.10),
              prefix_padding_ms: Number(process.env.VOICE_VAD_PREFIX_MS ?? 1200),
              silence_duration_ms: Number(process.env.VOICE_VAD_SILENCE_MS ?? 9000),
              idle_timeout_ms: idleTimeoutMs,
              create_response: true,
              interrupt_response: true,
            }
          : {
              type: 'semantic_vad' as const,
              eagerness: (process.env.VOICE_VAD_EAGERNESS as 'low'|'medium'|'high'|'auto'|undefined) ?? 'auto',
              create_response: true,
              interrupt_response: true,
            }
      ),
      input_audio_transcription: {
        model: transcriptionModel,
        ...(includeTranscriptionLanguage ? { language: includeTranscriptionLanguage } : {}),
      },
      ...(!promptId && process.env.VOICE_STRICT_GUARDRAIL
        ? { instructions: `${systemInstructions ? systemInstructions + '\n\n' : ''}${process.env.VOICE_STRICT_GUARDRAIL}` }
        : {}),
    };

    const res = await fetch('https://api.openai.com/v1/realtime/sessions', {
      method: 'POST',
      headers: { ...baseHeaders, 'OpenAI-Beta': 'realtime=v1, prompts=v1' },
      body: JSON.stringify({
        ...baseBody,
        tools: [
          {
            type: 'function',
            name: 'search_properties',
            description:
              'ძებნის ფუნქცია უძრავი ქონებისთვის. აფილტრირე ბინები/სახლები რაიონით, ფასით, ფართით, საძინებლებით და სტატუსით (ქირავდება/იყიდება). ქართულ ენაზეც იმუშავებს.',
            parameters: {
              type: 'object',
              properties: {
                query: { type: 'string', description: 'თავისუფალი ტექსტი (რაიონი/მახასიათებლები), напр.: "ვაკეში 2 საძინებლიანი"' },
                district: {
                  type: 'string',
                  description: 'რაიონი (აღმნიშვნელი)',
                  enum: ['vake', 'mtatsminda', 'saburtalo', 'isani', 'gldani'],
                },
                min_price: { type: 'number', description: 'ფასის მინიმალური ზღვარი' },
                max_price: { type: 'number', description: 'ფასის მაქსიმალური ზღვარი' },
                bedrooms: { type: 'number', description: 'საძინებლების რაოდენობა' },
                bathrooms: { type: 'number', description: 'სველი წერტილების რაოდენობა' },
                status: { type: 'string', enum: ['for-sale', 'for-rent'], description: 'სტატუსი' },
                property_type: { type: 'string', enum: ['apartment', 'house', 'villa', 'studio', 'penthouse'], description: 'ქონების ტიპი' },
                min_sqft: { type: 'number', description: 'მინ. ფართობი (მ²)' },
                max_sqft: { type: 'number', description: 'მაქს. ფართობი (მ²)' },
                is_new: { type: 'boolean', description: 'მხოლოდ ახალი განცხადებები' },
                limit: { type: 'number', description: 'ჩანაწერების რაოდენობა', default: 6 },
                sort_by: { type: 'string', enum: ['price_asc', 'price_desc', 'newest'], description: 'დალაგება' },
              },
              additionalProperties: false,
            },
          },
          {
            type: 'function',
            name: 'open_nth_result',
            description: 'Open the Nth property from the last search results in the current tab. Index is 1-based.',
            parameters: {
              type: 'object',
              properties: {
                index: { type: 'number', description: '1-based index into the last results list' },
                new_tab: { type: 'boolean', description: 'Open in a new tab instead of current', default: false },
              },
              required: ['index'],
              additionalProperties: false,
            },
          },
          {
            type: 'function',
            name: 'set_view',
            description: 'Switch properties page view. Use "map" when the user asks to show the map.',
            parameters: {
              type: 'object',
              properties: {
                view: { type: 'string', enum: ['grid', 'map'] },
              },
              required: ['view'],
              additionalProperties: false,
            },
          },
          {
            type: 'function',
            name: 'navigate_to_property',
            description: 'Navigate to a specific property details page',
            parameters: {
              type: 'object',
              properties: {
                id: { type: 'string', description: 'Property ID' },
                new_tab: { type: 'boolean', description: 'Open in a new tab', default: false }
              },
              required: ['id'],
              additionalProperties: false,
            },
          },
          {
            type: 'function',
            name: 'set_filters',
            description: 'Update property list filters and navigate to listing page',
            parameters: {
              type: 'object',
              properties: {
                q: { type: 'string' },
                district: { type: 'string' },
                priceMin: { type: 'number' },
                priceMax: { type: 'number' },
                rooms: { type: 'number' },
                status: { type: 'string', enum: ['for-sale', 'for-rent'] },
              },
              additionalProperties: false,
            },
          },
          {
            type: 'function',
            name: 'focus_map',
            description: 'Focus map on coordinates',
            parameters: {
              type: 'object',
              properties: {
                lat: { type: 'number' },
                lng: { type: 'number' },
                zoom: { type: 'number' },
              },
              required: ['lat', 'lng'],
              additionalProperties: false,
            },
          },
          {
            type: 'function',
            name: 'compare_properties',
            description: 'Open comparison view for given property IDs',
            parameters: {
              type: 'object',
              properties: {
                ids: { type: 'array', items: { type: 'string' }, minItems: 2 },
              },
              required: ['ids'],
              additionalProperties: false,
            },
          },
          {
            type: 'function',
            name: 'open_first_property',
            description: 'Open the first matching property using optional filters. If no filters provided, opens the first listing.',
            parameters: {
              type: 'object',
              properties: {
                district: { type: 'string', description: 'Preferred district (text match)' },
                status: { type: 'string', enum: ['for-sale','for-rent'], description: 'Listing status' },
                property_type: { type: 'string', enum: ['apartment','house','villa','studio','penthouse'], description: 'Type' },
                bedrooms: { type: 'number', description: 'Exact bedrooms count' },
                bathrooms: { type: 'number', description: 'Exact bathrooms count' },
                new_tab: { type: 'boolean', description: 'Open in a new browser tab', default: false },
              },
              additionalProperties: false,
            },
          },
          {
            type: 'function',
            name: 'open_page',
            description: 'Open a site page by path, e.g., /blog, /contact. Preserves cid for AI context.',
            parameters: {
              type: 'object',
              properties: {
                path: { type: 'string' },
                new_tab: { type: 'boolean', default: false },
              },
              required: ['path'],
              additionalProperties: false,
            },
          },
        ],
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      // Retry with fallback model and STT
      const res2 = await fetch('https://api.openai.com/v1/realtime/sessions', {
        method: 'POST',
        headers: baseHeaders,
        body: JSON.stringify({
          ...baseBody,
          model: 'gpt-realtime',
          input_audio_transcription: {
            model: 'gpt-4o-mini-transcribe',
            ...(includeTranscriptionLanguage ? { language: includeTranscriptionLanguage } : {}),
          },
        }),
      });
      if (!res2.ok) {
        const text2 = await res2.text();
        const payload: Record<string, unknown> = {
          error: {
            code: 'REALTIME_UPSTREAM_FAILURE',
            message: 'Failed to create session',
          },
        };
        if (process.env.NODE_ENV !== 'production') {
          (payload.error as Record<string, unknown>).detail = {
            upstream: text,
            retry: text2,
          };
        }
        return new Response(JSON.stringify(payload), {
          status: 500,
          headers: { 'content-type': 'application/json' },
        });
      }
      const data2 = await res2.json();
      return new Response(JSON.stringify(data2), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
    }

    const data = await res.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  } catch (err: unknown) {
    if (err instanceof HttpError) {
      return new Response(
        JSON.stringify({
          error: {
            code: err.code,
            message: err.message,
          },
        }),
        { status: err.status, headers: { 'content-type': 'application/json' } },
      );
    }

    console.error('Unexpected realtime token error', err);
    const payload: Record<string, unknown> = {
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Unexpected error creating session',
      },
    };
    if (process.env.NODE_ENV !== 'production') {
      (payload.error as Record<string, unknown>).detail = String(err);
    }
    return new Response(JSON.stringify(payload), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }
}


