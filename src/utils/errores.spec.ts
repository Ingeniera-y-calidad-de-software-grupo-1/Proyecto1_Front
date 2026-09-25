import { describe, it, expect } from 'vitest';
import { parseApiError } from './errores';

describe('CR-001 - parseApiError (Manejo y formateo de errores API)', () => {
  it('Caso A: responseData.message como string simple -> debe devolver exactamente ese mensaje', () => {
    const error = {
      response: {
        data: {
          message: 'El costo no puede ser negativo',
        },
      },
    };

    const resultado = parseApiError(error);
    expect(resultado).toBe('El costo no puede ser negativo');
  });

  it('Caso B: responseData.message como array -> debe devolver ambos mensajes en formato legible', () => {
    const error = {
      response: {
        data: {
          message: [
            'El costo no puede ser negativo',
            'El stock no puede ser negativo',
          ],
        },
      },
    };

    const resultado = parseApiError(error);
    expect(resultado).toBe('El costo no puede ser negativo. El stock no puede ser negativo');
    expect(resultado).toContain('El costo no puede ser negativo');
    expect(resultado).toContain('El stock no puede ser negativo');
  });

  it('Caso C: mensaje como objeto técnico -> nunca debe devolver "[object Object]"', () => {
    const error = {
      response: {
        data: {
          message: {
            detail: 'Database connection failed',
            code: 500,
          },
        },
      },
    };

    const resultado = parseApiError(error);
    expect(resultado).not.toContain('[object Object]');
    expect(typeof resultado).toBe('string');
    expect(resultado).toBe('Ocurrió un error inesperado.');
  });

  it('Caso D: sin response válida -> debe devolver el fallback existente', () => {
    expect(parseApiError(null)).toBe('Ocurrió un error inesperado.');
    expect(parseApiError(undefined)).toBe('Ocurrió un error inesperado.');
    expect(parseApiError({})).toBe('Ocurrió un error inesperado.');
    expect(parseApiError({ response: null })).toBe('Ocurrió un error inesperado.');
    expect(parseApiError({ response: { data: null } })).toBe('Ocurrió un error inesperado.');
  });

  it('Caso E: no debe exponer stack ni detalles técnicos de red/HTTP', () => {
    const errorAxios500 = {
      message: 'Request failed with status code 500',
      stack: 'Error: Request failed with status code 500\n    at createError (axios/lib/core/createError.js:16:15)',
    };

    const resultado = parseApiError(errorAxios500);
    expect(resultado).not.toContain('stack');
    expect(resultado).not.toContain('status code');
    expect(resultado).not.toContain('createError');
    expect(resultado).toBe('Ocurrió un error inesperado.');
  });
});
