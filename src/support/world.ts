import { IWorldOptions, setDefaultTimeout, setWorldConstructor, World } from '@cucumber/cucumber';
import { BrowserContext, Page } from '@playwright/test';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { ApiClient } from '../api/client/ApiClient';
import { ApiResponse, Document, EditableFields, NewDocument } from '../api/types';
import { config } from '../config/env';
import { DocumentsPage } from '../ui/pages/DocumentsPage';
import { LoginPage } from '../ui/pages/LoginPage';
import { RUT_UNICO, uniqueRut } from './data';
import { required } from './verify';

setDefaultTimeout(60_000);

export interface UiPages {
  login: LoginPage;
  documents: DocumentsPage;
}

/** Estado por escenario: cada escenario tiene su propio runId => datos aislados y paralelismo seguro. */
export class CustomWorld extends World {
  readonly runId: string = `qa-${Date.now().toString(36)}-${randomBytes(3).toString('hex')}`;
  readonly api: ApiClient = new ApiClient(config.apiUrl, this.runId);
  readonly rut: string = uniqueRut();

  /** Documentos creados como precondición, por referencia (columna "referencia" de la tabla). */
  readonly docs = new Map<string, Document>();
  current?: NewDocument;
  currentDoc?: Document;
  changes?: EditableFields;
  last?: ApiResponse<unknown>;

  context?: BrowserContext;
  page?: Page;
  uiPages?: UiPages;

  constructor(options: IWorldOptions) {
    super(options);
  }

  get ui(): UiPages {
    return required(this.uiPages, 'sesión de navegador (¿falta el tag @ui?)');
  }

  resolveRut(value: string): string {
    return value === RUT_UNICO ? this.rut : value;
  }

  async ensureSession(): Promise<void> {
    if (this.api.hasToken) return;
    const res = await this.api.login(config.adminEmail, config.adminPassword);
    assert.equal(res.status, 200, 'No se pudo iniciar sesión por API');
  }
}

setWorldConstructor(CustomWorld);
