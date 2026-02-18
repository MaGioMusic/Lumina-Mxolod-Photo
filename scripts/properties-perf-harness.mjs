#!/usr/bin/env node

import { spawn } from 'node:child_process';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { setTimeout as sleep } from 'node:timers/promises';
import WebSocket from 'ws';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const DEFAULT_PORT = 3207;
const DEFAULT_DEBUG_PORT = 9334;
const DEFAULT_LABEL = 'baseline';
const DEFAULT_OUTPUT_DIR = 'perf-results';
const SERVER_READY_TIMEOUT_MS = 180_000;
const CHROME_READY_TIMEOUT_MS = 60_000;

const MERGE_GATES = {
  themeToggle: { p95Ms: 220, jankRatePct: 40, maxLongTaskMs: 120 },
  filterChange: { p95Ms: 240, jankRatePct: 45, maxLongTaskMs: 140 },
  chatSend: { p95Ms: 260, jankRatePct: 45, maxLongTaskMs: 140 },
};

const round = (value) => Math.round(value * 100) / 100;

const percentile = (values, ratio) => {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.min(sorted.length - 1, Math.floor((sorted.length - 1) * ratio));
  return sorted[index];
};

const summarize = (samples) => {
  const durations = samples.map((entry) => entry.durationMs);
  const longTasks = samples.flatMap((entry) => entry.longTasksMs);
  const jankCount = samples.filter((entry) => entry.jank).length;
  const totalLongTaskCount = samples.reduce((sum, entry) => sum + entry.longTaskCount, 0);

  return {
    iterations: samples.length,
    meanMs: round(durations.reduce((sum, value) => sum + value, 0) / Math.max(durations.length, 1)),
    medianMs: round(percentile(durations, 0.5)),
    p95Ms: round(percentile(durations, 0.95)),
    maxMs: round(Math.max(...durations, 0)),
    jankCount,
    jankRatePct: round((jankCount / Math.max(samples.length, 1)) * 100),
    longTaskCount: totalLongTaskCount,
    maxLongTaskMs: round(Math.max(...longTasks, 0)),
  };
};

const evaluateGate = (summaryByScenario) => {
  const checks = [
    {
      scenario: 'themeToggle',
      rules: MERGE_GATES.themeToggle,
      summary: summaryByScenario.themeToggle,
    },
    {
      scenario: 'filterChange',
      rules: MERGE_GATES.filterChange,
      summary: summaryByScenario.filterChange,
    },
    {
      scenario: 'chatSend',
      rules: MERGE_GATES.chatSend,
      summary: summaryByScenario.chatSend,
    },
  ];

  const results = checks.map(({ scenario, rules, summary }) => {
    const passP95 = summary.p95Ms <= rules.p95Ms;
    const passJank = summary.jankRatePct <= rules.jankRatePct;
    const passLongTask = summary.maxLongTaskMs <= rules.maxLongTaskMs;
    return {
      scenario,
      pass: passP95 && passJank && passLongTask,
      thresholds: rules,
      observed: {
        p95Ms: summary.p95Ms,
        jankRatePct: summary.jankRatePct,
        maxLongTaskMs: summary.maxLongTaskMs,
      },
      failures: [
        ...(passP95 ? [] : [`p95Ms ${summary.p95Ms} > ${rules.p95Ms}`]),
        ...(passJank ? [] : [`jankRatePct ${summary.jankRatePct} > ${rules.jankRatePct}`]),
        ...(passLongTask ? [] : [`maxLongTaskMs ${summary.maxLongTaskMs} > ${rules.maxLongTaskMs}`]),
      ],
    };
  });

  return {
    pass: results.every((entry) => entry.pass),
    scenarios: results,
  };
};

