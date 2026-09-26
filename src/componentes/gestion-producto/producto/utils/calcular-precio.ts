/**
 * Calcula el precio a partir del costo y del margen de ganancia porcentual.
 * Fórmula de dominio (CR-001):
 * Precio = Costo * (1 + porcentaje / 100)
 * 
 * Sin redondeo arbitrario para conservar precisión.
 */
export function calcularPrecio(costo: number, porcentaje: number): number {
  const costoNum = typeof costo === "number" ? costo : Number(costo) || 0;
  const porcentajeNum = typeof porcentaje === "number" ? porcentaje : Number(porcentaje) || 0;
  return costoNum * (1 + porcentajeNum / 100);
}

/**
 * Redondea un valor numérico a 5 decimales, coherente con redondear5 del backend.
 */
export function redondear5(valor: number): number {
  return Math.round(valor * 100000) / 100000;
}

/**
 * Determina si existe una variación efectiva de precio entre dos valores
 * utilizando la precisión de 5 decimales del sistema.
 */
export function huboCambioEfectivoPrecio(precioAnterior: number, precioNuevo: number): boolean {
  return redondear5(precioAnterior) !== redondear5(precioNuevo);
}
