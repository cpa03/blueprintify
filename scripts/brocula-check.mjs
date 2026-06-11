// BroCula console error hunter - standalone runner
import { chromium } from 'playwright';

const TARGET_URL = process.env.TARGET_URL || 'http://localhost:4173';

async function checkConsoleErrors() {
  console.log('🧛‍♂️ BroCula is hunting for console errors...\n');

  const browser = await chromium.launch({ 
    headless: true,
    executablePath: '/home/runner/.cache/ms-playwright/chromium-1223/chrome-linux/chrome',
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

const results = await checkConsoleErrors();
if (results.errors.length > 0) {
  console.log('\n❌ FATAL: Console errors detected!');
  process.exit(1);
} else {
  console.log('\n✅ Console check passed!');
}
