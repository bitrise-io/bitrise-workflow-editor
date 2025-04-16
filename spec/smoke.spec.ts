import { test, expect } from '@playwright/test';

const APP_ID = process.env.SMOKE_TEST_APP_ID || '';
const VERSION = process.env.NPM_PACKAGE_VERSION || '';
const USERNAME = process.env.SMOKE_TEST_USER_NAME || '';
const PASSWORD = process.env.SMOKE_TEST_USER_PASSWORD || '';

test('WFE is available', async ({ page }) => {
  expect(APP_ID).toBeTruthy();
  expect(VERSION).toBeTruthy();
  expect(USERNAME).toBeTruthy();
  expect(PASSWORD).toBeTruthy();

  await page.goto(`https://app.bitrise.io/app/${APP_ID}/workflow_editor?version=${VERSION}`);
  await page.waitForURL('**/users/sign_in');
  await page.click('text=Continue with Email');
  await page.fill('input[name="login"]', USERNAME);
  await page.fill('input[name="password"]', PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL(`**/app/${APP_ID}/workflow_editor?version=${VERSION}`);

  const frameLocator = page.locator('iframe[title="Workflow Editor"]');
  await frameLocator.waitFor({ state: 'attached' });
  await expect(frameLocator).toBeVisible();

  const contentFrame = frameLocator.contentFrame();
  await expect(contentFrame.getByText('Stack & Machine')).toBeVisible();
});
