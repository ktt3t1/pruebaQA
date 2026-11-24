import { Locator, Page } from '@playwright/test';
import { EditableFields, NewDocument } from '../../api/types';
import { labels } from './labels';

/** Formulario (diálogo) de emisión/edición. */
export class DocumentFormPage {
  private readonly root: Locator;

  constructor(page: Page) {
    this.root = page.getByRole('dialog');
  }

  async fill(data: Partial<NewDocument> & EditableFields): Promise<void> {
    const f = labels.form;
    if (data.tipoDte) await this.root.getByLabel(f.tipoDte).selectOption(data.tipoDte);
    if (data.folio !== undefined) await this.root.getByLabel(f.folio).fill(String(data.folio));
    if (data.rutReceptor) await this.root.getByLabel(f.rut).fill(data.rutReceptor);
    if (data.monto !== undefined) await this.root.getByLabel(f.monto).fill(String(data.monto));
    if (data.fechaEmision) await this.root.getByLabel(f.fecha).fill(data.fechaEmision);
    if (data.observaciones) await this.root.getByLabel(f.observaciones).fill(data.observaciones);
  }

  async submit(name: RegExp): Promise<void> {
    await this.root.getByRole('button', { name }).click();
  }
}
