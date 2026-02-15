import { z } from 'zod';

const flagsSchema = z.object({
  NEXT_PUBLIC_FLAG_TRUST_CLUSTER: z.enum(['0', '1']).optional().default('0'),
  NEXT_PUBLIC_GA4_ID: z.string().trim().optional(),
  NEXT_PUBLIC_FLAG_CRO_HERO: z.enum(['0', '1']).optional().default('0'),
  NEXT_PUBLIC_FLAG_CRO_NEWSLETTER: z.enum(['0', '1']).optional().default('0'),
  NEXT_PUBLIC_FLAG_AGENTS_UI: z.enum(['0', '1']).optional().default('0'),
  NEXT_PUBLIC_FLAG_AI_VOICE_UI: z.enum(['0', '1']).optional().default('0'),
  NEXT_PUBLIC_VOICE_DEFAULT: z.enum(['0', '1']).optional().default('1'),
  NEXT_PUBLIC_FC_DEFAULT: z.enum(['0', '1']).optional().default('1'),
  NEXT_PUBLIC_DEMO_MODE: z.enum(['0', '1']).optional().default('1'),
  NEXT_PUBLIC_VOICE_PROVIDER: z.string().optional(),
  NEXT_PUBLIC_FALLBACK_PROVIDER: z.string().optional(),
});

const parsed = flagsSchema.safeParse(process.env);
const env = parsed.success ? parsed.data : flagsSchema.parse({});

export const runtimeFlags = {
  enableTrustCluster: env.NEXT_PUBLIC_FLAG_TRUST_CLUSTER === '1',
  enableGA4: Boolean(env.NEXT_PUBLIC_GA4_ID),
  ga4Id: env.NEXT_PUBLIC_GA4_ID ?? '',
  enableCROHero: env.NEXT_PUBLIC_FLAG_CRO_HERO === '1',
  enableCRONewsletter: env.NEXT_PUBLIC_FLAG_CRO_NEWSLETTER === '1',
  enableAgentsUI: env.NEXT_PUBLIC_FLAG_AGENTS_UI === '1',
  enableAIVoiceUI: env.NEXT_PUBLIC_FLAG_AI_VOICE_UI === '1',
  voiceDefaultOn: env.NEXT_PUBLIC_VOICE_DEFAULT !== '0',
  functionCallingDefaultOn: env.NEXT_PUBLIC_FC_DEFAULT !== '0',
  demoModeOn: env.NEXT_PUBLIC_DEMO_MODE !== '0',
  // Default to Gemini to avoid accidentally using OpenAI Realtime
  // when env var isn't loaded during dev.
  voiceProvider: env.NEXT_PUBLIC_VOICE_PROVIDER || 'gemini',
  fallbackVoiceProvider: env.NEXT_PUBLIC_FALLBACK_PROVIDER || 'openai',
};

// Back-compat alias
export const flags = runtimeFlags;
