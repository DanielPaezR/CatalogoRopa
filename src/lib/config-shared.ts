/** Cálculo de envío compartido entre servidor y cliente. */
export function calcularEnvio(subtotal: number, config: { costoEnvio: number; envioGratisDesde: number | null }) {
  if (subtotal <= 0) return 0
  if (config.envioGratisDesde && subtotal >= config.envioGratisDesde) return 0
  return config.costoEnvio
}
