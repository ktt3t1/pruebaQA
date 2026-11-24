# language: es
@ui @crear
Característica: UI · Crear documentos tributarios

  Antecedentes:
    Dado que inicié sesión en el portal

  @UI-CRUD-01
  Escenario: UI-CRUD-01 · Crear un documento tributario
    Cuando emito un nuevo documento desde el portal con los datos:
      | tipoDte | rutReceptor | monto  | fechaEmision |
      | DTE 33  | RUT único   | 450000 | 2026-09-28   |
    Entonces veo el aviso de que el documento fue emitido
    Y la lista filtrada por su RUT muestra el documento en estado "PENDIENTE"
