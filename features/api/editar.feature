# language: es
@api @editar
Característica: API · Editar documentos tributarios

  Antecedentes:
    Dado que tengo una sesión válida en el sistema
    Y que existe un documento propio con los datos:
      | tipoDte | rutReceptor | monto  | fechaEmision |
      | DTE 33  | RUT único   | 450000 | 2026-09-28   |

  @API-CRUD-04
  Escenario: API-CRUD-04 · Reemplazar los datos editables de un documento
    Cuando reemplazo los datos editables del documento con:
      | monto  | fechaEmision | observaciones      | deliveryChannel | contactEmail      |
      | 600000 | 2026-09-30   | Reemplazo completo | EMAIL           | qa@azurian.com    |
    Entonces el documento queda actualizado solo con los cambios indicados
    Y una consulta posterior confirma el documento actualizado

  @API-CRUD-05
  Escenario: API-CRUD-05 · Actualizar parcialmente un documento
    Cuando actualizo parcialmente el documento con:
      | monto  | observaciones     |
      | 780000 | Corrección monto  |
    Entonces el documento queda actualizado solo con los cambios indicados
    Y una consulta posterior confirma el documento actualizado
