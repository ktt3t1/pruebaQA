# language: es
@api @eliminar
Característica: API · Eliminar documentos tributarios

  Antecedentes:
    Dado que tengo una sesión válida en el sistema
    Y que existe un documento propio con los datos:
      | tipoDte | rutReceptor | monto  | fechaEmision |
      | DTE 39  | RUT único   | 150000 | 2026-09-15   |

  @API-CRUD-06
  Escenario: API-CRUD-06 · Eliminar un documento tributario
    Cuando elimino el documento
    Entonces el sistema confirma la eliminación sin contenido
    Y el documento ya no existe en el sistema
    Y el documento no aparece en el listado de su RUT