const parseArgs = () => {
  const args = process.argv.slice(2);
  const options = {
    label: DEFAULT_LABEL,
    port: DEFAULT_PORT,
    chromeDebugPort: DEFAULT_DEBUG_PORT,
    outputDir: DEFAULT_OUTPUT_DIR,
    existingBaseUrl: '',
  };

  for (let index = 0; index < args.length; index += 1) {
    const token = args[index];
    const next = args[index + 1];

    if (token === '--label' && next) {
      options.label = next.trim();
      index += 1;
      continue;
    }
    if (token === '--port' && next) {
      options.port = Number(next);
      index += 1;
      continue;
    }
    if (token === '--chrome-debug-port' && next) {
      options.chromeDebugPort = Number(next);
      index += 1;
      continue;
    }
    if (token === '--output-dir' && next) {
      options.outputDir = next;
      index += 1;
      continue;
    }
    if (token === '--base-url' && next) {
      options.existingBaseUrl = next.trim();
      index += 1;
      continue;
    }
  }

  if (!Number.isFinite(options.port) || options.port <= 0) {
    throw new Error(`Invalid --port value: ${options.port}`);
  }
  if (!Number.isFinite(options.chromeDebugPort) || options.chromeDebugPort <= 0) {
    throw new Error(`Invalid --chrome-debug-port value: ${options.chromeDebugPort}`);
  }

  return options;
};

const waitForServer = async (url, timeoutMs) => {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(url, { redirect: 'manual' });
      if (response.status >= 200 && response.status < 500) return;
    } catch {
      // The dev server is still starting.
    }
    await sleep(1_000);
  }
  throw new Error(`Timed out waiting for server: ${url}`);
};

const startDevServer = async (port) => {
  const serverProcess = spawn(
    'npm',
    ['run', 'dev', '--', '--hostname', '127.0.0.1', '--port', String(port)],
    {
      cwd: projectRoot,
      env: {
        ...process.env,
        NEXT_TELEMETRY_DISABLED: '1',
      },
      stdio: ['ignore', 'pipe', 'pipe'],
      detached: true,
    },
  );

  const prefixStdout = (chunk) => {
    const text = String(chunk).trim();
    if (!text) return;
    process.stdout.write(`[dev] ${text}\n`);
  };
  const prefixStderr = (chunk) => {
    const text = String(chunk).trim();
    if (!text) return;
    process.stderr.write(`[dev] ${text}\n`);
  };

  serverProcess.stdout?.on('data', prefixStdout);
  serverProcess.stderr?.on('data', prefixStderr);

  const baseUrl = `http://127.0.0.1:${port}`;
  await waitForServer(`${baseUrl}/properties`, SERVER_READY_TIMEOUT_MS);
  return { serverProcess, baseUrl };
};

const stopProcess = async (child) => {
  if (!child || typeof child.pid !== 'number') return;

  const isAlive = () => {
    try {
      process.kill(child.pid, 0);
      return true;
    } catch {
      return false;
    }
  };

  const waitForExit = async (timeoutMs) =>
    Promise.race([
      new Promise((resolve) => {
        child.once('exit', () => resolve(true));
      }),
      sleep(timeoutMs),
    ]);

  if (!isAlive()) return;

  try {
    process.kill(-child.pid, 'SIGTERM');
  } catch {
    try {
      child.kill('SIGTERM');
    } catch {}
  }

  await waitForExit(1_200);
  if (!isAlive()) return;

  try {
    process.kill(-child.pid, 'SIGKILL');
  } catch {
    try {
      child.kill('SIGKILL');
    } catch {}
  }
  await waitForExit(600);
};

class CdpClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.socket = null;
    this.idCounter = 0;
    this.pending = new Map();
    this.eventListeners = new Map();
  }

  connect() {
    return new Promise((resolve, reject) => {
      const socket = new WebSocket(this.wsUrl);
      this.socket = socket;

      socket.on('open', () => resolve());
      socket.on('error', reject);
      socket.on('message', (raw) => {
        let message = null;
        try {
          message = JSON.parse(String(raw));
        } catch {
          return;
        }

        if (typeof message.id === 'number') {
          const handlers = this.pending.get(message.id);
          if (!handlers) return;
          this.pending.delete(message.id);
          if (message.error) {
            handlers.reject(new Error(message.error.message || 'CDP command failed'));
          } else {
            handlers.resolve(message.result || {});
          }
          return;
        }

        if (message.method) {
          const listeners = this.eventListeners.get(message.method) || [];
          for (const listener of listeners) listener(message.params || {});
        }
      });

      socket.on('close', () => {
        for (const [, handlers] of this.pending) {
          handlers.reject(new Error('CDP socket closed'));
        }
        this.pending.clear();
      });
    });
  }

  async send(method, params = {}) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      throw new Error('CDP socket is not open');
    }
    const id = ++this.idCounter;
    const payload = JSON.stringify({ id, method, params });
    const response = new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
    });
    this.socket.send(payload);
    return response;
  }

  on(method, listener) {
    const current = this.eventListeners.get(method) || [];
    current.push(listener);
    this.eventListeners.set(method, current);
  }

  close() {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.close();
    }
  }
}

