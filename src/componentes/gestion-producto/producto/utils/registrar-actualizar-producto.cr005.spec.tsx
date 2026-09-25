import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import RegistrarActualizarProductoForm from "./registrar-actualizar-producto";
import type { Producto } from "../../../../interfaces/gestion-producto/producto/interfaces-producto";

// Mocks de servicios y contextos
vi.mock("../../../sistema/ConfiguracionSistemaContext", () => ({
  useConfiguracionSistema: () => ({ configuracion: {} }),
}));

vi.mock("../../../../utils/auth", () => ({
  getUsuarioId: () => 1,
}));

vi.mock("../services/producto-service", () => ({
  default: {
    obtenerTotales: vi.fn(),
    nuevo: vi.fn(),
    actualizar: vi.fn(),
  },
}));

// Mock de selectores para simular selección de Marca y Línea de forma determinística
vi.mock("../componentes/configuracion/lineas-selector", () => ({
  default: ({ onLineaChange }: any) => (
    <div>
      <button
        type="button"
        data-testid="select-linea-cola"
        onClick={() => onLineaChange({ id: 10, denominacion: "Cola" })}
      >
        Select Linea Cola
      </button>
      <button
        type="button"
        data-testid="select-linea-diet"
        onClick={() => onLineaChange({ id: 11, denominacion: "Diet" })}
      >
        Select Linea Diet
      </button>
    </div>
  ),
}));

vi.mock("../componentes/configuracion/marcas-selector", () => ({
  default: ({ onChangeMarca }: any) => (
    <div>
      <button
        type="button"
        data-testid="select-marca-coca"
        onClick={() => onChangeMarca({ id: 1, denominacion: "Coca Cola" })}
      >
        Select Marca Coca
      </button>
      <button
        type="button"
        data-testid="select-marca-pepsi"
        onClick={() => onChangeMarca({ id: 2, denominacion: "Pepsi" })}
      >
        Select Marca Pepsi
      </button>
    </div>
  ),
}));

