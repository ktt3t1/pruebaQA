import { DataTable, Given, Then, When } from '@cucumber/cucumber';
import { config } from '../../config/env';
import { toEditable, toNewDocument } from '../../support/data';
import { required } from '../../support/verify';
import { CustomWorld } from '../../support/world';
import { labels } from '../pages/labels';
import { RowKey } from '../pages/DocumentsPage';

const keyOf = (d: { folio: number; rutReceptor: string; monto: number }): RowKey => ({
  folio: d.folio,
  rutReceptor: d.rutReceptor,
  monto: d.monto,
});

Given('que inicié sesión en el portal', async function (this: CustomWorld) {
  await this.ui.login.open();
  await this.ui.login.signIn(config.adminEmail, config.adminPassword);
});

// ---------- Crear ----------
When('emito un nuevo documento desde el portal con los datos:', async function (this: CustomWorld, table: DataTable) {
  this.current = toNewDocument(table.hashes()[0], this.rut);
  await this.ui.documents.createDocument(this.current);
});

Then('veo el aviso de que el documento fue emitido', async function (this: CustomWorld) {
  await this.ui.documents.expectToast(labels.toast.created);
});

Then(
  'la lista filtrada por su RUT muestra el documento en estado {string}',
  async function (this: CustomWorld, estado: string) {
    const d = required(this.current, 'documento');
    await this.ui.documents.filterByRut(d.rutReceptor);
    await this.ui.documents.expectRow(keyOf(d), d.tipoDte, estado);
  },
);

// ---------- Leer ----------
When('busco en el portal los documentos del RUT {string}', async function (this: CustomWorld, rut: string) {
  await this.ui.documents.filterByRut(this.resolveRut(rut));
});

When('abro el detalle del documento {string}', async function (this: CustomWorld, ref: string) {
  await this.ui.documents.openDetail(keyOf(required(this.docs.get(ref), `documento "${ref}"`)));
});

Then('el detalle muestra los datos del documento {string}', async function (this: CustomWorld, ref: string) {
  await this.ui.documents.expectDetail(required(this.docs.get(ref), `documento "${ref}"`));
});

// ---------- Editar ----------
When('edito el documento desde el portal con los cambios:', async function (this: CustomWorld, table: DataTable) {
  const current = required(this.current, 'documento');
  this.changes = toEditable(table.hashes()[0], this.rut);
  await this.ui.documents.filterByRut(current.rutReceptor);
  await this.ui.documents.editDocument(keyOf(current), this.changes);
  Object.assign(current, this.changes);
});

Then('veo el aviso de que el documento fue actualizado', async function (this: CustomWorld) {
  await this.ui.documents.expectToast(labels.toast.updated);
});

Then('los cambios persisten al recargar el portal', async function (this: CustomWorld) {
  const d = required(this.current, 'documento');
  await this.ui.documents.reload();
  await this.ui.documents.filterByRut(d.rutReceptor);
  await this.ui.documents.expectRow(keyOf(d), d.tipoDte, 'PENDIENTE');
});

// ---------- Eliminar ----------
When('elimino el documento desde el portal confirmando el diálogo', async function (this: CustomWorld) {
  const d = required(this.current, 'documento');
  await this.ui.documents.filterByRut(d.rutReceptor);
  await this.ui.documents.deleteDocument(keyOf(d));
});

Then('veo el aviso de que el documento fue eliminado', async function (this: CustomWorld) {
  await this.ui.documents.expectToast(labels.toast.deleted);
});

Then('el documento ya no existe en la lista', async function (this: CustomWorld) {
  await this.ui.documents.expectNoRow(keyOf(required(this.current, 'documento')));
});

Then('el documento sigue sin existir al recargar el portal', async function (this: CustomWorld) {
  const d = required(this.current, 'documento');
  await this.ui.documents.reload();
  await this.ui.documents.filterByRut(d.rutReceptor);
  await this.ui.documents.expectNoRow(keyOf(d));
});