const waitForChromeDebugger = async (debugPort, timeoutMs) => {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(`http://127.0.0.1:${debugPort}/json/version`);
      if (!response.ok) throw new Error('debug endpoint not ready');
      const json = await response.json();
      if (json?.Browser) return json;
    } catch {
      // Chrome may still be starting.
    }
    await sleep(400);
  }
  throw new Error('Timed out waiting for Chrome debugger endpoint');
};

const getPropertiesTargetWebSocketUrl = async (debugPort, timeoutMs) => {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(`http://127.0.0.1:${debugPort}/json/list`);
      if (!response.ok) throw new Error('target list not ready');
      const targets = await response.json();
      const target = Array.isArray(targets)
        ? targets.find((entry) => entry?.type === 'page' && String(entry.url || '').includes('/properties'))
        : null;
      if (target?.webSocketDebuggerUrl) return target.webSocketDebuggerUrl;
    } catch {
      // The page target may not exist yet.
    }
    await sleep(400);
  }
  throw new Error('Timed out waiting for /properties page target');
};

const launchChrome = async ({ baseUrl, debugPort }) => {
  const executablePath = process.env.PERF_CHROME_PATH || '/usr/local/bin/google-chrome';
  const profileDir = await mkdtemp(path.join(tmpdir(), 'lumina-perf-profile-'));

  const args = [
    '--headless=new',
    '--disable-gpu',
    '--disable-dev-shm-usage',
    '--no-first-run',
    '--no-default-browser-check',
    '--window-size=1440,900',
    '--lang=en-US',
    `--remote-debugging-port=${debugPort}`,
    `--user-data-dir=${profileDir}`,
    `${baseUrl}/properties`,
  ];

  const chromeProcess = spawn(executablePath, args, {
    cwd: projectRoot,
    stdio: ['ignore', 'pipe', 'pipe'],
    env: {
      ...process.env,
      LANGUAGE: 'en_US.UTF-8',
      LANG: 'en_US.UTF-8',
      LC_ALL: 'en_US.UTF-8',
    },
    detached: true,
  });

  chromeProcess.stdout?.on('data', (chunk) => {
    const text = String(chunk).trim();
    if (!text) return;
    process.stdout.write(`[chrome] ${text}\n`);
  });
  chromeProcess.stderr?.on('data', (chunk) => {
    const text = String(chunk).trim();
    if (!text) return;
    process.stderr.write(`[chrome] ${text}\n`);
  });

  await waitForChromeDebugger(debugPort, CHROME_READY_TIMEOUT_MS);
  const pageWebSocketUrl = await getPropertiesTargetWebSocketUrl(
    debugPort,
    CHROME_READY_TIMEOUT_MS,
  );
  return {
    chromeProcess,
    executablePath,
    profileDir,
    pageWebSocketUrl,
  };
};

const evaluate = async (client, expression) => {
  const result = await client.send('Runtime.evaluate', {
    expression,
    awaitPromise: true,
    returnByValue: true,
  });

  if (result.exceptionDetails) {
    const exceptionText = result.exceptionDetails.text || 'Runtime.evaluate failed';
    throw new Error(exceptionText);
  }

  return result.result?.value;
};

const waitForCondition = async (client, conditionExpression, timeoutMs, description) => {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    const ok = await evaluate(client, `Boolean(${conditionExpression})`);
    if (ok) return;
    await sleep(200);
  }
  throw new Error(`Timed out waiting for condition: ${description}`);
};