describe("CR-005 Frontend: Denominación automática y edición manual", () => {
  const defaultProps = {
    onClose: vi.fn(),
    onSuccess: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("TP-11: en ALTA debe autocompletar denominación como Marca + Línea + Presentación", async () => {
    render(<RegistrarActualizarProductoForm {...defaultProps} />);

    const selectMarcaBtn = screen.getByTestId("select-marca-coca");
    const selectLineaBtn = screen.getByTestId("select-linea-cola");
    const presentacionInput = screen.getByPlaceholderText("Ej: 1L, 750 cc, 500 g");
    const denominacionInput = screen.getByPlaceholderText("Ingresa la denominación") as HTMLInputElement;

    fireEvent.click(selectMarcaBtn);
    fireEvent.click(selectLineaBtn);
    fireEvent.change(presentacionInput, { target: { value: "1.5L" } });

    await waitFor(() => {
      expect(denominacionInput.value).toBe("Coca Cola Cola 1.5L");
    });
  });

  it("TP-12: en ALTA debe actualizar sugerencia ante cambios en Marca, Línea o Presentación en modo automático", async () => {
    render(<RegistrarActualizarProductoForm {...defaultProps} />);

    const selectMarcaBtn = screen.getByTestId("select-marca-coca");
    const selectLineaColaBtn = screen.getByTestId("select-linea-cola");
    const selectLineaDietBtn = screen.getByTestId("select-linea-diet");
    const presentacionInput = screen.getByPlaceholderText("Ej: 1L, 750 cc, 500 g");
    const denominacionInput = screen.getByPlaceholderText("Ingresa la denominación") as HTMLInputElement;

    fireEvent.click(selectMarcaBtn);
    fireEvent.click(selectLineaColaBtn);
    fireEvent.change(presentacionInput, { target: { value: "1.5L" } });

    await waitFor(() => {
      expect(denominacionInput.value).toBe("Coca Cola Cola 1.5L");
    });

    // Cambiar línea a Diet
    fireEvent.click(selectLineaDietBtn);

    await waitFor(() => {
      expect(denominacionInput.value).toBe("Coca Cola Diet 1.5L");
    });

    // Cambiar presentación a 2L
    fireEvent.change(presentacionInput, { target: { value: "2L" } });

    await waitFor(() => {
      expect(denominacionInput.value).toBe("Coca Cola Diet 2L");
    });
  });

  it("TP-13: edición manual del usuario desactiva autocomposición y no es sobrescrita por cambios posteriores", async () => {
    render(<RegistrarActualizarProductoForm {...defaultProps} />);

    const selectMarcaBtn = screen.getByTestId("select-marca-coca");
    const selectLineaColaBtn = screen.getByTestId("select-linea-cola");
    const selectLineaDietBtn = screen.getByTestId("select-linea-diet");
    const presentacionInput = screen.getByPlaceholderText("Ej: 1L, 750 cc, 500 g");
    const denominacionInput = screen.getByPlaceholderText("Ingresa la denominación") as HTMLInputElement;

    fireEvent.click(selectMarcaBtn);
    fireEvent.click(selectLineaColaBtn);
    fireEvent.change(presentacionInput, { target: { value: "1.5L" } });

    await waitFor(() => {
      expect(denominacionInput.value).toBe("Coca Cola Cola 1.5L");
    });

    // El usuario edita manualmente la denominación
    fireEvent.change(denominacionInput, { target: { value: "Coca Especial Manual" } });
    fireEvent.input(denominacionInput, { target: { value: "Coca Especial Manual" } });

    await waitFor(() => {
      expect(denominacionInput.value).toBe("Coca Especial Manual");
    });

    // Modificar Marca, Línea y Presentación no debe sobrescribir la denominación manual
    fireEvent.click(selectLineaDietBtn);
    fireEvent.change(presentacionInput, { target: { value: "3L" } });

    await waitFor(() => {
      expect(denominacionInput.value).toBe("Coca Especial Manual");
    });
  });

  it("TP-14: al borrar la denominación manual en ALTA debe reactivar el modo automático y recalcular la sugerencia", async () => {
    render(<RegistrarActualizarProductoForm {...defaultProps} />);

    const selectMarcaBtn = screen.getByTestId("select-marca-coca");
    const selectLineaColaBtn = screen.getByTestId("select-linea-cola");
    const presentacionInput = screen.getByPlaceholderText("Ej: 1L, 750 cc, 500 g");
    const denominacionInput = screen.getByPlaceholderText("Ingresa la denominación") as HTMLInputElement;

    fireEvent.click(selectMarcaBtn);
    fireEvent.click(selectLineaColaBtn);
    fireEvent.change(presentacionInput, { target: { value: "1.5L" } });

    await waitFor(() => {
      expect(denominacionInput.value).toBe("Coca Cola Cola 1.5L");
    });

    // Edición manual
    fireEvent.change(denominacionInput, { target: { value: "Manual Text" } });
    fireEvent.input(denominacionInput, { target: { value: "Manual Text" } });

    await waitFor(() => {
      expect(denominacionInput.value).toBe("Manual Text");
    });

    // Borrado completo de la denominación (usuario vacía el campo)
    fireEvent.change(denominacionInput, { target: { value: "" } });
    fireEvent.input(denominacionInput, { target: { value: "" } });

    // Debe volver al modo automático y recalcular con Marca + Línea + Presentación
    await waitFor(() => {
      expect(denominacionInput.value).toBe("Coca Cola Cola 1.5L");
    });
  });

  it("TP-15: en EDICIÓN (UPDATE) de producto existente debe preservar la denominación persistida", async () => {
    const productoExistente: any = {
      id: 99,
      denominacion: "Denominacion Persistida Original",
      presentacion: "750 cc",
      marca: { id: 1, denominacion: "Quilmes" },
      linea: { id: 2, denominacion: "Clásica" },
      stock: 10,
      costo: 100,
      porcentaje: 20,
      precio: 120,
      alicuotaIva: 21,
      sistema: 0,
      codigoProveedor: "COD-01",
    };

    render(<RegistrarActualizarProductoForm {...defaultProps} producto={productoExistente} />);

    const denominacionInput = screen.getByPlaceholderText("Ingresa la denominación") as HTMLInputElement;

    await waitFor(() => {
      expect(denominacionInput.value).toBe("Denominacion Persistida Original");
    });
  });

  it("TP-16: en EDICIÓN cambios en Marca/Línea/Presentación no deben alterar la denominación existente", async () => {
    const productoExistente: any = {
      id: 99,
      denominacion: "Denominacion Persistida Fija",
      presentacion: "750 cc",
      marca: { id: 1, denominacion: "Quilmes" },
      linea: { id: 2, denominacion: "Clásica" },
      stock: 10,
      costo: 100,
      porcentaje: 20,
      precio: 120,
      alicuotaIva: 21,
      sistema: 0,
      codigoProveedor: "COD-01",
    };

    render(<RegistrarActualizarProductoForm {...defaultProps} producto={productoExistente} />);

    const selectLineaDietBtn = screen.getByTestId("select-linea-diet");
    const presentacionInput = screen.getByPlaceholderText("Ej: 1L, 750 cc, 500 g");
    const denominacionInput = screen.getByPlaceholderText("Ingresa la denominación") as HTMLInputElement;

    await waitFor(() => {
      expect(denominacionInput.value).toBe("Denominacion Persistida Fija");
    });

    // Cambiar línea y presentación
    fireEvent.click(selectLineaDietBtn);
    fireEvent.change(presentacionInput, { target: { value: "1000 cc" } });

    // La denominación debe permanecer intacta
    await waitFor(() => {
      expect(denominacionInput.value).toBe("Denominacion Persistida Fija");
    });
  });
});
