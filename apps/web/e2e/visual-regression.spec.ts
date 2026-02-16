import { test, expect } from "@playwright/test";

test.describe("Visual Regression: M2 UI Workflows", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
  });

  test.describe("Landing Page", () => {
    test("should match landing page snapshot", async ({ page }) => {
      await expect(page).toHaveScreenshot("landing-page.png", {
        fullPage: true,
      });
    });

    test("should match landing page snapshot in dark mode", async ({
      page,
    }) => {
      await page.emulateMedia({ colorScheme: "dark" });
      await page.reload();
      await page.waitForLoadState("networkidle");

      await expect(page).toHaveScreenshot("landing-page-dark.png", {
        fullPage: true,
      });
    });
  });

  test.describe("Wizard Flow", () => {
    test("should match wizard step 1 snapshot", async ({ page }) => {
      await page.click('text="Get Started"');
      await page.waitForSelector('[data-testid="wizard-step-1"]', {
        state: "visible",
      });

      await expect(page).toHaveScreenshot("wizard-step-1.png");
    });

    test("should match wizard step 2 snapshot", async ({ page }) => {
      await page.click('text="Get Started"');
      await page.waitForSelector('[data-testid="wizard-step-1"]');

      await page.fill('input[name="projectName"]', "Test Project");
      await page.fill(
        'textarea[name="description"]',
        "A test project for visual regression",
      );

      await page.click('button:has-text("Next")');
      await page.waitForSelector('[data-testid="wizard-step-2"]', {
        state: "visible",
      });

      await expect(page).toHaveScreenshot("wizard-step-2.png");
    });

    test("should match wizard step 3 snapshot", async ({ page }) => {
      await page.click('text="Get Started"');
      await page.waitForSelector('[data-testid="wizard-step-1"]');

      await page.fill('input[name="projectName"]', "Test Project");
      await page.fill(
        'textarea[name="description"]',
        "A test project for visual regression",
      );

      await page.click('button:has-text("Next")');
      await page.waitForSelector('[data-testid="wizard-step-2"]');

      await page.click('button:has-text("Next")');
      await page.waitForSelector('[data-testid="wizard-step-3"]', {
        state: "visible",
      });

      await expect(page).toHaveScreenshot("wizard-step-3.png");
    });
  });

  test.describe("Split-Pane Editor", () => {
    test("should match editor view snapshot", async ({ page }) => {
      await page.goto("/editor");
      await page.waitForSelector('[data-testid="split-pane-editor"]', {
        state: "visible",
      });

      await expect(page).toHaveScreenshot("editor-view.png");
    });

    test("should match editor with content snapshot", async ({ page }) => {
      await page.goto("/editor");
      await page.waitForSelector('[data-testid="split-pane-editor"]');

      const testContent = `# Test Project

## Overview
This is a test blueprint.

## Architecture
- React frontend
- Node.js backend`;

      await page.fill('[data-testid="code-editor"] textarea', testContent);
      await page.waitForTimeout(500);

      await expect(page).toHaveScreenshot("editor-with-content.png");
    });
  });

  test.describe("Refinement Panel", () => {
    test("should match refinement panel snapshot", async ({ page }) => {
      await page.goto("/editor");
      await page.waitForSelector('[data-testid="split-pane-editor"]');

      await page.click('[data-testid="refine-button"]');
      await page.waitForSelector('[data-testid="refinement-panel"]', {
        state: "visible",
      });

      await expect(page).toHaveScreenshot("refinement-panel.png");
    });

    test("should match refinement with instruction snapshot", async ({
      page,
    }) => {
      await page.goto("/editor");
      await page.waitForSelector('[data-testid="split-pane-editor"]');

      await page.click('[data-testid="refine-button"]');
      await page.waitForSelector('[data-testid="refinement-panel"]');

      await page.fill(
        '[data-testid="refinement-input"]',
        "Add more technical details",
      );

      await expect(page).toHaveScreenshot("refinement-with-input.png");
    });
  });

  test.describe("Export Dialog", () => {
    test("should match export dialog snapshot", async ({ page }) => {
      await page.goto("/editor");
      await page.waitForSelector('[data-testid="split-pane-editor"]');

      await page.click('[data-testid="export-button"]');
      await page.waitForSelector('[data-testid="export-dialog"]', {
        state: "visible",
      });

      await expect(page).toHaveScreenshot("export-dialog.png");
    });

    test("should match export with format selected snapshot", async ({
      page,
    }) => {
      await page.goto("/editor");
      await page.waitForSelector('[data-testid="split-pane-editor"]');

      await page.click('[data-testid="export-button"]');
      await page.waitForSelector('[data-testid="export-dialog"]');

      await page.selectOption('[data-testid="export-format"]', "zip");

      await expect(page).toHaveScreenshot("export-zip-selected.png");
    });
  });

  test.describe("Storage Management", () => {
    test("should match storage panel snapshot", async ({ page }) => {
      await page.goto("/editor");
      await page.waitForSelector('[data-testid="split-pane-editor"]');

      await page.click('[data-testid="storage-menu-button"]');
      await page.waitForSelector('[data-testid="storage-panel"]', {
        state: "visible",
      });

      await expect(page).toHaveScreenshot("storage-panel.png");
    });

    test("should match storage with saved projects snapshot", async ({
      page,
    }) => {
      await page.goto("/editor");
      await page.waitForSelector('[data-testid="split-pane-editor"]');

      await page.evaluate(() => {
        localStorage.setItem(
          "blueprintify-projects",
          JSON.stringify([
            {
              id: "1",
              name: "Project 1",
              lastModified: new Date().toISOString(),
            },
            {
              id: "2",
              name: "Project 2",
              lastModified: new Date().toISOString(),
            },
          ]),
        );
      });

      await page.click('[data-testid="storage-menu-button"]');
      await page.waitForSelector('[data-testid="storage-panel"]');

      await expect(page).toHaveScreenshot("storage-with-projects.png");
    });
  });

  test.describe("Error States", () => {
    test("should match error state snapshot", async ({ page }) => {
      await page.goto("/editor");
      await page.waitForSelector('[data-testid="split-pane-editor"]');

      await page.evaluate(() => {
        const error = new Error("Test error");
        window.dispatchEvent(
          new CustomEvent("app-error", {
            detail: { message: "Something went wrong" },
          }),
        );
      });

      await page.waitForSelector('[data-testid="error-toast"]', {
        state: "visible",
      });

      await expect(page).toHaveScreenshot("error-toast.png");
    });
  });

  test.describe("Mobile Responsiveness", () => {
    test("should match mobile wizard view", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.click('text="Get Started"');
      await page.waitForSelector('[data-testid="wizard-step-1"]');

      await expect(page).toHaveScreenshot("mobile-wizard.png");
    });

    test("should match mobile editor view", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto("/editor");
      await page.waitForSelector('[data-testid="split-pane-editor"]');

      await expect(page).toHaveScreenshot("mobile-editor.png");
    });
  });
});
