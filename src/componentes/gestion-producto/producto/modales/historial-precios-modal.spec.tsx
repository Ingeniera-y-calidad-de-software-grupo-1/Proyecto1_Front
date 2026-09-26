import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import HistorialPreciosModal from './historial-precios-modal';
import ProductoService from '../services/producto-service';

vi.mock('../services/producto-service', () => ({
  default: {
    obtenerHistorialPrecios: vi.fn(),
  },
}));

describe('HistorialPreciosModal (CR-007)', () => {
  const mockProducto = {
    id: 1,
    denominacion: 'Cerveza Quilmes 1L',
  };

  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe mostrar estado de carga inicialmente', () => {
    vi.mocked(ProductoService.obtenerHistorialPrecios).mockReturnValue(new Promise(() => {}));

    render(<HistorialPreciosModal producto={mockProducto} onClose={mockOnClose} />);

    expect(screen.getByText('Cargando historial de precios...')).toBeDefined();
  });

  it('debe mostrar la lista de cambios de precio ordenados cuando existen registros', async () => {
    const mockHistorial = [
      {
        id: 2,
        productoId: 1,
        precioAnterior: 1000,
        precioNuevo: 1200,
        fecha: '2026-03-15T10:30:00.000Z',
        motivo: 'Aumento de costos de materias primas',
      },
      {
        id: 1,
        productoId: 1,
        precioAnterior: 800,
        precioNuevo: 1000,
        fecha: '2026-02-01T09:00:00.000Z',
        motivo: 'Ajuste inflacionario mensual',
      },
    ];

    vi.mocked(ProductoService.obtenerHistorialPrecios).mockResolvedValue(mockHistorial);

    render(<HistorialPreciosModal producto={mockProducto} onClose={mockOnClose} />);

    await waitFor(() => {
      expect(screen.getByText('Historial de Precios')).toBeDefined();
      expect(screen.getByText('Cerveza Quilmes 1L')).toBeDefined();
      expect(screen.getByText('Aumento de costos de materias primas')).toBeDefined();
      expect(screen.getByText('Ajuste inflacionario mensual')).toBeDefined();
      expect(screen.getByText('Total de registros: 2')).toBeDefined();
    });
  });

  it('debe mostrar mensaje amigable cuando no existen cambios de precio', async () => {
    vi.mocked(ProductoService.obtenerHistorialPrecios).mockResolvedValue([]);

    render(<HistorialPreciosModal producto={mockProducto} onClose={mockOnClose} />);

    await waitFor(() => {
      expect(screen.getByText('No hay registros de cambios de precio')).toBeDefined();
      expect(screen.getByText('Total de registros: 0')).toBeDefined();
    });
  });

  it('debe mostrar mensaje de error si falla la llamada al servicio', async () => {
    vi.mocked(ProductoService.obtenerHistorialPrecios).mockRejectedValue(new Error('Network error'));

    render(<HistorialPreciosModal producto={mockProducto} onClose={mockOnClose} />);

    await waitFor(() => {
      expect(screen.getByText('No se pudo cargar el historial de precios del producto.')).toBeDefined();
      expect(screen.getByText('Reintentar')).toBeDefined();
    });
  });

  it('debe llamar a onClose cuando se presiona el botón Cerrar', async () => {
    vi.mocked(ProductoService.obtenerHistorialPrecios).mockResolvedValue([]);

    render(<HistorialPreciosModal producto={mockProducto} onClose={mockOnClose} />);

    await waitFor(() => {
      expect(screen.getByText('Cerrar')).toBeDefined();
    });

    fireEvent.click(screen.getByText('Cerrar'));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});
