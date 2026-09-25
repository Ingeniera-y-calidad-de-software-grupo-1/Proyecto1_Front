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
  default: ({ onLineaChange, denominacionLinea, setDenominacionLinea }: any) => (
    <div>
      <input
        data-testid="search-input-linea"
        placeholder="Buscar Línea"
        value={denominacionLinea}
        onChange={(e) => setDenominacionLinea?.(e.target.value)}
      />
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
      <button
        type="button"
        data-testid="select-linea-aceitunas"
        onClick={() => onLineaChange({ id: 5, denominacion: "ACEITUNAS" })}
      >
        Select Linea Aceitunas
      </button>
    </div>
  ),
}));

vi.mock("../componentes/configuracion/marcas-selector", () => ({
  default: ({ onChangeMarca, denominacionMarca, setDenominacionMarca }: any) => (
    <div>
      <input
        data-testid="search-input-marca"
        placeholder="Buscar Marca"
        value={denominacionMarca}
        onChange={(e) => setDenominacionMarca?.(e.target.value)}
      />
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
      <button
        type="button"
        data-testid="select-marca-circe"
        onClick={() => onChangeMarca({ id: 3, denominacion: "CIRCE" })}
      >
        Select Marca Circe
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

  it("TP-17: caso real CIRCE + ACEITUNAS + 500g => CIRCE ACEITUNAS 500g, cambio a 1kg, override manual y vaciado para restablecer", async () => {
    render(<RegistrarActualizarProductoForm {...defaultProps} />);

    const denominacionInput = screen.getByPlaceholderText("Ingresa la denominación") as HTMLInputElement;
    const presentacionInput = screen.getByPlaceholderText("Ej: 1L, 750 cc, 500 g");
    const selectMarcaCirceBtn = screen.getByTestId("select-marca-circe");
    const selectLineaAceitunasBtn = screen.getByTestId("select-linea-aceitunas");

    // Al montar en ALTA, no debe disparar validación prematura de error
    expect(screen.queryByText("La denominación es obligatoria.")).toBeNull();
    expect(denominacionInput.value).toBe("");

    // 1. Marca = CIRCE, Línea = ACEITUNAS, Presentación = 500g
    fireEvent.click(selectMarcaCirceBtn);
    fireEvent.click(selectLineaAceitunasBtn);
    fireEvent.change(presentacionInput, { target: { value: "500g" } });

    await waitFor(() => {
      expect(denominacionInput.value).toBe("CIRCE ACEITUNAS 500g");
    });
    expect(screen.queryByText("La denominación es obligatoria.")).toBeNull();

    // 2. Cambio de Presentación: 500g -> 1kg
    fireEvent.change(presentacionInput, { target: { value: "1kg" } });

    await waitFor(() => {
      expect(denominacionInput.value).toBe("CIRCE ACEITUNAS 1kg");
    });

    // 3. Edición manual del usuario: CIRCE ACEITUNAS VERDES 1kg
    fireEvent.change(denominacionInput, { target: { value: "CIRCE ACEITUNAS VERDES 1kg" } });
    fireEvent.input(denominacionInput, { target: { value: "CIRCE ACEITUNAS VERDES 1kg" } });

    await waitFor(() => {
      expect(denominacionInput.value).toBe("CIRCE ACEITUNAS VERDES 1kg");
    });

    // 4. Cambios posteriores en Línea/Presentación NO deben sobrescribirla
    const selectLineaDietBtn = screen.getByTestId("select-linea-diet");
    fireEvent.click(selectLineaDietBtn);
    fireEvent.change(presentacionInput, { target: { value: "2kg" } });

    await waitFor(() => {
      expect(denominacionInput.value).toBe("CIRCE ACEITUNAS VERDES 1kg");
    });

    // 5. El usuario vacía completamente el input durante ALTA => vuelve al modo automático
    fireEvent.change(denominacionInput, { target: { value: "" } });
    fireEvent.input(denominacionInput, { target: { value: "" } });

    await waitFor(() => {
      // Regenerado automáticamente con Marca (CIRCE) + Línea actual (Diet) + Presentación actual (2kg)
      expect(denominacionInput.value).toBe("CIRCE Diet 2kg");
    });
  });

  it("TP-18: escribir texto en buscador sin selección NO debe simular Marca/Línea; autocompone solo cuando las tres partes son válidas", async () => {
    render(<RegistrarActualizarProductoForm {...defaultProps} />);

    const searchMarcaInput = screen.getByTestId("search-input-marca");
    const searchLineaInput = screen.getByTestId("search-input-linea");
    const presentacionInput = screen.getByPlaceholderText("Ej: 1L, 750 cc, 500 g");
    const denominacionInput = screen.getByPlaceholderText("Ingresa la denominación") as HTMLInputElement;

    // 1. Usuario escribe "CIRCE" en el buscador de Marca pero NO selecciona ninguna opción del selector
    fireEvent.change(searchMarcaInput, { target: { value: "CIRCE" } });

    // 2. Usuario escribe "ACEITUNAS" en el buscador de Línea pero NO selecciona ninguna opción del selector
    fireEvent.change(searchLineaInput, { target: { value: "ACEITUNAS" } });

    // 3. Presentación = "500g"
    fireEvent.change(presentacionInput, { target: { value: "500g" } });

    // Sin Marca ni Línea seleccionadas, la denominación DEBE permanecer vacía (no denominaciones parciales)
    await waitFor(() => {
      expect(denominacionInput.value).toBe("");
    });

    // 4. Marca seleccionada + Línea faltante + Presentación => vacío
    const selectMarcaCirceBtn = screen.getByTestId("select-marca-circe");
    fireEvent.click(selectMarcaCirceBtn);

    await waitFor(() => {
      expect(denominacionInput.value).toBe("");
    });

    // 5. Ahora se selecciona realmente Línea ACEITUNAS (las tres partes válidas: CIRCE + ACEITUNAS + 500g)
    const selectLineaAceitunasBtn = screen.getByTestId("select-linea-aceitunas");
    fireEvent.click(selectLineaAceitunasBtn);

    // Con las tres partes válidas, autocompone inmediatamente a "CIRCE ACEITUNAS 500g"
    await waitFor(() => {
      expect(denominacionInput.value).toBe("CIRCE ACEITUNAS 500g");
    });

    // 6. Marca + Línea seleccionadas + Presentación vacía => vacío
    fireEvent.change(presentacionInput, { target: { value: "" } });
    await waitFor(() => {
      expect(denominacionInput.value).toBe("");
    });
  });

  it("TP-19: autocomposición requiere estrictamente las tres partes (Línea seleccionada + Marca faltante + Presentación => vacío)", async () => {
    render(<RegistrarActualizarProductoForm {...defaultProps} />);

    const selectLineaAceitunasBtn = screen.getByTestId("select-linea-aceitunas");
    const presentacionInput = screen.getByPlaceholderText("Ej: 1L, 750 cc, 500 g");
    const denominacionInput = screen.getByPlaceholderText("Ingresa la denominación") as HTMLInputElement;

    // Línea seleccionada + Presentación con valor, pero SIN Marca seleccionada
    fireEvent.click(selectLineaAceitunasBtn);
    fireEvent.change(presentacionInput, { target: { value: "500g" } });

    await waitFor(() => {
      expect(denominacionInput.value).toBe("");
    });

    // Al seleccionar finalmente la Marca faltante, autocompone
    const selectMarcaCirceBtn = screen.getByTestId("select-marca-circe");
    fireEvent.click(selectMarcaCirceBtn);

    await waitFor(() => {
      expect(denominacionInput.value).toBe("CIRCE ACEITUNAS 500g");
    });
  });
});
