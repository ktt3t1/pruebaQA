import { After, AfterAll, Before, BeforeAll, ITestCaseHookParameter, Status } from '@cucumber/cucumber';
import { Browser, chromium, expect } from '@playwright/test';
import * as allure from 'allure-js-commons';
import { config } from '../config/env';
import { DocumentsPage } from '../ui/pages/DocumentsPage';
import { LoginPage } from '../ui/pages/LoginPage';
import { CustomWorld } from './world';

let browser: Browser;

BeforeAll(async () => {
  expect.configure({ timeout: config.timeoutMs });
  browser = await chromium.launch({ headless: config.headless });
});

AfterAll(async () => {
  await browser.close();
});

Before({ tags: '@ui' }, async function (this: CustomWorld) {
  this.context = await browser.newContext({ baseURL: config.baseUrl });
  // Mismo runId para API y UI: el portal lee la clave antes de renderizar.
  await this.context.addInitScript(
    ([key, value]) => window.localStorage.setItem(key, value),
    [config.runIdStorageKey, this.runId] as [string, string],
  );
  this.page = await this.context.newPage();
  this.page.setDefaultTimeout(config.timeoutMs);
  this.uiPages = { login: new LoginPage(this.page), documents: new DocumentsPage(this.page) };
});

After({ tags: '@ui' }, async function (this: CustomWorld, scenario: ITestCaseHookParameter) {
  if (scenario.result?.status === Status.FAILED && this.page) {
    await allure.attachment('Captura al fallar', await this.page.screenshot({ fullPage: true }), 'image/png');
    await allure.attachment('URL al fallar', this.page.url(), 'text/plain');
  }
  await this.context?.close();
});
