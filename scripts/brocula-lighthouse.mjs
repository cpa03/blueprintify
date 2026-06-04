import { launch } from 'chrome-launcher';
import lighthouse from 'lighthouse';
import { execSync } from 'child_process';
import fs from 'fs';

// Flexy says: No hardcoded preview URLs!
const PREVIEW_PORT = process.env.PREVIEW_PORT || '4173';
const PREVIEW_HOST = process.env.PREVIEW_HOST || 'localhost';
const PREVIEW_URL = process.env.PREVIEW_URL || `http://${PREVIEW_HOST}:${PREVIEW_PORT}`;

async function runLighthouse() {
  let chromePath;
  try {
    chromePath = execSync('find /home/runner/.cache/ms-playwright -name "chrome" -type f 2>/dev/null | head -1').toString().trim();
  } catch (e) {}

  const chrome = await launch({
    chromePath: chromePath || undefined,
    chromeFlags: ['--headless', '--no-sandbox', '--disable-gpu', '--window-size=1920,1080']
  });

  try {
    const options = {
      logLevel: 'error',
      output: 'json',
      onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
      port: chrome.port,
      preset: 'desktop'
    };

    const runnerResult = await lighthouse(PREVIEW_URL, options);
    const report = JSON.parse(runnerResult.report);

    console.log('=== LIGHTHOUSE SCORES ===');
    console.log(JSON.stringify({
      performance: Math.round(report.categories.performance.score * 100),
      accessibility: Math.round(report.categories.accessibility.score * 100),
      bestPractices: Math.round(report.categories['best-practices'].score * 100),
      seo: Math.round(report.categories.seo.score * 100),
    }));

    const importantAudits = [
      'uses-responsive-images', 'offscreen-images', 'unused-javascript',
      'unused-css-rules', 'modern-image-formats', 'render-blocking-resources',
      'uses-long-cache-ttl', 'uses-text-compression', 'total-byte-weight',
      'dom-size', 'bootup-time', 'mainthread-work-breakdown',
      'uses-rel-preconnect', 'uses-rel-prefetch', 'prioritize-lcp-image',
      'lcp-lazy-loaded', 'non-composited-animations', 'unsized-images',
      'unminified-javascript', 'unminified-css', 'uses-passive-event-listeners',
      'meta-description', 'document-title', 'font-display', 'crawlable-anchors',
      'image-alt', 'color-contrast', 'tap-targets',
      'aria-allowed-attr', 'aria-valid-attr'
    ];

    const opportunities = [];
    for (const auditId of importantAudits) {
      const audit = report.audits[auditId];
      if (audit && audit.score !== null && audit.score < 1) {
        const item = {
          id: auditId,
          title: audit.title,
          score: Math.round(audit.score * 100),
          displayValue: audit.displayValue || null,
          numericValue: audit.numericValue || null,
          items: []
        };
        if (audit.details && audit.details.items) {
          const items = Array.isArray(audit.details.items) ? audit.details.items.slice(0, 5) : [audit.details.items];
          item.items = items.map(i => ({
            url: i.url ? i.url.substring(0, 120) : null,
            wastedBytes: i.wastedBytes || null,
            wastedMs: i.wastedMs || null,
            label: i.label || null,
            source: i.source || null,
          }));
        }
        opportunities.push(item);
      }
    }

    console.log('=== OPPORTUNITIES ===');
    console.log(JSON.stringify(opportunities, null, 2));

    console.log('=== DIAGNOSTICS ===');
    const diagnostics = {};
    ['bootup-time', 'mainthread-work-breakdown', 'total-byte-weight', 'dom-size', 'network-rtt', 'network-server-latency'].forEach(id => {
      const a = report.audits[id];
      if (a && a.displayValue) diagnostics[id] = a.displayValue;
    });
    console.log(JSON.stringify(diagnostics, null, 2));

    console.log('=== METRICS (with scores) ===');
    const metricDetails = {};
    ['first-contentful-paint', 'largest-contentful-paint', 'total-blocking-time', 'cumulative-layout-shift', 'speed-index', 'interactive'].forEach(id => {
      const a = report.audits[id];
      if (a) metricDetails[id] = { score: a.score, displayValue: a.displayValue, numericValue: a.numericValue };
    });
    console.log(JSON.stringify(metricDetails, null, 2));

  } finally {
    await chrome.kill();
  }
}

runLighthouse().catch(e => {
  console.error('LIGHTHOUSE ERROR:', e.message);
  process.exit(1);
});
