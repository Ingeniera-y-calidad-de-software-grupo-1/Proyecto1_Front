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
