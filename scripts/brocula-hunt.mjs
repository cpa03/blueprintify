import { chromium } from 'playwright';
import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';
import fs from 'fs';
import { spawn, execSync } from 'child_process';
import path from 'path';

const CHROME_PATH = process.env.CHROME_PATH || undefined;
let previewServer = null;
let TARGET_URL = process.env.TARGET_URL || 'http://localhost:4173';

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
    
    // Filter out known development-only warnings
    const ignoredPatterns = [
      'React Router Future Flag Warning',
      'StrictMode',
      'Download the React DevTools',
      'ResizeObserver loop',
      '[vite]',
      ' hot module '
    ];
    
    const shouldIgnore = ignoredPatterns.some(pattern => 
      text.toLowerCase().includes(pattern.toLowerCase())
    );
    
    if (shouldIgnore) return;
    
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
    // Ignore favicon and source map failures
    const url = request.url();
    if (url.includes('favicon') || url.endsWith('.map')) return;
    
    consoleErrors.push({ 
      type: 'network', 
      text: `Failed to load: ${url} - ${request.failure().errorText}` 
    });
  });
  
  try {
    console.log(`Navigating to ${TARGET_URL}...`);
    await page.goto(TARGET_URL, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(3000);
    
    // Scroll to trigger LCP and ensure all content loads
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight / 2);
    });
    await page.waitForTimeout(1000);
    
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
    // Find Chromium path dynamically
    let chromePath = CHROME_PATH;
    if (!chromePath) {
      try {
        chromePath = execSync('find /home/runner/.cache/ms-playwright -name "chrome" -type f 2>/dev/null | head -1').toString().trim();
      } catch (e) {
        chromePath = undefined;
      }
    }
    
    console.log(`Using Chrome path: ${chromePath || 'system default'}\n`);
    
    const launchOptions = {
      chromeFlags: ['--headless', '--no-sandbox', '--disable-gpu', '--window-size=1920,1080']
    };
    
    if (chromePath) {
      launchOptions.chromePath = chromePath;
    }
    
    chrome = await chromeLauncher.launch(launchOptions);
    
    const options = {
      logLevel: 'error',
      output: 'json',
      onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
      port: chrome.port,
      preset: 'desktop'
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

async function buildAndServe() {
  console.log('🏗️  Building production app...\n');
  
  try {
    // Build the app
    execSync('npm run build', { 
      cwd: '/home/runner/work/blueprintify/blueprintify/apps/web',
      stdio: 'inherit'
    });
    
    console.log('\n✅ Build successful!\n');
    
    // Start preview server with compression
    return new Promise((resolve, reject) => {
      const previewProcess = spawn('npx', ['vite', 'preview', '--port', '4173'], {
        cwd: '/home/runner/work/blueprintify/blueprintify/apps/web',
        stdio: 'pipe'
      });
      
      previewServer = previewProcess;
      
      previewProcess.stdout.on('data', (data) => {
        const output = data.toString();
        if (output.includes('Local:') || output.includes('http://localhost:4173')) {
          console.log('🚀 Preview server ready!\n');
          setTimeout(resolve, 1000); // Give server a moment to fully start
        }
      });
      
      previewProcess.stderr.on('data', (data) => {
        const output = data.toString();
        if (output.includes('EADDRINUSE')) {
          // Port already in use, server might already be running
          resolve();
        }
      });
      
      previewProcess.on('error', reject);
      
      // Timeout after 30 seconds
      setTimeout(() => {
        resolve();
      }, 30000);
    });
  } catch (error) {
    console.error('❌ Build failed:', error.message);
    throw error;
  }
}

function cleanup() {
  if (previewServer) {
    console.log('\n🧹 Cleaning up preview server...');
    previewServer.kill();
  }
}

async function main() {
  console.log('╔═══════════════════════════════════════════════════╗');
  console.log('║  🧛‍♂️ BroCula - Browser Console Vampire Hunter    ║');
  console.log('╚═══════════════════════════════════════════════════╝\n');
  
  // Setup cleanup on exit
  process.on('SIGINT', () => { cleanup(); process.exit(0); });
  process.on('SIGTERM', () => { cleanup(); process.exit(0); });
  
  try {
    // Build and serve production app
    await buildAndServe();
    
    const results = await checkConsoleErrors();
    const lighthouseResults = await runLighthouse();
    
    if (results.errors.length > 0) {
      console.log('\n❌ FATAL: Console errors detected!');
      cleanup();
      process.exit(1);
    }
    
    console.log('\n✅ BroCula has finished his hunt. All clean!');
    
    if (lighthouseResults) {
      const perfScore = lighthouseResults.categories.performance.score;
      if (perfScore < 0.9) {
        console.log(`\n⚠️  Performance score is ${Math.round(perfScore * 100)}/100. Check lighthouse-report.json for details.`);
      } else {
        console.log(`\n🎉 Performance score is ${Math.round(perfScore * 100)}/100 - Excellent!`);
      }
    }
    
    cleanup();
    process.exit(0);
  } catch (error) {
    console.error('\n💀 BroCula encountered an error:', error.message);
    cleanup();
    process.exit(1);
  }
}

main().catch(err => {
  console.error('💀 BroCula encountered an error:', err);
  process.exit(1);
});
