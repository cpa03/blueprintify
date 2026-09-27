import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';
import { execSync } from 'child_process';
import fs from 'fs';

const TARGET_URL = process.env.TARGET_URL || 'http://localhost:4173';
const OUTPUT_FILE = process.env.LH_OUTPUT_FILE || 'lighthouse-report-warm.json';

let chrome;
try {
  const chromePath = execSync(
    'find /home/runner/.cache/ms-playwright -type f \\( -path "*/chrome-linux/chrome" -o -name "chrome" \\) 2>/dev/null | head -1'
  ).toString().trim();

  if (!chromePath) {
    console.error('Chrome binary not found in Playwright cache');
    process.exit(1);
  }

  chrome = await chromeLauncher.launch({
    chromePath,
    chromeFlags: ['--headless=old', '--no-sandbox', '--disable-gpu', '--allow-insecure-localhost', '--ignore-certificate-errors', '--window-size=1920,1080'],
  });

  const result = await Promise.race([
    lighthouse(TARGET_URL, {
      logLevel: 'error',
      output: 'json',
      onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
      port: chrome.port,
      preset: 'desktop',
    }),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Lighthouse timed out after 120s')), 120000)
    ),
  ]);

  const report = JSON.parse(result.report);
  const cats = report.categories;
  const scores = ['performance', 'accessibility', 'best-practices', 'seo'].map((c) => {
    const s = cats[c]?.score;
    return s === null || s === undefined ? 'N/A' : Math.round(s * 100);
  });
  console.log('WARM PASS:', ...scores);

  const audits = report.audits;
  const savings = Object.values(audits).filter((a) => a.details && a.details.overallSavingsMs > 0);
  console.log('savings>0 audits:', savings.length);
  if (savings.length) {
    savings.forEach((s) => console.log('  -', s.title, s.displayValue));
  }
  const metrics = ['first-contentful-paint', 'largest-contentful-paint', 'total-blocking-time', 'cumulative-layout-shift', 'total-byte-weight'];
  for (const m of metrics) {
    const audit = audits[m];
    if (!audit) {
      console.log(m + ': MISSING');
      continue;
    }
    console.log(m + ':', audit.displayValue || audit.numericValue);
  }

  fs.writeFileSync(OUTPUT_FILE, result.report);
  await chrome.kill();
  chrome = null;
  process.exit(0);
} catch (e) {
  console.error('WARM PASS FAILED:', e.message);
  if (chrome) {
    await chrome.kill().catch(() => {});
  }
  process.exit(1);
}