const waitForNextPaint = async (client) => {
  await evaluate(
    client,
    `new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve(true))))`,
  );
};

const setupLongTaskCollector = async (client) => {
  await evaluate(
    client,
    `(() => {
      window.__luminaLongTasks = [];
      if (window.__luminaLongTaskObserver) {
        window.__luminaLongTaskObserver.disconnect();
        window.__luminaLongTaskObserver = null;
      }
      const supportsLongTask =
        typeof PerformanceObserver !== 'undefined' &&
        Array.isArray(PerformanceObserver.supportedEntryTypes) &&
        PerformanceObserver.supportedEntryTypes.includes('longtask');
      if (!supportsLongTask) return false;
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          window.__luminaLongTasks.push({
            startTime: entry.startTime,
            duration: entry.duration,
          });
        }
      });
      observer.observe({ entryTypes: ['longtask'] });
      window.__luminaLongTaskObserver = observer;
      return true;
    })()`,
  );
};

const getLongTasksInWindow = async (client, startMs, endMs) =>
  evaluate(
    client,
    `(() => {
      const start = ${startMs};
      const end = ${endMs};
      const entries = Array.isArray(window.__luminaLongTasks) ? window.__luminaLongTasks : [];
      return entries
        .filter((entry) => {
          const taskEnd = entry.startTime + entry.duration;
          return entry.startTime <= end && taskEnd >= start;
        })
        .map((entry) => entry.duration);
    })()`,
  );

const measureInteraction = async (client, actionExpression) => {
  const startedAt = await evaluate(client, 'performance.now()');
  await evaluate(client, actionExpression);
  await waitForNextPaint(client);
  const finishedAt = await evaluate(client, 'performance.now()');

  const longTasksMs = await getLongTasksInWindow(client, startedAt, finishedAt);
  const durationMs = round(finishedAt - startedAt);
  const longTaskCount = longTasksMs.length;
  const maxLongTaskMs = round(Math.max(...longTasksMs, 0));
  const jank = durationMs > 100 || longTasksMs.some((taskDuration) => taskDuration > 50);

  return {
    startedAtMs: round(startedAt),
    finishedAtMs: round(finishedAt),
    durationMs,
    longTaskCount,
    longTasksMs: longTasksMs.map((value) => round(value)),
    maxLongTaskMs,
    jank,
  };
};

const runScenario = async (name, iterations, execute) => {
  const samples = [];
  for (let index = 0; index < iterations; index += 1) {
    const sample = await execute(index);
    samples.push(sample);
    process.stdout.write(
      `[perf] ${name} ${index + 1}/${iterations} -> ${sample.durationMs}ms (longTasks=${sample.longTaskCount})\n`,
    );
    await sleep(60);
  }
  return samples;
};

