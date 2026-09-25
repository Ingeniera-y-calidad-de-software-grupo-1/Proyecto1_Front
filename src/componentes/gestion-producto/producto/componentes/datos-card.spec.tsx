import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { DatosCard } from './datos-card';
import type { ConsultarProducto } from '../../../../interfaces/gestion-producto/producto/interfaces-producto';

describe('TP-11: DatosCard - Renderizado de Presentación (CR-002)', () => {
  const dummyProducto: ConsultarProducto = {
    id: 1,
    denominacion: 'Cerveza Rubia Especial',
    presentacion: 'Botella 750 cc',
    codigoProveedor: 'CRV-001',
    codigoReferencia: 'REF-001',
    stock: 25,
    precio: 1500,
    precioOferta: 0,
    ubicacion: 'A-1',
    poseeAlternativos: false,
    esAlternativo: false,
    sistema: 0,
    precioConIva: 1815,
    observacion: '',
    proveedor: 'Distribuidora Central',
    precioOcasionalConIva: 1815,
    precioMayoristaConIva: 1600,
    precioClienteConIva: 1700,
    precioOfertaConIva: 0,
  };

  const defaultHandlers = {
    onEditar: vi.fn(),
    onInfo: vi.fn(),
    onDelete: vi.fn(),
    onMovimientos: vi.fn(),
    onCambioPrecios: vi.fn(),
    onHistorial: vi.fn(),
  };

  it('TP-11: debe renderizar la etiqueta "Presentación" y su valor en la vista de tarjeta', () => {
    render(<DatosCard producto={dummyProducto} {...defaultHandlers} />);

    expect(screen.getByText('Presentación')).toBeInTheDocument();
    expect(screen.getByText('Botella 750 cc')).toBeInTheDocument();
  });

  it('no debe renderizar el bloque de presentación si el valor está vacío', () => {
    const productoSinPres = { ...dummyProducto, presentacion: '' };
    render(<DatosCard producto={productoSinPres} {...defaultHandlers} />);

    expect(screen.queryByText('Presentación')).not.toBeInTheDocument();
  });
});
