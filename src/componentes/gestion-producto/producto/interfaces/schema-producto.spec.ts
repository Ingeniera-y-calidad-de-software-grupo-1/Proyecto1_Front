import { describe, it, expect } from 'vitest';
import { schema } from './interfaces-validaciones-producto';
import { AlicuotaIva } from '../../../../interfaces/generales/interfaces-generales';

describe('CR-001 - Yup Schema de Producto (schema)', () => {
  const baseProductoValido = {
    denominacion: 'Arroz Integral 1kg',
    costo: 1000,
    porcentaje: 15,
    stock: 50,
    marcaId: 1,
    lineaId: 1,
    alicuotaIva: AlicuotaIva.ALICUOTA_21,
    presentacion: '1L',
  };

  it('debe aceptar una denominacion válida', async () => {
    const validSchema = schema(false, false, false);
    const resultado = await validSchema.validate({
      ...baseProductoValido,
      denominacion: 'Yerba Mate Playadito 500g / Calidad-1.',
    });
    expect(resultado.denominacion).toBeDefined();
  });

  it('debe rechazar una denominacion vacía', async () => {
    const validSchema = schema(false, false, false);
    await expect(
      validSchema.validate({
        ...baseProductoValido,
        denominacion: '',
      })
    ).rejects.toThrow();
  });

  it('debe rechazar una denominacion > 255 caracteres', async () => {
    const validSchema = schema(false, false, false);
    const textoLargo = 'a'.repeat(256);
    await expect(
      validSchema.validate({
        ...baseProductoValido,
        denominacion: textoLargo,
      })
    ).rejects.toThrow();
  });

  it('debe rechazar una denominacion con carácter inválido', async () => {
    const validSchema = schema(false, false, false);
    // Caracteres como '<', '>', '$', '#' no están permitidos en la regex
    await expect(
      validSchema.validate({
        ...baseProductoValido,
        denominacion: 'Producto <Invalido>',
      })
    ).rejects.toThrow();
  });

  it('debe aceptar un costo válido (positivo o cero)', async () => {
    const validSchema = schema(false, false, false);
    const resCero = await validSchema.validate({
      ...baseProductoValido,
      costo: 0,
    });
    expect(resCero.costo).toBe(0);

    const resDecimal = await validSchema.validate({
      ...baseProductoValido,
      costo: 125.75,
    });
    expect(resDecimal.costo).toBe(125.75);
  });

  it('debe rechazar un costo negativo', async () => {
    const validSchema = schema(false, false, false);
    await expect(
      validSchema.validate({
        ...baseProductoValido,
        costo: -1,
      })
    ).rejects.toThrow();
  });

  it('debe aceptar un porcentaje válido (positivo o cero)', async () => {
    const validSchema = schema(false, false, false);
    const res = await validSchema.validate({
      ...baseProductoValido,
      porcentaje: 0,
    });
    expect(res.porcentaje).toBe(0);

    const resDecimal = await validSchema.validate({
      ...baseProductoValido,
      porcentaje: 15.5,
    });
    expect(resDecimal.porcentaje).toBe(15.5);
  });

  it('debe rechazar un porcentaje negativo', async () => {
    const validSchema = schema(false, false, false);
    await expect(
      validSchema.validate({
        ...baseProductoValido,
        porcentaje: -10,
      })
    ).rejects.toThrow();
  });

  it('debe aceptar un stock válido (cero o positivo)', async () => {
    const validSchema = schema(false, false, false);
    const res = await validSchema.validate({
      ...baseProductoValido,
      stock: 0,
    });
    expect(res.stock).toBe(0);
  });

  it('debe rechazar un stock negativo', async () => {
    const validSchema = schema(false, false, false);
    await expect(
      validSchema.validate({
        ...baseProductoValido,
        stock: -5,
      })
    ).rejects.toThrow();
  });

  it('debe aceptar un stock decimal válido', async () => {
    const validSchema = schema(false, false, false);
    const res = await validSchema.validate({
      ...baseProductoValido,
      stock: 12.75,
    });
    expect(res.stock).toBe(12.75);
  });

  it('debe rechazar stockMinimo negativo cuando utilizaStockMinimo = true', async () => {
    const schemaConStockMinimo = schema(true, false, false);
    await expect(
      schemaConStockMinimo.validate({
        ...baseProductoValido,
        utilizaStockMinimo: true,
        stockMinimo: -1,
      })
    ).rejects.toThrow();

    // Debe aceptar si es >= 0
    const resValido = await schemaConStockMinimo.validate({
      ...baseProductoValido,
      utilizaStockMinimo: true,
      stockMinimo: 0,
    });
    expect(resValido.stockMinimo).toBe(0);
  });

  it('no debe requerir el precio como entrada manual', async () => {
    const validSchema = schema(false, false, false);
    // Sin enviar campo precio
    const resSinPrecio = await validSchema.validate({
      ...baseProductoValido,
    });
    expect(resSinPrecio).toBeDefined();

    // Enviando precio undefined o null
    const resPrecioNull = await validSchema.validate({
      ...baseProductoValido,
      precio: null,
    });
    expect(resPrecioNull).toBeDefined();
  });
});

