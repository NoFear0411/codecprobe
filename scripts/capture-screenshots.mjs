#!/usr/bin/env node
/**
 * Capture PWA screenshots (3 themes) + OG image.
 *
 * Drives a locally installed Chrome/Chromium over the DevTools protocol, using
 * Node's built-in fetch and WebSocket (Node 22+). No npm dependencies.
 * Serves the repo root itself, so no dev server is needed.
 *
 * Run:  node scripts/capture-screenshots.mjs [--out <dir>]
 * Env:  CHROME=/path/to/chrome   (otherwise the first browser found on PATH)
 *
 * Results reflect the capturing machine: headless Chrome has no GPU decode,
 * so HEVC and Dolby Vision cards show as unsupported.
 */
import { spawn, execFileSync } from 'child_process';
import { createServer } from 'http';
import { readFile, writeFile, mkdtemp, rm, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { tmpdir } from 'os';
import { fileURLToPath } from 'url';
import path from 'path';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const outArg = process.argv.indexOf('--out');
const OUT_DIR = outArg > -1 ? path.resolve(process.argv[outArg + 1]) : path.join(ROOT, 'screenshots');

// theme-manager.js: THEME_STORAGE_KEY + THEMES keys
const THEME_STORAGE_KEY = 'codecprobe-theme';
const SHOTS = [
    { file: 'screenshot-dark.png',  theme: 'dark-oled', width: 2560, height: 1237, scale: 1 },
    { file: 'screenshot-light.png', theme: 'light',     width: 2560, height: 1237, scale: 1 },
    { file: 'screenshot-retro.png', theme: 'retro',     width: 2560, height: 1237, scale: 1 },
    // OG image: 2400x1260 layout captured at 0.5 → 1200x630 pixels, fits header + grid
    { file: 'og-image.png',         theme: 'dark-oled', width: 2400, height: 1260, scale: 0.5 },
];

const MIME = {
    '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css',
    '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml', '.ico': 'image/x-icon',
    '.webmanifest': 'application/manifest+json', '.map': 'application/json',
};

function findChrome() {
    if (process.env.CHROME) return process.env.CHROME;
    for (const name of ['google-chrome', 'google-chrome-stable', 'chromium', 'chromium-browser']) {
        try {
            return execFileSync('which', [name], { encoding: 'utf8' }).trim();
        } catch { /* try next */ }
    }
    throw new Error('No Chrome/Chromium found on PATH. Set CHROME=/path/to/chrome.');
}

function serveRepo() {
    const server = createServer(async (req, res) => {
        const urlPath = decodeURIComponent(new URL(req.url, 'http://x').pathname);
        const filePath = path.join(ROOT, urlPath === '/' ? 'index.html' : urlPath);
        if (!filePath.startsWith(ROOT)) { res.writeHead(403).end(); return; }
        try {
            const body = await readFile(filePath);
            res.writeHead(200, { 'Content-Type': MIME[path.extname(filePath)] || 'application/octet-stream' }).end(body);
        } catch {
            res.writeHead(404).end();
        }
    });
    return new Promise(resolve => server.listen(0, '127.0.0.1', () => resolve(server)));
}

async function waitForFile(file, timeoutMs) {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
        if (existsSync(file)) {
            const text = await readFile(file, 'utf8');
            if (text.includes('\n')) return text;
        }
        await new Promise(r => setTimeout(r, 100));
    }
    throw new Error(`Timed out waiting for ${file}`);
}

/** Minimal DevTools protocol client for one target. */
function connect(wsUrl) {
    return new Promise((resolve, reject) => {
        const ws = new WebSocket(wsUrl);
        let nextId = 0;
        const pending = new Map();
        ws.onmessage = ({ data }) => {
            const msg = JSON.parse(data);
            if (msg.id && pending.has(msg.id)) {
                const { ok, fail } = pending.get(msg.id);
                pending.delete(msg.id);
                msg.error ? fail(new Error(msg.error.message)) : ok(msg.result);
            }
        };
        ws.onerror = reject;
        ws.onopen = () => resolve({
            send: (method, params = {}) => new Promise((ok, fail) => {
                const id = ++nextId;
                pending.set(id, { ok, fail });
                ws.send(JSON.stringify({ id, method, params }));
            }),
            close: () => ws.close(),
        });
    });
}

async function waitForResults(cdp) {
    const deadline = Date.now() + 60000;
    while (Date.now() < deadline) {
        const { result } = await cdp.send('Runtime.evaluate', {
            returnByValue: true,
            expression: `(() => {
                const cards = document.querySelectorAll('.codec-item');
                return cards.length > 0 && document.querySelectorAll('.codec-item.PENDING').length === 0;
            })()`,
        });
        if (result.value) {
            await new Promise(r => setTimeout(r, 500));
            return;
        }
        await new Promise(r => setTimeout(r, 250));
    }
    throw new Error('Timed out waiting for test results');
}

async function capture(devtoolsBase, baseUrl, shot) {
    const target = await (await fetch(`${devtoolsBase}/json/new?about:blank`, { method: 'PUT' })).json();
    const cdp = await connect(target.webSocketDebuggerUrl);
    try {
        await cdp.send('Page.enable');
        await cdp.send('Runtime.enable');
        // screenWidth/Height: the header shows window.screen, which headless Chrome reports as 800x600
        await cdp.send('Emulation.setDeviceMetricsOverride', {
            width: shot.width, height: shot.height, deviceScaleFactor: 1, mobile: false,
            screenWidth: shot.width, screenHeight: shot.height,
        });
        await cdp.send('Page.addScriptToEvaluateOnNewDocument', {
            source: `localStorage.setItem(${JSON.stringify(THEME_STORAGE_KEY)}, ${JSON.stringify(shot.theme)});`,
        });
        await cdp.send('Page.navigate', { url: baseUrl });
        await waitForResults(cdp);

        const { data } = await cdp.send('Page.captureScreenshot', {
            format: 'png',
            clip: { x: 0, y: 0, width: shot.width, height: shot.height, scale: shot.scale },
        });
        const filePath = path.join(OUT_DIR, shot.file);
        await writeFile(filePath, Buffer.from(data, 'base64'));
        console.log(`  ${shot.theme.padEnd(9)} ${String(shot.width * shot.scale)}x${shot.height * shot.scale} → ${filePath}`);
    } finally {
        cdp.close();
        await fetch(`${devtoolsBase}/json/close/${target.id}`).catch(() => {});
    }
}

const chromePath = findChrome();
const server = await serveRepo();
const baseUrl = `http://127.0.0.1:${server.address().port}/`;
const profileDir = await mkdtemp(path.join(tmpdir(), 'codecprobe-shots-'));
const chrome = spawn(chromePath, [
    '--headless=new', '--no-first-run', '--no-default-browser-check', '--hide-scrollbars',
    `--user-data-dir=${profileDir}`, '--remote-debugging-port=0', 'about:blank',
], { stdio: 'ignore' });

try {
    await mkdir(OUT_DIR, { recursive: true });
    const [port] = (await waitForFile(path.join(profileDir, 'DevToolsActivePort'), 15000)).split('\n');
    const devtoolsBase = `http://127.0.0.1:${port}`;
    console.log(`Capturing with ${chromePath}`);
    for (const shot of SHOTS) {
        await capture(devtoolsBase, baseUrl, shot);
    }
    console.log(`\nDone — ${SHOTS.length} screenshots captured.`);
} finally {
    chrome.kill();
    server.close();
    await rm(profileDir, { recursive: true, force: true }).catch(() => {});
}
