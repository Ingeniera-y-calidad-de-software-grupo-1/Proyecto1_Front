import { describe, it, expect } from 'vitest';
import { calcularPrecio, redondear5, huboCambioEfectivoPrecio } from './calcular-precio';

describe('CR-001 - Cálculo de Precio (calcularPrecio)', () => {
  it('debe calcular correctamente 1000 + 15% = 1150', () => {
    const precio = calcularPrecio(1000, 15);
    expect(precio).toBe(1150);
  });

  it('debe calcular correctamente 1200 + 15% = 1380', () => {
    const precio = calcularPrecio(1200, 15);
    expect(precio).toBe(1380);
  });

  it('debe calcular correctamente 1000 + 20% = 1200', () => {
    const precio = calcularPrecio(1000, 20);
    expect(precio).toBe(1200);
  });

  it('debe calcular correctamente 1000 + 0% = 1000', () => {
    const precio = calcularPrecio(1000, 0);
    expect(precio).toBe(1000);
  });

  it('debe calcular correctamente 0 + 15% = 0', () => {
    const precio = calcularPrecio(0, 15);
    expect(precio).toBe(0);
  });

  it('debe calcular caso decimal conservando precisión sin redondear arbitrariamente', () => {
    // 100.5 * (1 + 20 / 100) = 100.5 * 1.2 = 120.6 (exacto en IEEE-754)
    const precioExacto = calcularPrecio(100.5, 20);
    expect(precioExacto).toBe(120.6);

    // 12.5 * (1 + 15 / 100) = 14.375 (conserva decimales sin truncar a entero)
    const precioConDecimales = calcularPrecio(12.5, 15);
    expect(precioConDecimales).toBeCloseTo(14.375, 4);
    expect(precioConDecimales).not.toBe(14); // Verifica que NO redondeará a entero
  });
});

describe('CR-007 - Precisión de 5 decimales (redondear5 y huboCambioEfectivoPrecio)', () => {
  it('debe redondear números a 5 decimales consistentemente', () => {
    expect(redondear5(10.123456)).toBe(10.12346);
    expect(redondear5(10.123454)).toBe(10.12345);
    expect(redondear5(10.1)).toBe(10.1);
  });

  it('no debe detectar cambio efectivo si la diferencia es menor al quinto decimal', () => {
    // Diferencia en el 6to decimal
    const cambio = huboCambioEfectivoPrecio(10.123451, 10.123454);
    expect(cambio).toBe(false);
  });

  it('debe detectar cambio efectivo si la diferencia está en el quinto decimal o superior', () => {
    const cambio = huboCambioEfectivoPrecio(10.12345, 10.12346);
    expect(cambio).toBe(true);

    const cambioEntero = huboCambioEfectivoPrecio(100, 120);
    expect(cambioEntero).toBe(true);
  });

  it('no debe detectar cambio efectivo cuando los precios son idénticos', () => {
    expect(huboCambioEfectivoPrecio(150, 150)).toBe(false);
    expect(huboCambioEfectivoPrecio(0, 0)).toBe(false);
  });
});