const runHarness = async ({ baseUrl, label, outputDir, debugPort }) => {
  const launched = await launchChrome({ baseUrl, debugPort });
  const client = new CdpClient(launched.pageWebSocketUrl);
  let report = null;

  try {
    await client.connect();
    await client.send('Page.enable');
    await client.send('Runtime.enable');

    await waitForCondition(
      client,
      `document.readyState === 'complete' || document.readyState === 'interactive'`,
      120_000,
      'document readiness',
    );

    await evaluate(
      client,
      `(() => {
        localStorage.setItem('theme', 'light');
        localStorage.removeItem('lumina_ai_chat_open');
        sessionStorage.removeItem('lumina_ai_autostart');
        sessionStorage.removeItem('lumina_ai_autostart_mode');
        return true;
      })()`,
    );

    await waitForCondition(
      client,
      `Boolean(document.querySelector('input[aria-label="Search properties"]'))`,
      120_000,
      'properties search input',
    );
    await sleep(1_500);

    await setupLongTaskCollector(client);

    const themeToggleSamples = await runScenario('themeToggle', 10, async () =>
      measureInteraction(
        client,
        `(() => {
          const themeButton = [...document.querySelectorAll('button')].find((button) => {
            const srOnly = button.querySelector('.sr-only');
            return srOnly && srOnly.textContent && srOnly.textContent.trim() === 'Toggle theme';
          });
          if (!themeButton) throw new Error('Theme toggle button not found');
          themeButton.click();
          return true;
        })()`,
      ),
    );

    const filterChangeSamples = await runScenario('filterChange', 20, async (iteration) => {
      const value =
        iteration % 2 === 0 ? `tbilisi-perf-${String(iteration + 1).padStart(2, '0')}` : '';
      return measureInteraction(
        client,
        `(() => {
          const input = document.querySelector('input[aria-label="Search properties"]');
          if (!(input instanceof HTMLInputElement)) throw new Error('Search input not found');
          input.focus();
          input.value = ${JSON.stringify(value)};
          input.dispatchEvent(new Event('input', { bubbles: true }));
          return true;
        })()`,
      );
    });

    await evaluate(
      client,
      `(() => {
        const launcher = document.querySelector('.container-wrap');
        if (!(launcher instanceof HTMLElement)) throw new Error('Chat launcher not found');
        launcher.click();
        return true;
      })()`,
    );

    await waitForCondition(
      client,
      `Boolean(document.querySelector('#chat-input'))`,
      20_000,
      'chat input visibility',
    );
    await sleep(700);

    const chatSendSamples = await runScenario('chatSend', 10, async (iteration) =>
      measureInteraction(
        client,
        `(() => {
          const input = document.querySelector('#chat-input');
          if (!(input instanceof HTMLTextAreaElement)) throw new Error('Chat input not found');
          input.focus();
          input.value = ${JSON.stringify(`perf harness ping #${iteration + 1}`)};
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new KeyboardEvent('keydown', {
            key: 'Enter',
            code: 'Enter',
            keyCode: 13,
            which: 13,
            bubbles: true,
          }));
          return true;
        })()`,
      ),
    );

    const summary = {
      themeToggle: summarize(themeToggleSamples),
      filterChange: summarize(filterChangeSamples),
      chatSend: summarize(chatSendSamples),
    };
    const gate = evaluateGate(summary);

    report = {
      metadata: {
        label,
        createdAt: new Date().toISOString(),
        baseUrl,
        browser: launched.executablePath,
        interactions: {
          themeToggle: 10,
          filterChange: 20,
          chatSend: 10,
        },
      },
      thresholds: MERGE_GATES,
      summary,
      gate,
      samples: {
        themeToggle: themeToggleSamples,
        filterChange: filterChangeSamples,
        chatSend: chatSendSamples,
      },
    };

    const absoluteOutputDir = path.resolve(projectRoot, outputDir);
    await mkdir(absoluteOutputDir, { recursive: true });
    const outputPath = path.join(absoluteOutputDir, `properties-perf-${label}.json`);
    await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`, 'utf-8');

    return { report, outputPath };
  } finally {
    client.close();
    await stopProcess(launched.chromeProcess);
    await rm(launched.profileDir, { recursive: true, force: true });
  }
};

async function main() {
  const options = parseArgs();

  let serverProcess = null;
  let baseUrl = options.existingBaseUrl;

  try {
    if (!baseUrl) {
      const started = await startDevServer(options.port);
      serverProcess = started.serverProcess;
      baseUrl = started.baseUrl;
    }

    process.stdout.write(`[perf] Running /properties harness (${options.label}) at ${baseUrl}\n`);
    const { report, outputPath } = await runHarness({
      baseUrl,
      label: options.label,
      outputDir: options.outputDir,
      debugPort: options.chromeDebugPort,
    });

    process.stdout.write(`[perf] Report written to ${outputPath}\n`);
    process.stdout.write(`[perf] Gate result: ${report.gate.pass ? 'PASS' : 'FAIL'}\n`);
    process.stdout.write(
      `[perf] Summary: theme p95=${report.summary.themeToggle.p95Ms}ms | filter p95=${report.summary.filterChange.p95Ms}ms | chat p95=${report.summary.chatSend.p95Ms}ms\n`,
    );
  } finally {
    await stopProcess(serverProcess);
  }
}

main().catch((error) => {
  process.stderr.write(`\n[perf] Harness failed: ${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
});

