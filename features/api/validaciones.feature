# language: es
@api @validaciones
Característica: API · Validaciones de documentos tributarios

  @API-VAL-01
  Esquema del escenario: API-VAL-01 · Rechazar un documento sin el campo obligatorio <campo>
    Dado que tengo una sesión válida en el sistema
    Cuando intento emitir un documento sin el campo "<campo>"
    Entonces el sistema responde 400 con el código "VALIDATION_ERROR"
    Y el error señala el campo "<campo>"

    Ejemplos:
      | campo        |
      | tipoDte      |
      | folio        |
      | rutReceptor  |
      | monto        |
      | fechaEmision |

  @API-VAL-02
  Escenario: API-VAL-02 · Rechazar un RUT con dígito verificador inválido
    Dado que tengo una sesión válida en el sistema
    Cuando intento emitir un documento con el RUT "76.192.083-0"
    Entonces el sistema responde 400 con el código "VALIDATION_ERROR"
    Y el error señala el campo "rutReceptor"

  @API-VAL-03
  Escenario: API-VAL-03 · Rechazar un folio duplicado
    Dado que tengo una sesión válida en el sistema
    Y que existe un documento propio con los datos:
      | tipoDte | rutReceptor | monto  | fechaEmision |
      | DTE 33  | RUT único   | 450000 | 2026-09-28   |
    Cuando intento emitir otro documento con el mismo folio
    Entonces el sistema responde 409 con el código "DUPLICATE_FOLIO"

  @API-VAL-04
  Escenario: API-VAL-04 · Rechazar una petición sin sesión
    Cuando intento emitir un documento sin iniciar sesión
    Entonces el sistema responde 401 con el código "UNAUTHORIZED"
