export type TipoDte = 'DTE 33' | 'DTE 34' | 'DTE 39';
export type Estado = 'PENDIENTE' | 'ACEPTADO' | 'RECHAZADO';
export type Canal = 'PORTAL' | 'EMAIL';

export interface EditableFields {
  rutReceptor?: string;
  monto?: number;
  fechaEmision?: string;
  deliveryChannel?: Canal;
  sendCopy?: boolean;
  contactEmail?: string;
  observaciones?: string;
  attachmentName?: string;
}

export interface NewDocument extends EditableFields {
  tipoDte: TipoDte;
  folio: number;
  rutReceptor: string;
  monto: number;
  fechaEmision: string;
}

export interface Document {
  id: string;
  tipoDte: TipoDte;
  folio: number;
  rutReceptor: string;
  monto: number;
  fechaEmision: string;
  estado: Estado;
  contactEmail: string | null;
  sendCopy: boolean;
  deliveryChannel: Canal;
  observaciones: string | null;
  attachmentName: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LoginBody {
  token: string;
  expiresIn: number;
  user: Record<string, unknown>;
}

export interface ApiError {
  error: string;
  code: string;
  details?: { field: string; message: string }[];
}

export interface ApiResponse<T> {
  status: number;
  headers: Record<string, string>;
  body: T | null;
  raw: string;
}

export interface ListFilters {
  rut?: string;
  tipoDte?: string;
  estado?: string;
  page?: number;
  pageSize?: number;
}
