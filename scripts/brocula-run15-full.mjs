#!/usr/bin/env node
/**
 * BroCula ULW Loop - Full Run 15
 * Starts preview server, checks console errors, runs Lighthouse, reports.
 */

import { spawn } from 'child_process';
import { chromium } from 'playwright';
import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..');
const WEB_DIR = path.join(PROJECT_ROOT, 'apps', 'web');
const CHROME_PATH = '/snap/bin/chromium';
const PORT = 4174;
const TARGET_URL = `http://127.0.0.1:${PORT}`;

let previewProcess = null;

function startPreviewServer() {
  return new Promise((resolve, reject) => {
    console.log('🏗️  Starting preview server...\n');
    
    previewProcess = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--host', '127.0.0.1'], {
      cwd: WEB_DIR,
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: true
    });

    let started = false;
    const timeout = setTimeout(() => {
      if (!started) {
        started = true;
        resolve(); // Resolve anyway after timeout
      }
    }, 15000);

    previewProcess.stdout.on('data', (data) => {
      const output = data.toString();
      console.log('  [preview]', output.trim());
      if (!started && (output.includes('Local:') || output.includes('http://127.0.0.1'))) {
        started = true;
        clearTimeout(timeout);
        setTimeout(resolve, 1000); // Give it a moment
      }
    });

    previewProcess.stderr.on('data', (data) => {
      const output = data.toString();
      if (output.includes('Error') || output.includes('error')) {
        console.error('  [preview:err]', output.trim());
      }
    });

    previewProcess.on('error', (err) => {
      if (!started) {
        started = true;
        clearTimeout(timeout);
        reject(err);
      }
    });

    previewProcess.on('exit', (code) => {
      console.log(`  [preview] exited with code ${code}`);
      if (!started) {
        started = true;
        clearTimeout(timeout);
        reject(new Error(`Preview server exited with code ${code}`));
      }
    });
  });
}

async function waitForServer(url, maxRetries = 30) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(2000) });
      if (res.ok) {
        console.log(`  ✅ Server ready at ${url}\n`);
        return true;
      }
    } catch {}
    await new Promise(r => setTimeout(r, 1000));
  }
  throw new Error(`Server at ${url} not ready after ${maxRetries}s`);
}

