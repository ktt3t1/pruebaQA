import { DataTable, Given, Then, When } from '@cucumber/cucumber';
import { ApiError, Document, NewDocument } from '../../api/types';
import { config } from '../../config/env';
import { editableOf, expectedNewDocument, toEditable, toNewDocument, uniqueFolio } from '../../support/data';
import { bodyOf, expectEqual, expectJson, expectStatus, required } from '../../support/verify';
import { CustomWorld } from '../../support/world';

const doc = (w: CustomWorld): Document => bodyOf<Document>(required(w.last, 'respuesta previa'));

Given('que tengo una sesión válida en el sistema', async function (this: CustomWorld) {
  const res = await this.api.login(config.adminEmail, config.adminPassword);
  await expectStatus('Login exitoso', 200, res.status);
});

// ---------- Crear ----------
When('emito un documento con los datos:', async function (this: CustomWorld, table: DataTable) {
  this.current = toNewDocument(table.hashes()[0], this.rut);
  this.last = await this.api.createDocument(this.current);
});

Then('el sistema confirma la creación con el documento completo', async function (this: CustomWorld) {
  await expectStatus('Creación', 201, required(this.last, 'respuesta').status);
  await expectJson('Cuerpo completo del POST', expectedNewDocument(required(this.current, 'datos enviados')), doc(this));
});

Then('al consultarlo obtengo exactamente el mismo documento', async function (this: CustomWorld) {
  const created = doc(this);
  const res = await this.api.getDocument(created.id);
  await expectStatus('Lectura por id', 200, res.status);
  await expectJson('GET igual al POST', created, bodyOf<Document>(res));
});

// ---------- Leer ----------
When(
  'listo los documentos del RUT {string} de tipo {string}',
  async function (this: CustomWorld, rut: string, tipo: string) {
    this.last = await this.api.listDocuments({ rut: this.resolveRut(rut), tipoDte: tipo });
  },
);

Then('el listado contiene únicamente documentos del RUT y tipo buscados', async function (this: CustomWorld) {
  const res = required(this.last, 'listado');
  await expectStatus('Listado', 200, res.status);
  const items = bodyOf<Document[]>(res);
  const normalized = (r: string) => r.replace(/[.\-]/g, '');
  await expectEqual('Total informado en x-total-count', String(items.length), res.headers['x-total-count']);
  await expectEqual(
    'Todos los items cumplen el filtro',
    true,
    items.length > 0 && items.every((d) => normalized(d.rutReceptor) === normalized(this.rut) && d.tipoDte === 'DTE 34'),
  );
});

Then('el listado incluye el documento {string} con todos sus datos', async function (this: CustomWorld, ref: string) {
  const expected = required(this.docs.get(ref), `documento "${ref}"`);
  const found = bodyOf<Document[]>(required(this.last, 'listado')).filter(
    (d) => d.folio === expected.folio && d.rutReceptor === expected.rutReceptor && d.monto === expected.monto,
  );
  await expectEqual('Una única coincidencia por folio, RUT y monto', 1, found.length);
  await expectJson(`Cuerpo completo de "${ref}" en el listado`, expected, found[0]);
});

Then(
  'el detalle del documento {string} coincide exactamente con el del listado',
  async function (this: CustomWorld, ref: string) {
    const expected = required(this.docs.get(ref), `documento "${ref}"`);
    const res = await this.api.getDocument(expected.id);
    await expectStatus('Lectura por id', 200, res.status);
    await expectJson('Detalle completo', expected, bodyOf<Document>(res));
  },
);

When('consulto un documento que no existe', async function (this: CustomWorld) {
  this.last = await this.api.getDocument('00000000-0000-4000-8000-000000000000');
});

Then('el sistema responde que el documento no existe', async function (this: CustomWorld) {
  const res = required(this.last, 'respuesta');
  await expectStatus('Documento inexistente', 404, res.status);
  await expectJson('Error completo', { error: '<texto>', code: 'NOT_FOUND' }, res.body);
});

// ---------- Editar ----------
When('reemplazo los datos editables del documento con:', async function (this: CustomWorld, table: DataTable) {
  const original = required(this.currentDoc, 'documento');
  this.changes = toEditable(table.hashes()[0], this.rut);
  this.last = await this.api.putDocument(original.id, { ...editableOf(original), ...this.changes });
});

