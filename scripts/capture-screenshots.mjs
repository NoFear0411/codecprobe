#!/usr/bin/env node
/**
 * Capture PWA screenshots (3 themes) + OG image using Playwright.
 * Run: node scripts/capture-screenshots.mjs [port]
 */
import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import path from 'path';

const PORT = process.argv[2] || 8099;
const BASE = `http://127.0.0.1:${PORT}`;
const DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'screenshots');

// theme-manager.js THEMES keys: 'dark-oled', 'light', 'retro'
const THEME_KEYS = {
    dark:  'dark-oled',
    light: 'light',
    retro: 'retro',
};

async function waitForResults(page) {
    await page.waitForSelector('#codec-grid', { state: 'visible', timeout: 30000 });
    await page.waitForFunction(() => {
        const cards = document.querySelectorAll('.codec-item');
        if (cards.length === 0) return false;
        const pending = document.querySelectorAll('.status-badge.pending');
        return pending.length === 0;
    }, { timeout: 60000 });
    await page.waitForTimeout(500);
}

(async () => {
    const browser = await chromium.launch({ headless: true });

    // --- PWA screenshots: 2560x1237, one fresh page per theme ---
    for (const [label, storageKey] of Object.entries(THEME_KEYS)) {
        const ctx = await browser.newContext({ viewport: { width: 2560, height: 1237 } });
        const page = await ctx.newPage();

        // Pre-set theme in localStorage before the page loads theme-manager.js
        await ctx.addInitScript((key) => {
            localStorage.setItem('codecprobe-theme', key);
        }, storageKey);

        await page.goto(BASE, { waitUntil: 'networkidle' });
        await waitForResults(page);

        const filePath = path.join(DIR, `screenshot-${label}.png`);
        await page.screenshot({ path: filePath, fullPage: false });
        console.log(`  PWA  ${label.padEnd(6)} → ${filePath}`);
        await ctx.close();
    }

    // --- OG image: 1200x630 output, but render at 2x content area ---
    // deviceScaleFactor 0.5 means the browser renders a 2400x1260 layout
    // into a 1200x630 pixel image — fits header + grid nicely
    const ogCtx = await browser.newContext({
        viewport: { width: 2400, height: 1260 },
        deviceScaleFactor: 0.5,
    });
    const ogPage = await ogCtx.newPage();

    await ogCtx.addInitScript(() => {
        localStorage.setItem('codecprobe-theme', 'dark-oled');
    });

    await ogPage.goto(BASE, { waitUntil: 'networkidle' });
    await waitForResults(ogPage);

    const ogPath = path.join(DIR, 'og-image.png');
    await ogPage.screenshot({ path: ogPath, fullPage: false });
    console.log(`  OG   dark   → ${ogPath}`);
    await ogCtx.close();

    await browser.close();
    console.log('\nDone — 4 screenshots captured.');
})();
