import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import RegistrarActualizarProductoForm from "./registrar-actualizar-producto";
import ProductoService from "../services/producto-service";

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

vi.mock("../componentes/configuracion/lineas-selector", () => ({
  default: () => <div data-testid="lineas-selector" />,
}));

vi.mock("../componentes/configuracion/marcas-selector", () => ({
  default: () => <div data-testid="marcas-selector" />,
}));

describe("CR-007 Frontend: Motivo del cambio de precio", () => {
  const mockProductoExistente = {
    id: 99,
    denominacion: "Cerveza Quilmes 1L",
    presentacion: "1L",
    marca: { id: 1, denominacion: "Quilmes" },
    linea: { id: 2, denominacion: "Clásica" },
    stock: 10,
    costo: 100,
    porcentaje: 20,
    precio: 120, // 100 * 1.20 = 120
    alicuotaIva: 21,
    sistema: 0,
    codigoProveedor: "COD-01",
  };

  const defaultProps = {
    onClose: vi.fn(),
    onSuccess: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("TP-CR007-F01: en edición, si el precio no cambia respecto al persistido, NO debe mostrar el campo motivo", () => {
    render(<RegistrarActualizarProductoForm {...defaultProps} producto={mockProductoExistente as any} />);

    expect(
      screen.queryByPlaceholderText("Ingrese el motivo por el cual cambia el precio (obligatorio)"),
    ).toBeNull();
  });

  it("TP-CR007-F02: en alta (nuevo producto), NUNCA debe mostrar el campo motivo", () => {
    render(<RegistrarActualizarProductoForm {...defaultProps} />);

    expect(
      screen.queryByPlaceholderText("Ingrese el motivo por el cual cambia el precio (obligatorio)"),
    ).toBeNull();
  });

  it("TP-CR007-F03: en edición, cuando el costo cambia y genera un precio diferente, DEBE mostrar el campo motivo", async () => {
    const { container } = render(
      <RegistrarActualizarProductoForm {...defaultProps} producto={mockProductoExistente as any} />
    );

    const costoInput = container.querySelector('input[name="costo"]') as HTMLInputElement;
    expect(costoInput).not.toBeNull();

    fireEvent.change(costoInput, { target: { value: "150" } });

    await waitFor(() => {
      expect(
        screen.getByPlaceholderText("Ingrese el motivo por el cual cambia el precio (obligatorio)"),
      ).toBeDefined();
    });
  });

  it("TP-CR007-F04: al enviar el formulario con cambio de precio y motivo válido, debe incluir motivoCambioPrecio en el payload", async () => {
    vi.mocked(ProductoService.actualizar).mockResolvedValue({
      id: 99,
      denominacion: "Cerveza Quilmes 1L",
      mensaje: "Producto actualizado",
    } as any);

    const { container } = render(
      <RegistrarActualizarProductoForm {...defaultProps} producto={mockProductoExistente as any} />
    );

    const costoInput = container.querySelector('input[name="costo"]') as HTMLInputElement;
    expect(costoInput).not.toBeNull();
    fireEvent.change(costoInput, { target: { value: "150" } });

    await waitFor(() => {
      expect(
        screen.getByPlaceholderText("Ingrese el motivo por el cual cambia el precio (obligatorio)"),
      ).toBeDefined();
    });

    const motivoInput = screen.getByPlaceholderText(
      "Ingrese el motivo por el cual cambia el precio (obligatorio)",
    );
    fireEvent.change(motivoInput, {
      target: { value: "Aumento de costos de importación" },
    });

    const submitBtn = screen.getByRole("button", { name: /^actualizar$/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(ProductoService.actualizar).toHaveBeenCalledTimes(1);
      const payloadEnviado = vi.mocked(ProductoService.actualizar).mock.calls[0][1];
      expect(payloadEnviado.motivoCambioPrecio).toBe("Aumento de costos de importación");
    });
  });
});