When('actualizo parcialmente el documento con:', async function (this: CustomWorld, table: DataTable) {
  const original = required(this.currentDoc, 'documento');
  this.changes = toEditable(table.hashes()[0], this.rut);
  this.last = await this.api.patchDocument(original.id, this.changes);
});

Then('el documento queda actualizado solo con los cambios indicados', async function (this: CustomWorld) {
  const original = required(this.currentDoc, 'documento');
  await expectStatus('Actualización', 200, required(this.last, 'respuesta').status);
  await expectJson(
    'Cuerpo completo: cambios aplicados y resto intacto',
    { ...original, ...required(this.changes, 'cambios'), updatedAt: '<fecha-iso>' },
    doc(this),
  );
});

Then('una consulta posterior confirma el documento actualizado', async function (this: CustomWorld) {
  const updated = doc(this);
  const res = await this.api.getDocument(updated.id);
  await expectStatus('Lectura posterior', 200, res.status);
  await expectJson('GET igual a la respuesta de la edición', updated, bodyOf<Document>(res));
});

// ---------- Eliminar ----------
When('elimino el documento', async function (this: CustomWorld) {
  this.last = await this.api.deleteDocument(required(this.currentDoc, 'documento').id);
});

Then('el sistema confirma la eliminación sin contenido', async function (this: CustomWorld) {
  const res = required(this.last, 'respuesta');
  await expectStatus('Eliminación', 204, res.status);
  await expectEqual('Cuerpo vacío', '', res.raw);
});

Then('el documento ya no existe en el sistema', async function (this: CustomWorld) {
  const res = await this.api.getDocument(required(this.currentDoc, 'documento').id);
  await expectStatus('Lectura del eliminado', 404, res.status);
  await expectJson('Error completo', { error: '<texto>', code: 'NOT_FOUND' }, res.body);
});

Then('el documento no aparece en el listado de su RUT', async function (this: CustomWorld) {
  const original = required(this.currentDoc, 'documento');
  const res = await this.api.listDocuments({ rut: original.rutReceptor });
  await expectEqual('Ningún item con el id eliminado', false, bodyOf<Document[]>(res).some((d) => d.id === original.id));
});

// ---------- Validaciones (extras) ----------
When('intento emitir un documento sin el campo {string}', async function (this: CustomWorld, campo: string) {
  const body: Record<string, unknown> = {
    ...toNewDocument(
      { tipoDte: 'DTE 33', rutReceptor: '76.192.083-9', monto: '450000', fechaEmision: '2026-09-28' },
      this.rut,
    ),
  };
  delete body[campo];
  this.last = await this.api.createDocument(body);
});

When('intento emitir un documento con el RUT {string}', async function (this: CustomWorld, rut: string) {
  this.last = await this.api.createDocument(
    toNewDocument({ tipoDte: 'DTE 33', rutReceptor: rut, monto: '450000', fechaEmision: '2026-09-28' }, this.rut),
  );
});

When('intento emitir otro documento con el mismo folio', async function (this: CustomWorld) {
  const existing = required(this.currentDoc, 'documento');
  this.last = await this.api.createDocument({ ...required(this.current, 'datos'), folio: existing.folio });
});

When('intento emitir un documento sin iniciar sesión', async function (this: CustomWorld) {
  const data: NewDocument = {
    tipoDte: 'DTE 33',
    folio: uniqueFolio(),
    rutReceptor: this.rut,
    monto: 450000,
    fechaEmision: '2026-09-28',
  };
  this.api.clearToken();
  this.last = await this.api.createDocumentWithoutToken(data);
});

Then('el sistema responde {int} con el código {string}', async function (this: CustomWorld, status: number, code: string) {
  const res = required(this.last, 'respuesta');
  await expectStatus('Rechazo', status, res.status);
  await expectEqual('Código de error', code, bodyOf<ApiError>(res).code);
});

Then('el error señala el campo {string}', async function (this: CustomWorld, campo: string) {
  const fields = (bodyOf<ApiError>(required(this.last, 'respuesta')).details ?? []).map((d) => d.field);
  await expectEqual(`El detalle incluye "${campo}"`, true, fields.includes(campo));
});
