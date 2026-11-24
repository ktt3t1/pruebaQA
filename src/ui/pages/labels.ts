/**
 * ÚNICO lugar con los textos de la UI. Si algún nombre accesible no coincide con el portal real,
 * se ajusta aquí (confírmalo con `npx playwright codegen http://localhost:3000/login`).
 */
export const labels = {
  login: { email: /correo|usuario|email/i, password: /contraseña/i, submit: /ingresar|iniciar sesión|entrar/i },
  newDocument: /nuevo documento/i,
  filter: { rut: /rut/i, apply: /buscar|filtrar|aplicar/i },
  form: {
    tipoDte: /tipo/i,
    folio: /folio/i,
    rut: /rut/i,
    monto: /monto/i,
    fecha: /fecha/i,
    observaciones: /observaciones/i,
    submitCreate: /emitir/i,
    submitEdit: /guardar/i,
  },
  row: { view: /ver detalle/i, edit: /editar/i, remove: /eliminar/i },
  confirmDelete: /confirmar|eliminar|sí/i,
  empty: /no hay documentos|sin resultados|no se encontraron/i,
  toast: { created: /emitido|creado/i, updated: /actualizado|guardado/i, deleted: /eliminado/i },
} as const;