describe('CR-002 - Yup Schema de Producto: Validación de Presentación', () => {
  const baseProductoValido = {
    denominacion: 'Cerveza Rubia Especial',
    costo: 1000,
    porcentaje: 15,
    stock: 50,
    marcaId: 1,
    lineaId: 1,
    alicuotaIva: AlicuotaIva.ALICUOTA_21,
    presentacion: '1L',
  };

  it('TP-01: debe aceptar una presentación válida "1L"', async () => {
    const validSchema = schema(false, false, false);
    const resultado = await validSchema.validate({
      ...baseProductoValido,
      presentacion: '1L',
    });
    expect(resultado.presentacion).toBe('1L');
  });

  it('TP-02: debe aplicar trim() a la presentación', async () => {
    const validSchema = schema(false, false, false);
    const resultado = await validSchema.validate({
      ...baseProductoValido,
      presentacion: '  Botella 750 cc  ',
    });
    expect(resultado.presentacion).toBe('Botella 750 cc');
  });

  it('TP-03: debe rechazar presentación vacía ""', async () => {
    const validSchema = schema(false, false, false);
    await expect(
      validSchema.validate({
        ...baseProductoValido,
        presentacion: '',
      }),
    ).rejects.toThrow('La presentación es obligatoria.');
  });

  it('TP-04: debe rechazar presentación compuesta sólo por espacios "   "', async () => {
    const validSchema = schema(false, false, false);
    await expect(
      validSchema.validate({
        ...baseProductoValido,
        presentacion: '   ',
      }),
    ).rejects.toThrow('La presentación es obligatoria.');
  });

  it('TP-06: debe rechazar presentación de más de 50 caracteres', async () => {
    const validSchema = schema(false, false, false);
    await expect(
      validSchema.validate({
        ...baseProductoValido,
        presentacion: 'a'.repeat(51),
      }),
    ).rejects.toThrow('La presentación no puede superar los 50 caracteres.');
  });

  it('TP-07: debe aceptar presentación de exactamente 50 caracteres', async () => {
    const validSchema = schema(false, false, false);
    const texto50 = 'a'.repeat(50);
    const resultado = await validSchema.validate({
      ...baseProductoValido,
      presentacion: texto50,
    });
    expect(resultado.presentacion).toBe(texto50);
  });

  it('TP-10: debe bloquear el guardado si falta el campo presentacion', async () => {
    const validSchema = schema(false, false, false);
    const payloadSinPresentacion = { ...baseProductoValido };
    delete (payloadSinPresentacion as any).presentacion;

    await expect(
      validSchema.validate(payloadSinPresentacion),
    ).rejects.toThrow('La presentación es obligatoria.');
  });
});

