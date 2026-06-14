#!/usr/bin/env node
/**
 * BroCula Scan - Browser console checker + Lighthouse audit
 * Uses Playwright to check for console errors/warnings and run Lighthouse.
 */
import { chromium } from '@playwright/test';
import { readFileSync, writeFileSync } from 'fs';

const URL = process.env.URL || 'http://localhost:3000';
const REPORT_DIR = '/tmp/brocula-report';

import { mkdirSync } from 'fs';
mkdirSync(REPORT_DIR, { recursive: true });

async function scanConsole() {
  console.log('=== BroCula Console Scan ===');
  console.log(`Navigating to ${URL}...`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  const errors = [];
  const warnings = [];
  const infos = [];

  page.on('console', (msg) => {
    const text = msg.text();
    if (msg.type() === 'error') errors.push(text);
    else if (msg.type() === 'warning') warnings.push(text);
    else infos.push(text);
  });

  page.on('pageerror', (err) => {
    errors.push(`PAGE ERROR: ${err.message}`);
  });

  // Navigate and wait for full load
  await page.goto(URL, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);

  // Scroll through the page to trigger lazy loads
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(1000);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(500);

  const result = { errors, warnings, infoCount: infos.length };

  // Save report
  writeFileSync(`${REPORT_DIR}/console.json`, JSON.stringify(result, null, 2));

  console.log(`\nErrors (${errors.length}):`);
  errors.forEach((e) => console.log(`  ❌ ${e}`));

  console.log(`\nWarnings (${warnings.length}):`);
  warnings.forEach((w) => console.log(`  ⚠️  ${w}`));

  console.log(`\nInfo messages: ${infos.length}`);

  await browser.close();
  return result;
}

async function runLighthouse() {
  console.log('\n=== BroCula Lighthouse Audit ===');

  // Use lighthouse CLI if available or built-in lighthouse package
  try {
    const { execSync } = await import('child_process');
    const { writeFileSync } = await import('fs');

    execSync(
      `npx lighthouse ${URL} --output=json --output-path=${REPORT_DIR}/lighthouse.json ` +
      `--chrome-flags="--headless --no-sandbox --disable-gpu" ` +
      `--only-categories=performance,accessibility,best-practices,seo ` +
      `--quiet`,
      { stdio: 'pipe', timeout: 120000 }
    );

    const report = JSON.parse(readFileSync(`${REPORT_DIR}/lighthouse.json`, 'utf-8'));
    const { categories } = report;
    const audits = report.audits;

    const scores = {};
    for (const [key, cat] of Object.entries(categories)) {
      scores[key] = Math.round(cat.score * 100);
    }

    // Collect important improvement opportunities
    const opportunities = [];
    for (const [id, audit] of Object.entries(audits)) {
      if (audit.score !== null && audit.score < 1 && audit.details?.type === 'opportunity') {
        opportunities.push({
          id: audit.id,
          title: audit.title,
          score: audit.score,
          description: audit.description,
          metricSavings: audit.metricSavings || {}
        });
      }
    }

    const result = { scores, opportunities };

    writeFileSync(`${REPORT_DIR}/lighthouse-summary.json`, JSON.stringify(result, null, 2));

    console.log('\nLighthouse Scores:');
    for (const [key, val] of Object.entries(scores)) {
      const icon = val >= 90 ? '🟢' : val >= 50 ? '🟡' : '🔴';
      console.log(`  ${icon} ${key}: ${val}`);
    }

    console.log(`\nTop Opportunities (${opportunities.length}):`);
    opportunities.slice(0, 10).forEach((opp) => {
      console.log(`  📈 ${opp.title} (${opp.id})`);
    });

    return result;
  } catch (err) {
    console.error(`Lighthouse error: ${err.message}`);
    return { scores: {}, opportunities: [] };
  }
}

const consoleResult = await scanConsole();

// Lighthouse needs its own browser context
const lhResult = await runLighthouse();

const summary = {
  console: consoleResult,
  lighthouse: lhResult,
  timestamp: new Date().toISOString()
};

writeFileSync(`${REPORT_DIR}/summary.json`, JSON.stringify(summary, null, 2));
console.log(`\n📄 Report saved to ${REPORT_DIR}/`);
