import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProductosModales } from './producto-modales';

vi.mock('./historial-precios-modal', () => ({
  default: ({ producto }: { producto: any }) => (
    <div data-testid="historial-precios-modal">
      Historial for: {producto?.denominacion} (ID: {producto?.id})
    </div>
  ),
}));

vi.mock('../utils/registrar-actualizar-producto', () => ({
  default: () => <div data-testid="form-producto" />,
}));

vi.mock('../../../herramientas/reutilizables/informacion-auditoria', () => ({
  default: () => <div data-testid="info-auditoria" />,
}));

describe('ProductosModales - HistorialPreciosModal integration', () => {
  const defaultProps = {
    isAltaOpen: false,
    mostrarActualizarProducto: false,
    mostrarInfoAuditoria: false,
    mostrarMovimientosStock: false,
    mostrarHistorialPrecios: false,
    mostrarCambioPrecios: false,
    mostrarProductosAlternativos: false,
    mostrarDeQuienEsAlternativo: false,
    productoSeleccionado: null,
    productoInfo: {} as any,
    auditoria: null,
    onCloseAlta: vi.fn(),
    onCloseActualizar: vi.fn(),
    onCloseAuditoria: vi.fn(),
    onCloseMovimientosStock: vi.fn(),
    onCloseHistorialPrecios: vi.fn(),
    onCloseCambioPrecios: vi.fn(),
    onCloseProductosAlternativos: vi.fn(),
    onCloseDeQuienEsAlternativo: vi.fn(),
    onSuccessAlta: vi.fn(),
    onSuccessActualizar: vi.fn(),
    onRefetch: vi.fn(),
  };

  it('debe renderizar HistorialPreciosModal usando productoInfo (incluso si productoSeleccionado es null)', () => {
    const mockProductoInfo = {
      id: 42,
      denominacion: 'Producto Desde Info',
    };

    render(
      <ProductosModales
        {...defaultProps}
        mostrarHistorialPrecios={true}
        productoSeleccionado={null}
        productoInfo={mockProductoInfo}
      />
    );

    expect(screen.getByTestId('historial-precios-modal')).toBeDefined();
    expect(screen.getByText('Historial for: Producto Desde Info (ID: 42)')).toBeDefined();
  });

  it('NO debe renderizar HistorialPreciosModal si productoInfo no tiene id válido', () => {
    render(
      <ProductosModales
        {...defaultProps}
        mostrarHistorialPrecios={true}
        productoSeleccionado={null}
        productoInfo={{} as any}
      />
    );

    expect(screen.queryByTestId('historial-precios-modal')).toBeNull();
  });
});
