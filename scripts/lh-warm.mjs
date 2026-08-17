import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';
import { execSync } from 'child_process';
import fs from 'fs';

const TARGET_URL = process.env.TARGET_URL || 'http://localhost:4173';

try {
  const chromePath = execSync(
    'find /home/runner/.cache/ms-playwright -type f \\( -path "*/chrome-linux/chrome" -o -name "chrome" \\) 2>/dev/null | head -1'
  ).toString().trim();

  const chrome = await chromeLauncher.launch({
    chromePath,
    chromeFlags: ['--headless=old', '--no-sandbox', '--disable-gpu', '--allow-insecure-localhost', '--ignore-certificate-errors', '--window-size=1920,1080'],
  });

  const result = await lighthouse(TARGET_URL, {
    logLevel: 'error',
    output: 'json',
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
    port: chrome.port,
    preset: 'desktop',
  });

  const report = JSON.parse(result.report);
  const cats = report.categories;
  console.log('WARM PASS:', Math.round(cats.performance.score * 100), Math.round(cats.accessibility.score * 100), Math.round(cats['best-practices'].score * 100), Math.round(cats.seo.score * 100));

  const audits = report.audits;
  const savings = Object.values(audits).filter((a) => a.details && a.details.overallSavingsMs > 0);
  console.log('savings>0 audits:', savings.length);
  if (savings.length) {
    savings.forEach((s) => console.log('  -', s.title, s.displayValue));
  }
  const metrics = ['first-contentful-paint', 'largest-contentful-paint', 'total-blocking-time', 'cumulative-layout-shift', 'total-byte-weight'];
  for (const m of metrics) console.log(m + ':', audits[m].displayValue || audits[m].numericValue);

  fs.writeFileSync('lighthouse-report-warm.json', result.report);
  await chrome.kill();
  process.exit(0);
} catch (e) {
  console.error('WARM PASS FAILED:', e.message);
  process.exit(1);
}
