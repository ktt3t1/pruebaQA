# language: es
@api @crear
Característica: API · Crear documentos tributarios

  Antecedentes:
    Dado que tengo una sesión válida en el sistema

  @API-CRUD-01
  Escenario: API-CRUD-01 · Crear un documento tributario
    Cuando emito un documento con los datos:
      | tipoDte | rutReceptor | monto  | fechaEmision |
      | DTE 33  | RUT único   | 450000 | 2026-09-28   |
    Entonces el sistema confirma la creación con el documento completo
    Y al consultarlo obtengo exactamente el mismo documento
