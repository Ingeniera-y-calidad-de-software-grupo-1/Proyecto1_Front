import React, { useEffect, useState } from "react";
import { History, X, AlertCircle, RefreshCw } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "../../../ui/Card";
import { Button } from "../../../ui/Button";
import ProductoService from "../services/producto-service";
import { HistorialPrecioItem } from "../../../../interfaces/gestion-producto/historial-precios/interfaces-historial-precios";
import { formatPrice } from "../../../herramientas/formateo-de-campos/fucion-formateo";

interface Props {
  producto: { id: number; denominacion: string } | null;
  onClose: () => void;
}

export default function HistorialPreciosModal({ producto, onClose }: Props) {
  const [historial, setHistorial] = useState<HistorialPrecioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargarHistorial = async () => {
    if (!producto) return;
    setLoading(true);
    setError(null);
    try {
      const data = await ProductoService.obtenerHistorialPrecios(producto.id);
      setHistorial(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error("Error al cargar historial de precios:", err);
      setError("No se pudo cargar el historial de precios del producto.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarHistorial();
  }, [producto?.id]);

  const formatearFecha = (fechaStr: string) => {
    try {
      const fecha = new Date(fechaStr);
      return fecha.toLocaleString("es-AR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return fechaStr;
    }
  };

  return (
    <Card className="w-full max-w-4xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-2xl rounded-xl overflow-hidden flex flex-col max-h-[90vh]">
      {/* Header */}
      <CardHeader className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white px-6 py-4 flex flex-row items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
            <History className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-wide">
              Historial de Precios
            </h2>
            <p className="text-xs text-blue-100 font-medium truncate max-w-md">
              {producto?.denominacion ?? "Producto"}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-lg transition-colors focus:outline-none"
          aria-label="Cerrar modal"
        >
          <X className="h-5 w-5" />
        </button>
      </CardHeader>

      {/* Content */}
      <CardContent className="p-6 overflow-y-auto flex-1">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-500">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4" />
            <p className="text-sm font-medium">Cargando historial de precios...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 max-w-md w-full">
              <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
              <p className="text-red-700 dark:text-red-300 text-sm font-medium mb-4">{error}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={cargarHistorial}
                className="gap-2 mx-auto"
              >
                <RefreshCw size={14} /> Reintentar
              </Button>
            </div>
          </div>
        ) : historial.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400 text-center">
            <History className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-3" />
            <p className="text-base font-medium text-gray-600 dark:text-gray-300">
              No hay registros de cambios de precio
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Los cambios de precio realizados en este producto se registrarán automáticamente aquí.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-slate-800 shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 dark:bg-slate-800/70 text-gray-600 dark:text-gray-300 uppercase text-xs font-semibold tracking-wider border-b border-gray-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Fecha y Hora</th>
                  <th className="py-3 px-4 text-right">Precio Anterior</th>
                  <th className="py-3 px-4 text-right">Precio Nuevo</th>
                  <th className="py-3 px-4">Motivo del Cambio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800/60 bg-white dark:bg-slate-900">
                {historial.map((item) => {
                  const ant = Number(item.precioAnterior) || 0;
                  const nvo = Number(item.precioNuevo) || 0;

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-blue-50/50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="py-3 px-4 whitespace-nowrap text-gray-600 dark:text-gray-300 font-mono text-xs">
                        {formatearFecha(item.fecha)}
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-gray-500 line-through">
                        ${formatPrice(ant)}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-gray-900 dark:text-white">
                        ${formatPrice(nvo)}
                      </td>
                      <td className="py-3 px-4 text-gray-700 dark:text-gray-200 max-w-xs break-words">
                        {item.motivo}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>

      {/* Footer */}
      <CardFooter className="bg-gray-50 dark:bg-slate-950 px-6 py-3 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between">
        <span className="text-xs text-gray-500">
          Total de registros: {historial.length}
        </span>
        <Button variant="default" size="sm" onClick={onClose}>
          Cerrar
        </Button>
      </CardFooter>
    </Card>
  );
}
