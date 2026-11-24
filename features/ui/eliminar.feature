# language: es
@ui @eliminar
Característica: UI · Eliminar documentos tributarios

  Antecedentes:
    Dado que inicié sesión en el portal

  @UI-CRUD-04
  Escenario: UI-CRUD-04 · Eliminar un documento propio con confirmación
    Dado que existe un documento propio con los datos:
      | tipoDte | rutReceptor | monto  | fechaEmision |
      | DTE 39  | RUT único   | 150000 | 2026-09-15   |
    Cuando elimino el documento desde el portal confirmando el diálogo
    Entonces veo el aviso de que el documento fue eliminado
    Y el documento ya no existe en la lista
    Y el documento sigue sin existir al recargar el portal
