import { chromium } from 'playwright';
import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';
import fs from 'fs';

const TARGET_URL = process.env.TARGET_URL || 'http://localhost:3000';
const CHROME_PATH = process.env.CHROME_PATH || '/home/runner/.cache/ms-playwright/chromium-1208/chrome-linux/chrome';

async function checkConsoleErrors() {
  console.log('🔍 BroCula is hunting for console errors...\n');
  
  const browser = await chromium.launch({ 
    headless: true,
    executablePath: CHROME_PATH
  });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  const consoleErrors = [];
  const consoleWarnings = [];
  
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    
    if (type === 'error') {
      consoleErrors.push({ type, text, location: msg.location() });
    } else if (type === 'warning') {
      consoleWarnings.push({ type, text });
    }
  });
  
  page.on('pageerror', error => {
    consoleErrors.push({ type: 'pageerror', text: error.message });
  });
  
  page.on('requestfailed', request => {
    consoleErrors.push({ 
      type: 'network', 
      text: `Failed to load: ${request.url()} - ${request.failure().errorText}` 
    });
  });
  
  try {
    await page.goto(TARGET_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    console.log('✅ Page loaded successfully\n');
    
    if (consoleErrors.length === 0 && consoleWarnings.length === 0) {
      console.log('🎉 No console errors or warnings found! The code is clean.\n');
    } else {
      if (consoleErrors.length > 0) {
        console.log(`❌ Found ${consoleErrors.length} console error(s):\n`);
        consoleErrors.forEach((err, i) => {
          console.log(`  ${i + 1}. [${err.type}] ${err.text}`);
        });
        console.log();
      }
      
      if (consoleWarnings.length > 0) {
        console.log(`⚠️  Found ${consoleWarnings.length} console warning(s):\n`);
        consoleWarnings.forEach((warn, i) => {
          console.log(`  ${i + 1}. [${warn.type}] ${warn.text}`);
        });
        console.log();
      }
    }
    
  } catch (error) {
    console.error('❌ Failed to load page:', error.message);
  } finally {
    await browser.close();
  }
  
  return { errors: consoleErrors, warnings: consoleWarnings };
}

async function runLighthouse() {
  console.log('🚀 Running Lighthouse audit...\n');
  
  let chrome;
  try {
    chrome = await chromeLauncher.launch({ 
      chromeFlags: ['--headless', '--no-sandbox', '--disable-gpu'],
      chromePath: CHROME_PATH
    });
    
    const options = {
      logLevel: 'error',
      output: 'json',
      onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
      port: chrome.port,
    };
    
    const runnerResult = await lighthouse(TARGET_URL, options);
    const reportJson = runnerResult.report;
    const report = JSON.parse(reportJson);
    
    fs.writeFileSync('lighthouse-report.json', reportJson);
    
    console.log('📊 Lighthouse Results:\n');
    console.log(`  Performance:    ${Math.round(report.categories.performance.score * 100)}`);
    console.log(`  Accessibility:  ${Math.round(report.categories.accessibility.score * 100)}`);
    console.log(`  Best Practices: ${Math.round(report.categories['best-practices'].score * 100)}`);
    console.log(`  SEO:            ${Math.round(report.categories.seo.score * 100)}\n`);
    
    const opportunities = report.audits;
    const importantAudits = [
      'unused-javascript',
      'unused-css-rules',
      'modern-image-formats',
      'efficiently-encode-images',
      'render-blocking-resources',
      'uses-long-cache-ttl',
      'uses-text-compression',
      'total-byte-weight',
      'dom-size',
    ];
    
    console.log('🔧 Optimization Opportunities:\n');
    let hasOpportunities = false;
    
    for (const auditId of importantAudits) {
      const audit = opportunities[auditId];
      if (audit && audit.score !== null && audit.score < 1) {
        hasOpportunities = true;
        console.log(`  • ${audit.title}`);
        if (audit.displayValue) {
          console.log(`    Potential savings: ${audit.displayValue}`);
        }
        console.log();
      }
    }
    
    console.log('📈 Diagnostics:\n');
    const diagnostics = [
      'bootup-time',
      'mainthread-work-breakdown',
      'script-bootup-time',
    ];
    
    for (const auditId of diagnostics) {
      const audit = opportunities[auditId];
      if (audit && audit.displayValue) {
        console.log(`  • ${audit.title}: ${audit.displayValue}`);
      }
    }
    console.log();
    
    if (!hasOpportunities) {
      console.log('  ✅ No significant optimization opportunities found!\n');
    }
    
    return report;
    
  } catch (error) {
    console.error('❌ Lighthouse audit failed:', error.message);
    return null;
  } finally {
    if (chrome) {
      await chrome.kill();
    }
  }
}

async function main() {
  console.log('╔═══════════════════════════════════════════════════╗');
  console.log('║  🧛‍♂️ BroCula - Browser Console Vampire Hunter    ║');
  console.log('╚═══════════════════════════════════════════════════╝\n');
  
  const results = await checkConsoleErrors();
  const lighthouseResults = await runLighthouse();
  
  if (results.errors.length > 0) {
    console.log('\n❌ FATAL: Console errors detected!');
    process.exit(1);
  }
  
  console.log('\n✅ BroCula has finished his hunt. All clean!');
  
  if (lighthouseResults) {
    const perfScore = lighthouseResults.categories.performance.score;
    if (perfScore < 0.9) {
      console.log(`\n⚠️  Performance score is ${Math.round(perfScore * 100)}/100. Check lighthouse-report.json for details.`);
    }
  }
  
  process.exit(0);
}

main().catch(err => {
  console.error('💀 BroCula encountered an error:', err);
  process.exit(1);
});
