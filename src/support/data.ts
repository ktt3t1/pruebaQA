import { Canal, Document, EditableFields, NewDocument, TipoDte } from '../api/types';

export const RUT_UNICO = 'RUT único';

let seq = 0;
const base = 1_000_000 + Math.floor(Math.random() * 7_000_000);

/** Folio único dentro del proceso (rango válido 1 - 9.999.999). */
export const uniqueFolio = (): number => base + seq++;

const dotted = (n: number | string): string => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.');

/** Construye un RUT chileno con dígito verificador válido (módulo 11). */
export function rutWithDv(body: number): string {
  let sum = 0;
  let mul = 2;
  for (const d of String(body).split('').reverse()) {
    sum += Number(d) * mul;
    mul = mul === 7 ? 2 : mul + 1;
  }
  const r = 11 - (sum % 11);
  const dv = r === 11 ? '0' : r === 10 ? 'K' : String(r);
  return `${dotted(body)}-${dv}`;
}

export const uniqueRut = (): string => rutWithDv(10_000_000 + Math.floor(Math.random() * 60_000_000));

export const formatClp = (n: number): string => `$${dotted(n)}`;

const resolve = (value: string, rut: string): string => (value === RUT_UNICO ? rut : value);

/** Convierte una fila de tabla Gherkin en un documento nuevo (folio único si no se indica). */
export function toNewDocument(row: Record<string, string>, rut: string): NewDocument {
  return {
    tipoDte: row.tipoDte as TipoDte,
    folio: row.folio ? Number(row.folio) : uniqueFolio(),
    rutReceptor: resolve(row.rutReceptor ?? RUT_UNICO, rut),
    monto: Number(row.monto),
    fechaEmision: row.fechaEmision,
    ...toEditable({ ...row, rutReceptor: '', monto: '', fechaEmision: '' }, rut),
  };
}

/** Convierte una fila de tabla en cambios editables (solo columnas con valor). */
export function toEditable(row: Record<string, string>, rut: string): EditableFields {
  const out: EditableFields = {};
  if (row.rutReceptor) out.rutReceptor = resolve(row.rutReceptor, rut);
  if (row.monto) out.monto = Number(row.monto);
  if (row.fechaEmision) out.fechaEmision = row.fechaEmision;
  if (row.deliveryChannel) out.deliveryChannel = row.deliveryChannel as Canal;
  if (row.sendCopy) out.sendCopy = row.sendCopy === 'true';
  if (row.contactEmail) out.contactEmail = row.contactEmail;
  if (row.observaciones) out.observaciones = row.observaciones;
  if (row.attachmentName) out.attachmentName = row.attachmentName;
  return out;
}

/** Campos editables actuales de un documento (para construir un PUT completo). */
export function editableOf(d: Document): EditableFields {
  const out: EditableFields = {
    rutReceptor: d.rutReceptor,
    monto: d.monto,
    fechaEmision: d.fechaEmision,
    deliveryChannel: d.deliveryChannel,
    sendCopy: d.sendCopy,
  };
  if (d.contactEmail !== null) out.contactEmail = d.contactEmail;
  if (d.observaciones !== null) out.observaciones = d.observaciones;
  if (d.attachmentName !== null) out.attachmentName = d.attachmentName;
  return out;
}

/** Cuerpo esperado de un documento recién creado. Los valores dinámicos se validan por forma. */
export function expectedNewDocument(sent: NewDocument): Record<string, unknown> {
  return {
    contactEmail: null,
    sendCopy: false,
    deliveryChannel: 'PORTAL',
    observaciones: null,
    attachmentName: null,
    ...sent,
    estado: 'PENDIENTE',
    id: '<uuid>',
    createdAt: '<fecha-iso>',
    updatedAt: '<fecha-iso>',
  };
}
