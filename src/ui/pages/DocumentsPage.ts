import { expect, Locator, Page } from '@playwright/test';
import * as allure from 'allure-js-commons';
import { EditableFields, NewDocument } from '../../api/types';
import { formatClp } from '../../support/data';
import { DocumentFormPage } from './DocumentFormPage';
import { labels } from './labels';

export interface RowKey {
  folio: number;
  rutReceptor: string;
  monto: number;
}

const isDocumentsList = (url: string, method: string, expected: string): boolean => {
  const u = new URL(url);
  return u.pathname === '/api/documents' && expected === method;
};

export class DocumentsPage {
  private readonly form: DocumentFormPage;

  constructor(private readonly page: Page) {
    this.form = new DocumentFormPage(page);
  }

  /** Fila exacta: folio + RUT + monto (nunca first()/nth()). */
  row({ folio, rutReceptor, monto }: RowKey): Locator {
    const cell = (name: string) => this.page.getByRole('cell', { name, exact: true });
    return this.page
      .getByRole('row')
      .filter({ has: cell(String(folio)) })
      .filter({ has: cell(rutReceptor) })
      .filter({ has: cell(formatClp(monto)) });
  }

  private action(row: Locator, name: RegExp): Locator {
    return row.getByRole('button', { name }).or(row.getByRole('link', { name }));
  }

  async filterByRut(rut: string): Promise<void> {
    await allure.step(`Filtrar por RUT ${rut}`, async () => {
      await this.page.getByLabel(labels.filter.rut).fill(rut);
      const loaded = this.page.waitForResponse(
        (r) => isDocumentsList(r.url(), r.request().method(), 'GET') && new URL(r.url()).searchParams.has('rut'),
      );
      await this.page.getByRole('button', { name: labels.filter.apply }).click();
      await loaded;
    });
  }

  async createDocument(data: NewDocument): Promise<void> {
    await allure.step(`Emitir documento folio ${data.folio}`, async () => {
      await this.page.getByRole('button', { name: labels.newDocument }).click();
      await this.form.fill(data);
      const created = this.page.waitForResponse((r) => isDocumentsList(r.url(), r.request().method(), 'POST'));
      await this.form.submit(labels.form.submitCreate);
      expect((await created).status()).toBe(201);
    });
  }

  async editDocument(key: RowKey, changes: EditableFields): Promise<void> {
    await allure.step(`Editar documento folio ${key.folio}`, async () => {
      await this.action(this.row(key), labels.row.edit).click();
      await this.form.fill(changes);
      const updated = this.page.waitForResponse((r) => /\/api\/documents\/[^/]+$/.test(new URL(r.url()).pathname) && ['PUT', 'PATCH'].includes(r.request().method()));
      await this.form.submit(labels.form.submitEdit);
      expect((await updated).status()).toBe(200);
    });
  }

  async deleteDocument(key: RowKey): Promise<void> {
    await allure.step(`Eliminar documento folio ${key.folio} (con confirmación)`, async () => {
      await this.action(this.row(key), labels.row.remove).click();
      const deleted = this.page.waitForResponse((r) => r.request().method() === 'DELETE');
      await this.page.getByRole('dialog').getByRole('button', { name: labels.confirmDelete }).click();
      expect((await deleted).status()).toBe(204);
    });
  }

  async openDetail(key: RowKey): Promise<void> {
    await allure.step(`Abrir detalle del folio ${key.folio}`, async () => {
      await this.action(this.row(key), labels.row.view).click();
    });
  }

  async reload(): Promise<void> {
    await this.page.reload();
  }

  // ---------- verificaciones ----------
  async expectToast(message: RegExp): Promise<void> {
    await allure.step(`Se muestra el aviso ${message}`, () => expect(this.page.getByText(message)).toBeVisible());
  }

  async expectRow(key: RowKey, tipoDte: string, estado: string): Promise<void> {
    await allure.step(`La fila del folio ${key.folio} muestra tipo, RUT, monto y estado`, async () => {
      await allure.attachment('Esperado', JSON.stringify({ ...key, tipoDte, estado }, null, 2), 'application/json');
      const row = this.row(key);
      await expect(row).toBeVisible();
      await expect(row.getByRole('cell', { name: tipoDte, exact: true })).toBeVisible();
      await expect(row.getByRole('cell', { name: estado })).toBeVisible();
    });
  }

  async expectDetail(data: { folio: number; tipoDte: string; rutReceptor: string; monto: number; estado: string }): Promise<void> {
    await allure.step(`El detalle muestra los datos del folio ${data.folio}`, async () => {
      await allure.attachment('Esperado', JSON.stringify(data, null, 2), 'application/json');
      const detail = this.page.getByRole('dialog');
      for (const value of [String(data.folio), data.tipoDte, data.rutReceptor, formatClp(data.monto), data.estado]) {
        await expect(detail).toContainText(value);
      }
    });
  }

  async expectNoRow(key: RowKey): Promise<void> {
    await allure.step(`El folio ${key.folio} ya no existe: fila ausente y tabla vacía para el filtro`, async () => {
      await expect(this.page.getByText(labels.empty)).toBeVisible();
      await expect(this.row(key)).toHaveCount(0);
    });
  }
}
