# language: es
@ui @editar
Característica: UI · Editar documentos tributarios

  Antecedentes:
    Dado que inicié sesión en el portal

  @UI-CRUD-03
  Escenario: UI-CRUD-03 · Editar un documento propio
    Dado que existe un documento propio con los datos:
      | tipoDte | rutReceptor | monto  | fechaEmision |
      | DTE 33  | RUT único   | 450000 | 2026-09-28   |
    Cuando edito el documento desde el portal con los cambios:
      | monto  | observaciones    |
      | 780000 | Corrección monto |
    Entonces veo el aviso de que el documento fue actualizado
    Y la lista filtrada por su RUT muestra el documento en estado "PENDIENTE"
    Y los cambios persisten al recargar el portal
