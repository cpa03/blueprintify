import { chromium } from "@playwright/test";
import { execSync } from "child_process";

async function checkConsoleErrors() {
  console.log("🧛‍♂️ BroCula is hunting for console errors...\n");

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const errors = [];
  const warnings = [];

  page.on("console", (msg) => {
    const type = msg.type();
    const text = msg.text();
    if (type === "error") {
      errors.push({ type, text });
    } else if (type === "warning") {
      warnings.push({ type, text });
    }
  });

  page.on("pageerror", (error) => {
    errors.push({ type: "pageerror", text: error.message });
  });

  try {
    await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
    await page.waitForTimeout(3000);

    console.log("=== CONSOLE ANALYSIS ===\n");

    if (errors.length === 0) {
      console.log("✅ NO CONSOLE ERRORS FOUND!");
    } else {
      console.log(`❌ FOUND ${errors.length} CONSOLE ERROR(S):`);
      errors.forEach((err, i) => {
        console.log(`  ${i + 1}. [${err.type}] ${err.text}`);
      });
    }

    console.log("\n");

    if (warnings.length === 0) {
      console.log("✅ NO CONSOLE WARNINGS FOUND!");
    } else {
      console.log(`⚠️ FOUND ${warnings.length} CONSOLE WARNING(S):`);
      warnings.forEach((warn, i) => {
        console.log(`  ${i + 1}. [${warn.type}] ${warn.text}`);
      });
    }

    console.log("\n=== NETWORK ANALYSIS ===\n");

    const failedRequests = [];
    page.on("response", (response) => {
      if (response.status() >= 400) {
        failedRequests.push({
          url: response.url(),
          status: response.status(),
        });
      }
    });

    await page.reload({ waitUntil: "networkidle" });
    await page.waitForTimeout(2000);

    if (failedRequests.length === 0) {
      console.log("✅ NO FAILED NETWORK REQUESTS!");
    } else {
      console.log(`❌ FOUND ${failedRequests.length} FAILED REQUEST(S):`);
      failedRequests.forEach((req, i) => {
        console.log(`  ${i + 1}. [${req.status}] ${req.url}`);
      });
    }

    console.log("\n🧛‍♂️ BroCula has finished his hunt!");
  } catch (error) {
    console.error("Error during analysis:", error);
  } finally {
    await browser.close();
  }
}

checkConsoleErrors();