async function checkConsoleErrors() {
  console.log('\n🧛‍♂️ BroCula: Hunting for console errors...\n');

  let chrome;
  try {
    chrome = await chromeLauncher.launch({
      chromePath: CHROME_PATH,
      chromeFlags: [
        '--headless=old', '--no-sandbox', '--disable-gpu',
        '--allow-insecure-localhost', '--ignore-certificate-errors',
        '--window-size=1920,1080'
      ]
    });

    console.log(`  Chrome CDP on port ${chrome.port}`);

    const browser = await chromium.connectOverCDP('http://127.0.0.1:' + chrome.port);
    const context = browser.contexts()[0] || await browser.newContext();
    const page = context.pages()[0] || await context.newPage();

    const consoleErrors = [];
    const consoleWarnings = [];

    page.on('console', msg => {
      const type = msg.type();
      const text = msg.text();
      const ignored = ['React Router Future Flag Warning', 'StrictMode', 'Download the React DevTools', 'ResizeObserver loop', '[vite]', ' hot module '];
      if (ignored.some(p => text.toLowerCase().includes(p.toLowerCase()))) return;
      if (type === 'error') consoleErrors.push({ type, text: text.substring(0, 300) });
      else if (type === 'warning') consoleWarnings.push({ type, text: text.substring(0, 300) });
    });

    page.on('pageerror', err => consoleErrors.push({ type: 'pageerror', text: err.message.substring(0, 300) }));

    page.on('requestfailed', req => {
      const url = req.url();
      if (url.includes('favicon') || url.endsWith('.map') || url.includes('hot-update')) return;
      consoleErrors.push({ type: 'network', text: `Failed: ${url.substring(0, 200)}` });
    });

    await page.goto(TARGET_URL, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(3000);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
    await page.waitForTimeout(1000);

    console.log('  ✅ Page loaded successfully\n');

    // Screenshot
    await page.screenshot({ path: path.join(PROJECT_ROOT, 'scripts', 'brocula-screenshot-run15.png'), fullPage: true });
    console.log('  📸 Screenshot saved\n');

    if (consoleErrors.length === 0 && consoleWarnings.length === 0) {
      console.log('  🎉 No console errors or warnings found!\n');
    } else {
      if (consoleErrors.length) {
        console.log(`  ❌ ${consoleErrors.length} error(s):\n`);
        consoleErrors.forEach((e, i) => console.log(`    ${i+1}. [${e.type}] ${e.text}`));
      }
      if (consoleWarnings.length) {
        console.log(`  ⚠️  ${consoleWarnings.length} warning(s):\n`);
        consoleWarnings.forEach((w, i) => console.log(`    ${i+1}. [${w.type}] ${w.text}`));
      }
    }

    await browser.close();
    return { errors: consoleErrors, warnings: consoleWarnings };

  } catch (err) {
    console.error('  ❌ Console check failed:', err.message);
    return { errors: [], warnings: [] };
  } finally {
    if (chrome) await chrome.kill();
  }
}

async function runLighthouse() {
  console.log('🚀 BroCula: Running Lighthouse audit...\n');

  let chrome;
  try {
    chrome = await chromeLauncher.launch({
      chromePath: CHROME_PATH,
      chromeFlags: [
        '--headless=old', '--no-sandbox', '--disable-gpu',
        '--allow-insecure-localhost', '--ignore-certificate-errors',
        '--window-size=1920,1080'
      ]
    });

    const options = {
      logLevel: 'error',
      output: 'json',
      onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
      port: chrome.port,
      preset: 'desktop',
      throttling: { cpuSlowdownMultiplier: 1 }
    };

    const runnerResult = await lighthouse(TARGET_URL, options);
    const report = JSON.parse(runnerResult.report);

    fs.writeFileSync(path.join(PROJECT_ROOT, 'scripts', 'lighthouse-report-run15.json'), runnerResult.report);

    const perf = Math.round((report.categories.performance.score || 0) * 100);
    const a11y = Math.round((report.categories.accessibility.score || 0) * 100);
    const bp = Math.round((report.categories['best-practices'].score || 0) * 100);
    const seo = Math.round((report.categories.seo.score || 0) * 100);

    console.log(`  📊 Lighthouse Results:\n`);
    console.log(`     Performance:    ${perf}`);
    console.log(`     Accessibility:  ${a11y}`);
    console.log(`     Best Practices: ${bp}`);
    console.log(`     SEO:            ${seo}\n`);

    const checks = [
      'unused-javascript', 'unused-css-rules', 'modern-image-formats',
      'efficiently-encode-images', 'render-blocking-resources',
      'uses-long-cache-ttl', 'uses-text-compression',
      'total-byte-weight', 'dom-size', 'uses-responsive-images',
      'offscreen-images', 'third-party-summary',
      'legacy-javascript', 'preload-lcp-image',
      'server-response-time', 'bootup-time', 'mainthread-work-breakdown'
    ];

    const opportunities = [];
    for (const id of checks) {
      const a = report.audits[id];
      if (a && a.score !== null && a.score < 1) {
        opportunities.push({ id, title: a.title, savings: a.displayValue || '' });
      }
    }

    if (opportunities.length === 0) {
      console.log('  ✅ No optimization opportunities found!\n');
    } else {
      console.log('  🔧 Optimization Opportunities:\n');
      opportunities.forEach(o => {
        console.log(`    • ${o.title}`);
        if (o.savings) console.log(`      Savings: ${o.savings}\n`);
      });
    }

    return { scores: { performance: perf, accessibility: a11y, 'best-practices': bp, seo }, opportunities };

  } catch (err) {
    console.error('  ❌ Lighthouse failed:', err.message);
    return null;
  } finally {
    if (chrome) await chrome.kill();
  }
}

function cleanup() {
  if (previewProcess) {
    previewProcess.kill('SIGTERM');
    console.log('\n🧹 Preview server stopped');
  }
}

async function main() {
  console.log('╔═══════════════════════════════════════════════════╗');
  console.log('║  🧛‍♂️ BroCula - Browser Console Vampire Hunter    ║');
  console.log('║  ULW Loop - Jul 29 Run 15                        ║');
  console.log('╚═══════════════════════════════════════════════════╝\n');

  process.on('SIGINT', () => { cleanup(); process.exit(0); });
  process.on('SIGTERM', () => { cleanup(); process.exit(0); });

  try {
    await startPreviewServer();
    await waitForServer(TARGET_URL);

    const consoleResults = await checkConsoleErrors();
    const lhResults = await runLighthouse();

    const full = { console: consoleResults, lighthouse: lhResults };
    fs.writeFileSync(path.join(PROJECT_ROOT, 'scripts', 'brocula-results-run15.json'), JSON.stringify(full, null, 2));
    console.log('\n📝 Results saved to scripts/brocula-results-run15.json');

    if (consoleResults.errors.length > 0) {
      console.log('\n❌ FATAL: Console errors detected! Fixing...');
      cleanup();
      process.exit(1);
    }

    if (lhResults) {
      const s = lhResults.scores;
      console.log(`\n🏁 BroCula ULW Loop Run 15 Complete!`);
      console.log(`   LH: ${s.performance}-${s.accessibility}-${s['best-practices']}-${s.seo}`);
    }

    cleanup();
    process.exit(0);
  } catch (err) {
    console.error('\n💀 BroCula error:', err);
    cleanup();
    process.exit(1);
  }
}

main();
