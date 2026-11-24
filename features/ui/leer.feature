# language: es
@ui @leer
Característica: UI · Leer documentos tributarios

  Antecedentes:
    Dado que inicié sesión en el portal

  @UI-CRUD-02
  Escenario: UI-CRUD-02 · Ver el detalle de un documento entre varios del mismo RUT
    Dado que existen los siguientes documentos del RUT "RUT único":
      | referencia | tipoDte | monto  | fechaEmision |
      | factura    | DTE 33  | 450000 | 2026-09-28   |
      | exenta     | DTE 34  | 120000 | 2026-09-20   |
      | boleta     | DTE 39  | 35000  | 2026-09-10   |
    Cuando busco en el portal los documentos del RUT "RUT único"
    Y abro el detalle del documento "exenta"
    Entonces el detalle muestra los datos del documento "exenta"
