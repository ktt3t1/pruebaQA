# language: es
@ui @hibrido
Característica: Híbrido · Documento creado por API visible en el portal

  @HIB-01
  Escenario: HIB-01 · Un documento creado por API se ve en la pantalla
    Dado que existe un documento propio con los datos:
      | tipoDte | rutReceptor | monto  | fechaEmision |
      | DTE 34  | RUT único   | 320000 | 2026-09-12   |
    Y que inicié sesión en el portal
    Entonces la lista filtrada por su RUT muestra el documento en estado "PENDIENTE"
