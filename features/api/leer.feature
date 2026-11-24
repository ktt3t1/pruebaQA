# language: es
@api @leer
Característica: API · Leer documentos tributarios

  Antecedentes:
    Dado que tengo una sesión válida en el sistema

  @API-CRUD-02
  Escenario: API-CRUD-02 · Listar con filtros y leer el detalle de un documento
    Dado que existen los siguientes documentos del RUT "RUT único":
      | referencia | tipoDte | monto  | fechaEmision |
      | factura    | DTE 33  | 450000 | 2026-09-28   |
      | exenta     | DTE 34  | 120000 | 2026-09-20   |
      | boleta     | DTE 39  | 35000  | 2026-09-10   |
    Cuando listo los documentos del RUT "RUT único" de tipo "DTE 34"
    Entonces el listado contiene únicamente documentos del RUT y tipo buscados
    Y el listado incluye el documento "exenta" con todos sus datos
    Y el detalle del documento "exenta" coincide exactamente con el del listado

  @API-CRUD-03
  Escenario: API-CRUD-03 · Leer un documento inexistente
    Cuando consulto un documento que no existe
    Entonces el sistema responde que el documento no existe
