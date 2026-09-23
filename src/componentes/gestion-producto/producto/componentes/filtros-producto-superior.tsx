import { useState, useEffect } from "react";
import { Search, Layers, Tag, X } from "lucide-react";
import { Input } from "../../../ui/Input";
import { Button } from "../../../ui/Button";

export interface FiltrosProductoSuperiorValues {
  denominacion: string;
  denominacionLinea: string;
  denominacionSuperLinea: string;
}

interface FiltrosProductoSuperiorProps {
  valoresIniciales?: Partial<FiltrosProductoSuperiorValues>;
  onBuscar: (filtros: FiltrosProductoSuperiorValues) => void;
  onLimpiar: () => void;
}

export function FiltrosProductoSuperior({
  valoresIniciales,
  onBuscar,
  onLimpiar,
}: FiltrosProductoSuperiorProps) {
  const [denominacion, setDenominacion] = useState(valoresIniciales?.denominacion ?? "");
  const [denominacionLinea, setDenominacionLinea] = useState(valoresIniciales?.denominacionLinea ?? "");
  const [denominacionSuperLinea, setDenominacionSuperLinea] = useState(valoresIniciales?.denominacionSuperLinea ?? "");

  useEffect(() => {
    if (valoresIniciales) {
      if (valoresIniciales.denominacion !== undefined) setDenominacion(valoresIniciales.denominacion);
      if (valoresIniciales.denominacionLinea !== undefined) setDenominacionLinea(valoresIniciales.denominacionLinea);
      if (valoresIniciales.denominacionSuperLinea !== undefined) setDenominacionSuperLinea(valoresIniciales.denominacionSuperLinea);
    }
  }, [valoresIniciales?.denominacion, valoresIniciales?.denominacionLinea, valoresIniciales?.denominacionSuperLinea]);

  const handleBuscar = () => {
    onBuscar({
      denominacion,
      denominacionLinea,
      denominacionSuperLinea,
    });
  };

  const handleLimpiar = () => {
    setDenominacion("");
    setDenominacionLinea("");
    setDenominacionSuperLinea("");
    onLimpiar();
  };

  const tieneFiltros = Boolean(denominacion || denominacionLinea || denominacionSuperLinea);

  return (
    <div className="px-4 py-3 border-b border-gray-200 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/40">
      <div className="flex flex-col md:flex-row items-center gap-3 w-full">
        {/* 1. Denominación Producto */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
          <Input
            type="text"
            placeholder="Buscar por denominación..."
            value={denominacion}
            onChange={(e) => setDenominacion(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleBuscar()}
            className="pl-10 w-full bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600 text-sm"
          />
        </div>

        {/* 2. Denominación Línea */}
        <div className="relative flex-1 w-full">
          <Layers className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
          <Input
            type="text"
            placeholder="Línea..."
            value={denominacionLinea}
            onChange={(e) => setDenominacionLinea(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleBuscar()}
            className="pl-10 w-full bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600 text-sm"
          />
        </div>

        {/* 3. Denominación SuperLínea */}
        <div className="relative flex-1 w-full">
          <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
          <Input
            type="text"
            placeholder="SuperLínea..."
            value={denominacionSuperLinea}
            onChange={(e) => setDenominacionSuperLinea(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleBuscar()}
            className="pl-10 w-full bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600 text-sm"
          />
        </div>

        {/* Botones */}
        <div className="flex items-center gap-2 w-full md:w-auto shrink-0 justify-end">
          <Button
            className="bg-blue-500 hover:bg-blue-600 text-white shrink-0 flex items-center justify-center w-full md:w-auto px-4"
            onClick={handleBuscar}
          >
            <Search className="h-4 w-4 mr-1.5" />
            Buscar
          </Button>

          {tieneFiltros && (
            <Button
              variant="outline"
              className="text-gray-600 dark:text-gray-300 border-gray-300 dark:border-slate-600 hover:bg-gray-100 dark:hover:bg-slate-700 shrink-0 flex items-center justify-center"
              onClick={handleLimpiar}
              title="Limpiar filtros superiores"
            >
              <X className="h-4 w-4 mr-1" />
              Limpiar
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
