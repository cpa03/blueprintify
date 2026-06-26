import { chromium } from 'playwright-core';
import os from 'os';
import path from 'path';

const CHROMIUM_PATH = path.join(os.homedir(), '.cache/ms-playwright/chromium-1228/chrome-linux/chrome');

async function hunt() {
  const browser = await chromium.launch({
    executablePath: CHROMIUM_PATH,
    args: ['--no-sandbox', '--headless=new', '--disable-gpu'],
  });

  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await context.newPage();
  const errors = [];
  const warnings = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push({ text: msg.text(), location: msg.location() });
      console.log('CONSOLE ERROR:', msg.text());
    } else if (msg.type() === 'warning') {
      warnings.push({ text: msg.text(), location: msg.location() });
      console.log('CONSOLE WARN:', msg.text());
    }
  });

  page.on('pageerror', (err) => {
    errors.push({ text: err.message, stack: err.stack });
    console.log('PAGE ERROR:', err.message);
  });

  console.log('Navigating to http://localhost:4173...');
  await page.goto('http://localhost:4173', { waitUntil: 'networkidle', timeout: 30000 });
  console.log('Page loaded. Waiting for dynamic content...');
  await page.waitForTimeout(2000);

  // Screenshot for reference
  await page.screenshot({ path: '/tmp/brocula-home.png', fullPage: true }).catch(() => {});
  console.log('Screenshot saved.');

  // Interact to trigger any lazy errors
  const buttons = await page.locator('button, a[role="button"]').all();
  console.log('Found ' + buttons.length + ' interactive elements');
  for (const btn of buttons.slice(0, 8)) {
    try {
      await btn.click({ timeout: 2000 });
      await page.waitForTimeout(300);
    } catch (e) {
      // ignore interaction errors
    }
  }

  await page.waitForTimeout(1000);

  console.log('');
  console.log('=== FINAL RESULTS ===');
  console.log('Total console errors:', errors.length);
  console.log('Total console warnings:', warnings.length);

  if (errors.length > 0) {
    console.log('');
    console.log('--- ERRORS ---');
    errors.forEach((e, i) => {
      console.log('[' + i + '] ' + e.text);
      if (e.location) console.log('    at ' + JSON.stringify(e.location));
    });
  }
  if (warnings.length > 0) {
    console.log('');
    console.log('--- WARNINGS ---');
    warnings.forEach((w, i) => {
      console.log('[' + i + '] ' + w.text);
      if (w.location) console.log('    at ' + JSON.stringify(w.location));
    });
  }
  if (errors.length === 0 && warnings.length === 0) {
    console.log('');
    console.log('ALL CLEAN - NO CONSOLE ERRORS OR WARNINGS');
  }

  await browser.close();
}

hunt().catch((e) => {
  console.error('Script failed:', e.message);
  process.exit(1);
});
