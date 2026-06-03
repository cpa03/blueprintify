import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';
import { execSync } from 'child_process';

async function main() {
  const chromePath = execSync('find /home/runner/.cache/ms-playwright -name "chrome" -type f 2>/dev/null | head -1').toString().trim();
  const chrome = await chromeLauncher.launch({
    chromePath,
    chromeFlags: ['--headless', '--no-sandbox', '--disable-gpu', '--window-size=1920,1080'],
  });
  const result = await lighthouse('http://127.0.0.1:4173', {
    logLevel: 'error',
    output: 'json',
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
    port: chrome.port,
  });
  const r = JSON.parse(result.report);
  console.log('Scores: ' + Math.round(r.categories.performance.score*100) + '/' + Math.round(r.categories.accessibility.score*100) + '/' + Math.round(r.categories['best-practices'].score*100) + '/' + Math.round(r.categories.seo.score*100));
  console.log('FCP: ' + (r.audits['first-contentful-paint']?.numericValue/1000).toFixed(2) + 's (' + Math.round(r.audits['first-contentful-paint']?.score*100) + ')');
  console.log('LCP: ' + (r.audits['largest-contentful-paint']?.numericValue/1000).toFixed(2) + 's (' + Math.round(r.audits['largest-contentful-paint']?.score*100) + ')');
  console.log('TBT: ' + (r.audits['total-blocking-time']?.numericValue || '?') + 'ms (' + Math.round(r.audits['total-blocking-time']?.score*100) + ')');
  console.log('CLS: ' + (r.audits['cumulative-layout-shift']?.numericValue || '?') + ' (' + Math.round(r.audits['cumulative-layout-shift']?.score*100) + ')');
  console.log('SI: ' + (r.audits['speed-index']?.numericValue/1000).toFixed(2) + 's (' + Math.round(r.audits['speed-index']?.score*100) + ')');

  const ujs = r.audits['unused-javascript'];
  if (ujs && ujs.details?.items) {
    ujs.details.items.forEach(i => {
      const pct = i.totalBytes > 0 ? Math.round(i.wastedBytes/i.totalBytes*100) : 0;
      console.log('UnusedJS: ' + (i.url||'').substring(0,80) + ' -> ' + (i.wastedBytes/1024).toFixed(1) + '/' + (i.totalBytes/1024).toFixed(1) + ' KiB (' + pct + '%)');
    });
  }

  await chrome.kill();
}

main().catch(e => { console.error(e); process.exit(1); });
