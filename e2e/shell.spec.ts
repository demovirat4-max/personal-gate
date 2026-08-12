import { test, expect } from '@playwright/test';

test.describe('Phase 1 - Phase 4 Playwright Comprehensive Suite', () => {
  test('1. Root URL / renders Mission Control title', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible();
    await expect(page.getByText('Mission Control')).toBeVisible();
  });

  test('2. Mission Control renders key cards', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('GATE CS/IT 2028')).toBeVisible();
    await expect(page.getByText('Lessons Completed')).toBeVisible();
  });

  test('3. Direct refresh of every primary route does not produce a 404', async ({ page }) => {
    const routes = ['/', '/mission', '/learn', '/practice', '/revision', '/progress', '/strategy', '/settings'];
    for (const route of routes) {
      await page.goto(route);
      await page.reload();
      await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible();
    }
  });

  test('4. Viewport horizontal overflow checks across required sizes', async ({ page }) => {
    const viewports = [
      { width: 360, height: 800 },
      { width: 390, height: 844 },
      { width: 768, height: 1024 },
      { width: 1024, height: 768 },
      { width: 1440, height: 900 },
    ];

    for (const vp of viewports) {
      await page.setViewportSize(vp);
      await page.goto('/');
      const bodyHandle = await page.$('body');
      expect(bodyHandle).not.toBeNull();
      if (bodyHandle) {
        const scrollWidth = await page.evaluate((el) => el.scrollWidth, bodyHandle);
        const clientWidth = await page.evaluate((el) => el.clientWidth, bodyHandle);
        expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
      }
    }
  });
});
