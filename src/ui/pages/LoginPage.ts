import { expect, Page } from '@playwright/test';
import * as allure from 'allure-js-commons';
import { labels } from './labels';

export class LoginPage {
  constructor(private readonly page: Page) {}

  async open(): Promise<void> {
    await allure.step('Abrir la página de login', () => this.page.goto('/login'));
  }

  async signIn(email: string, password: string): Promise<void> {
    await allure.step('Iniciar sesión en el portal', async () => {
      await this.page.getByLabel(labels.login.email).fill(email);
      await this.page.getByLabel(labels.login.password).fill(password);
      await this.page.getByRole('button', { name: labels.login.submit }).click();
      await expect(this.page).not.toHaveURL(/\/login/);
    });
  }
}
