import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import RegistrarActualizarProductoForm from "./registrar-actualizar-producto";

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
      <button
        type="button"
        data-testid="select-linea-chocolates"
        onClick={() => onLineaChange({ id: 20, denominacion: "CHOCOLATES" })}
      >
        Select Linea Chocolates
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
      <button
        type="button"
        data-testid="select-marca-caroyense"
        onClick={() => onChangeMarca({ id: 4, denominacion: "CAROYENSE" })}
      >
        Select Marca Caroyense
      </button>
    </div>
  ),
}));

describe("CR-005 Frontend: Denominación generada por botón y editable manualmente", () => {
  const defaultProps = {
    onClose: vi.fn(),
    onSuccess: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("TP-11: Marca = CAROYENSE, Línea = CHOCOLATES, Presentación = 500g, al presionar 'Generar denominación' => CAROYENSE CHOCOLATES 500g", async () => {
    render(<RegistrarActualizarProductoForm {...defaultProps} />);

    const selectMarcaCaroyense = screen.getByTestId("select-marca-caroyense");
    const selectLineaChocolates = screen.getByTestId("select-linea-chocolates");
    const presentacionInput = screen.getByPlaceholderText("Ej: 1L, 750 cc, 500 g");
    const denominacionInput = screen.getByPlaceholderText("Ingresa la denominación") as HTMLInputElement;
    const btnGenerar = screen.getByRole("button", { name: /generar denominación/i });

    fireEvent.click(selectMarcaCaroyense);
    fireEvent.click(selectLineaChocolates);
    fireEvent.change(presentacionInput, { target: { value: "500g" } });

    // Antes de presionar el botón, no autocompone automáticamente
    expect(denominacionInput.value).toBe("");

    // Presionar botón
    fireEvent.click(btnGenerar);

    await waitFor(() => {
      expect(denominacionInput.value).toBe("CAROYENSE CHOCOLATES 500g");
    });
  });

  it("TP-12: Cambiar Presentación de 500g a 1kg SIN presionar el botón => la denominación NO cambia automáticamente", async () => {
    render(<RegistrarActualizarProductoForm {...defaultProps} />);

    const selectMarcaCaroyense = screen.getByTestId("select-marca-caroyense");
    const selectLineaChocolates = screen.getByTestId("select-linea-chocolates");
    const presentacionInput = screen.getByPlaceholderText("Ej: 1L, 750 cc, 500 g");
    const denominacionInput = screen.getByPlaceholderText("Ingresa la denominación") as HTMLInputElement;
    const btnGenerar = screen.getByRole("button", { name: /generar denominación/i });

    fireEvent.click(selectMarcaCaroyense);
    fireEvent.click(selectLineaChocolates);
    fireEvent.change(presentacionInput, { target: { value: "500g" } });
    fireEvent.click(btnGenerar);

    await waitFor(() => {
      expect(denominacionInput.value).toBe("CAROYENSE CHOCOLATES 500g");
    });

    // Cambiar presentación a 1kg sin tocar el botón
    fireEvent.change(presentacionInput, { target: { value: "1kg" } });

    // La denominación NO debe cambiar reactivamente
    expect(denominacionInput.value).toBe("CAROYENSE CHOCOLATES 500g");
  });

  it("TP-13: Después de presionar nuevamente 'Generar denominación' => se actualiza a CAROYENSE CHOCOLATES 1kg", async () => {
    render(<RegistrarActualizarProductoForm {...defaultProps} />);

    const selectMarcaCaroyense = screen.getByTestId("select-marca-caroyense");
    const selectLineaChocolates = screen.getByTestId("select-linea-chocolates");
    const presentacionInput = screen.getByPlaceholderText("Ej: 1L, 750 cc, 500 g");
    const denominacionInput = screen.getByPlaceholderText("Ingresa la denominación") as HTMLInputElement;
    const btnGenerar = screen.getByRole("button", { name: /generar denominación/i });

    fireEvent.click(selectMarcaCaroyense);
    fireEvent.click(selectLineaChocolates);
    fireEvent.change(presentacionInput, { target: { value: "500g" } });
    fireEvent.click(btnGenerar);

    await waitFor(() => {
      expect(denominacionInput.value).toBe("CAROYENSE CHOCOLATES 500g");
    });

    // Cambiar presentación a 1kg
    fireEvent.change(presentacionInput, { target: { value: "1kg" } });

    // Presionar nuevamente el botón
    fireEvent.click(btnGenerar);

    await waitFor(() => {
      expect(denominacionInput.value).toBe("CAROYENSE CHOCOLATES 1kg");
    });
  });

  it("TP-14: Editar manualmente la denominación => el texto personalizado permanece", async () => {
    render(<RegistrarActualizarProductoForm {...defaultProps} />);

    const selectMarcaCaroyense = screen.getByTestId("select-marca-caroyense");
    const selectLineaChocolates = screen.getByTestId("select-linea-chocolates");
    const presentacionInput = screen.getByPlaceholderText("Ej: 1L, 750 cc, 500 g");
    const denominacionInput = screen.getByPlaceholderText("Ingresa la denominación") as HTMLInputElement;
    const btnGenerar = screen.getByRole("button", { name: /generar denominación/i });

    fireEvent.click(selectMarcaCaroyense);
    fireEvent.click(selectLineaChocolates);
    fireEvent.change(presentacionInput, { target: { value: "500g" } });
    fireEvent.click(btnGenerar);

    await waitFor(() => {
      expect(denominacionInput.value).toBe("CAROYENSE CHOCOLATES 500g");
    });

    // Edición manual del usuario
    fireEvent.change(denominacionInput, { target: { value: "CAROYENSE CHOCOLATES AMARGO 500g" } });

    expect(denominacionInput.value).toBe("CAROYENSE CHOCOLATES AMARGO 500g");

    // Cambiar presentación o línea no altera la denominación personalizada
    fireEvent.change(presentacionInput, { target: { value: "2kg" } });
    expect(denominacionInput.value).toBe("CAROYENSE CHOCOLATES AMARGO 500g");
  });

  it("TP-15: Falta Marca => botón no genera denominación y muestra/activa error correspondiente", async () => {
    render(<RegistrarActualizarProductoForm {...defaultProps} />);

    const selectLineaChocolates = screen.getByTestId("select-linea-chocolates");
    const presentacionInput = screen.getByPlaceholderText("Ej: 1L, 750 cc, 500 g");
    const denominacionInput = screen.getByPlaceholderText("Ingresa la denominación") as HTMLInputElement;
    const btnGenerar = screen.getByRole("button", { name: /generar denominación/i });

    fireEvent.click(selectLineaChocolates);
    fireEvent.change(presentacionInput, { target: { value: "500g" } });

    fireEvent.click(btnGenerar);

    expect(denominacionInput.value).toBe("");
    await waitFor(() => {
      expect(screen.getByText("Debe seleccionar una Marca para generar la denominación.")).toBeDefined();
    });
  });

  it("TP-16: Falta Línea => no genera y muestra error correspondiente", async () => {
    render(<RegistrarActualizarProductoForm {...defaultProps} />);

    const selectMarcaCaroyense = screen.getByTestId("select-marca-caroyense");
    const presentacionInput = screen.getByPlaceholderText("Ej: 1L, 750 cc, 500 g");
    const denominacionInput = screen.getByPlaceholderText("Ingresa la denominación") as HTMLInputElement;
    const btnGenerar = screen.getByRole("button", { name: /generar denominación/i });

    fireEvent.click(selectMarcaCaroyense);
    fireEvent.change(presentacionInput, { target: { value: "500g" } });

    fireEvent.click(btnGenerar);

    expect(denominacionInput.value).toBe("");
    await waitFor(() => {
      expect(screen.getByText("Debe seleccionar una Línea para generar la denominación.")).toBeDefined();
    });
  });

  it("TP-17: Falta Presentación => no genera y muestra error correspondiente", async () => {
    render(<RegistrarActualizarProductoForm {...defaultProps} />);

    const selectMarcaCaroyense = screen.getByTestId("select-marca-caroyense");
    const selectLineaChocolates = screen.getByTestId("select-linea-chocolates");
    const denominacionInput = screen.getByPlaceholderText("Ingresa la denominación") as HTMLInputElement;
    const btnGenerar = screen.getByRole("button", { name: /generar denominación/i });

    fireEvent.click(selectMarcaCaroyense);
    fireEvent.click(selectLineaChocolates);

    fireEvent.click(btnGenerar);

    expect(denominacionInput.value).toBe("");
    await waitFor(() => {
      expect(screen.getByText("Debe ingresar una Presentación para generar la denominación.")).toBeDefined();
    });
  });

  it("TP-18: Texto escrito en buscador de Marca/Línea pero sin selección real => no debe tomarse como Marca/Línea válida", async () => {
    render(<RegistrarActualizarProductoForm {...defaultProps} />);

    const searchMarcaInput = screen.getByTestId("search-input-marca");
    const searchLineaInput = screen.getByTestId("search-input-linea");
    const presentacionInput = screen.getByPlaceholderText("Ej: 1L, 750 cc, 500 g");
    const denominacionInput = screen.getByPlaceholderText("Ingresa la denominación") as HTMLInputElement;
    const btnGenerar = screen.getByRole("button", { name: /generar denominación/i });

    // Escribir en buscadores sin seleccionar en dropdown
    fireEvent.change(searchMarcaInput, { target: { value: "CAROYENSE" } });
    fireEvent.change(searchLineaInput, { target: { value: "CHOCOLATES" } });
    fireEvent.change(presentacionInput, { target: { value: "500g" } });

    // Presionar generar
    fireEvent.click(btnGenerar);

    // No debe generarse con textos de búsqueda
    expect(denominacionInput.value).toBe("");
    await waitFor(() => {
      expect(screen.getByText("Debe seleccionar una Marca para generar la denominación.")).toBeDefined();
    });
  });

  it("TP-19: Abrir producto existente => conserva la denominación persistida", async () => {
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
    const presentacionInput = screen.getByPlaceholderText("Ej: 1L, 750 cc, 500 g");

    await waitFor(() => {
      expect(denominacionInput.value).toBe("Denominacion Persistida Original");
    });

    // Cambiar presentación sin presionar el botón no altera la denominación existente
    fireEvent.change(presentacionInput, { target: { value: "1L" } });
    expect(denominacionInput.value).toBe("Denominacion Persistida Original");
  });

  it("TP-20: En edición, presionar explícitamente 'Generar denominación' => reemplaza la denominación con Marca + Línea + Presentación actuales", async () => {
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

    const denominacionInput = screen.getByPlaceholderText("Ingresa la denominación") as HTMLInputElement;
    const presentacionInput = screen.getByPlaceholderText("Ej: 1L, 750 cc, 500 g");
    const selectLineaDietBtn = screen.getByTestId("select-linea-diet");
    const btnGenerar = screen.getByRole("button", { name: /generar denominación/i });

    await waitFor(() => {
      expect(denominacionInput.value).toBe("Denominacion Persistida Fija");
    });

    // Cambiar Línea a Diet y Presentación a 1000 cc
    fireEvent.click(selectLineaDietBtn);
    fireEvent.change(presentacionInput, { target: { value: "1000 cc" } });

    // Antes de presionar, se conserva la denominación previa
    expect(denominacionInput.value).toBe("Denominacion Persistida Fija");

    // Al presionar explícitamente "Generar denominación" en edición, se recompone con los valores actuales
    fireEvent.click(btnGenerar);

    await waitFor(() => {
      expect(denominacionInput.value).toBe("Quilmes Diet 1000 cc");
    });
  });
});
