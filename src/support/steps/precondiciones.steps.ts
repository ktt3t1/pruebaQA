import { DataTable, Given } from '@cucumber/cucumber';
import { toNewDocument } from '../data';
import { bodyOf, expectStatus } from '../verify';
import { CustomWorld } from '../world';
import { Document } from '../../api/types';

// Precondiciones compartidas por las capas @api y @ui (se preparan vía API, con datos únicos).

Given(
  'que existe un documento propio con los datos:',
  async function (this: CustomWorld, table: DataTable) {
    await this.ensureSession();
    const data = toNewDocument(table.hashes()[0], this.rut);
    const res = await this.api.createDocument(data);
    await expectStatus('La precondición crea el documento', 201, res.status);
    this.current = data;
    this.currentDoc = bodyOf<Document>(res);
  },
);

Given(
  'que existen los siguientes documentos del RUT {string}:',
  async function (this: CustomWorld, rut: string, table: DataTable) {
    await this.ensureSession();
    for (const row of table.hashes()) {
      const data = toNewDocument({ ...row, rutReceptor: rut }, this.rut);
      const res = await this.api.createDocument(data);
      await expectStatus(`La precondición crea "${row.referencia}"`, 201, res.status);
      this.docs.set(row.referencia, bodyOf<Document>(res));
    }
  },
);
