import { useEffect, useState } from "react";
import SuperlineaService from "./services/superlinea-service";
import type { Superlinea } from "../../../interfaces/gestion-producto/superlinea/interfaces-superlinea";
import Paginacion from "../../herramientas/reutilizables/paginacion";
import { Card, CardContent, CardHeader } from "../../ui/Card";
import { useFiltrosContext } from "../../../context/filtros-contesxt";
import {
  Alertas,
  TipoAlerta,
  TituloAlerta,
  useAlerts,
} from "../../herramientas/alertas/alertas";
import {
  TipoAlertaConfirmacion,
  TituloAlertaConfirmacion,
  useConfirmation,
} from "../../herramientas/alertas/alertas-confirmacion";
import {
  Auditoria,
  ResponsePost,
} from "../../../interfaces/generales/interfaces-generales";
import { useSuperlineaModal } from "./hooks/use-superlinea-modal";
import { SuperlineaModal } from "./modales/superlinea-modal";
import { DatosTabla } from "./componentes/datos-tabla";
import { DatosCards } from "./componentes/datos-card";
import {
  FiltrosSuperlinea,
  FiltrosSuperlineaValues,
} from "./componentes/filtros-superlinea";
import { getUsuarioId } from "../../../utils/auth";
import { Layers, PlusCircle } from "lucide-react";
import { Button } from "../../ui/Button";
import { CardTitle } from "../../ui/Card";
import { EstadisticasSimples } from "../../herramientas/reutilizables/estadisticas-simples";

const NOMBRE_COMPONENTE = "consultar-superlinea";

export default function ConsultarSuperlineas() {
  const [superlineas, setSuperlineas] = useState<Superlinea[]>([]);
  const [loading, setLoading] = useState(false);
  const [error] = useState<string | null>(null);

  const { alerts, addAlert, removeAlert } = useAlerts();
  const { showConfirmation, AlertasConfirmacion } = useConfirmation();

  const modal = useSuperlineaModal();
  const usuarioId = getUsuarioId();

  const [filtrosSuperlinea, setFiltrosSuperlinea] =
    useState<FiltrosSuperlineaValues>({
      denominacion: "",
    });

  const [paginaActual, setPaginaActual] = useState(1);
  const [entidadesTotales, setEntidadesTotales] = useState(0);
  const [skip, setSkip] = useState(0);
  const [take, setTake] = useState(10);

  const [filtrosInicializados, setFiltrosInicializados] = useState(false);

  const {
    setFiltrosNecesarios,
    limpiarFiltros,
    buscar,
    setBuscar,
  } = useFiltrosContext();

  useEffect(() => {
    limpiarFiltros();
    setBuscar({ cont: 0, componente: NOMBRE_COMPONENTE });
    setFiltrosNecesarios({ denominacion: true });
    setFiltrosInicializados(true);
  }, []);

  useEffect(() => {
    if (
      buscar.cont > 0 &&
      buscar.componente === NOMBRE_COMPONENTE
    ) {
      handleBuscarSuperlineas(true);
    }
  }, [buscar]);

  const handleAltaSuperlinea = () => {
    modal.abrirAlta();
  };

  const handleAbrirEdicion = async (id: number) => {
    const superlinea = await SuperlineaService.obtenerId(id);
    modal.abrirEdicion(superlinea);
  };

  const handleMostrarInfo = async (id: number) => {
    const auditoria = await SuperlineaService.obtenerAuditoria(id);
    modal.abrirAuditoria(auditoria);
  };

  const handleDelete = async (id: number) => {
    const confirmed = await showConfirmation({
      type: TipoAlertaConfirmacion.DESTRUCTIVE,
      title: TituloAlertaConfirmacion.DESTRUCTIVE,
      message:
        "¿Estás seguro de que quieres eliminar este elemento? Esta acción no se puede deshacer.",
      confirmText: "Eliminar",
      cancelText: "Cancelar",
      onConfirm: () => {},
    });

    if (!confirmed) return;

    try {
      const response: ResponsePost =
        await SuperlineaService.eliminar(id, usuarioId);

      setSuperlineas((prev) =>
        prev.filter((superlinea) => superlinea.id !== id)
      );

      addAlert({
        type: TipoAlerta.SUCCESS,
        title: TituloAlerta.SUCCESS,
        message: response.mensaje,
        autoClose: true,
      });
    } catch {
      addAlert({
        type: TipoAlerta.ERROR,
        title: TituloAlerta.ERROR,
        message:
          "No se puede eliminar esta SuperLínea porque está siendo utilizada por una o más líneas.",
        autoClose: true,
      });
    }
  };

  const handleBuscarSuperlineas = async (botonBuscar?: boolean) => {
    let skipActual = skip;

    if (botonBuscar) {
      skipActual = 0;
      setSkip(0);
      setPaginaActual(1);
    }

    setLoading(true);

    try {
      const filtrosConPaginacion = {
        denominacion: filtrosSuperlinea.denominacion,
        ...(filtrosSuperlinea.incluirEliminados
          ? { incluirEliminados: true }
          : {}),
        skip: skipActual,
        take,
      };

      const response = await SuperlineaService.obtener(
        filtrosConPaginacion
      );

      setSuperlineas(response.data);
      setEntidadesTotales(response.total);
    } finally {
      setLoading(false);
    }
  };

  const handleBuscarDesdeFiltro = (
    filtros: FiltrosSuperlineaValues
  ) => {
    setFiltrosSuperlinea(filtros);
  };

  useEffect(() => {
    if (filtrosInicializados) {
      handleBuscarSuperlineas();
    }
  }, [paginaActual, filtrosInicializados]);

  useEffect(() => {
    if (filtrosInicializados) {
      handleBuscarSuperlineas(true);
    }
  }, [filtrosSuperlinea]);

  const handlePageChange = (
    nuevoSkip: number,
    nuevoTake: number,
    nuevaPagina: number
  ) => {
    setSkip(nuevoSkip);
    setTake(nuevoTake);
    setPaginaActual(nuevaPagina);
  };

  const handleSuccess = async (mensajeAlerta: string) => {
    modal.cerrar();

    addAlert({
      type: TipoAlerta.SUCCESS,
      title: TituloAlerta.SUCCESS,
      message: mensajeAlerta,
      autoClose: true,
    });

    await handleBuscarSuperlineas();
  };

  if (error) {
    return (
      <div className="w-full p-6">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="w-full p-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between p-4 gap-4">
          <div className="flex items-center gap-6">
            <CardTitle className="flex items-center space-x-2">
              <Layers className="consultar-icon" />
              <span>SuperLíneas</span>

              <EstadisticasSimples
                filtrados={entidadesTotales}
                mostrados={superlineas.length}
              />
            </CardTitle>
          </div>

          <Button
            className="bg-blue-500 hover:bg-blue-700 text-white flex items-center px-4 py-3"
            onClick={handleAltaSuperlinea}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Añadir
          </Button>
        </CardHeader>

        <CardContent className="p-0">
          <FiltrosSuperlinea
            onBuscar={handleBuscarDesdeFiltro}
            mostrarIncluirEliminados
          />

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4" />
              <p className="text-gray-600 text-lg">
                Cargando SuperLíneas...
              </p>
            </div>
          ) : (
            <>
              <div className="hidden lg:block">
                <DatosTabla
                  superlineas={superlineas}
                  onEditar={handleAbrirEdicion}
                  onInfo={handleMostrarInfo}
                  onDelete={handleDelete}
                />
              </div>

              <div className="lg:hidden space-y-4">
                {superlineas.map((superlinea) => (
                  <DatosCards
                    key={superlinea.id}
                    superlinea={superlinea}
                    onEditar={handleAbrirEdicion}
                    onInfo={handleMostrarInfo}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <div className="mt-6">
        <Paginacion
          entidadesTotales={entidadesTotales}
          take={take}
          paginaActual={paginaActual}
          onChange={handlePageChange}
        />
      </div>

      <Alertas alerts={alerts} onRemove={removeAlert} />
      <AlertasConfirmacion />

      <SuperlineaModal
        open={modal.tipo !== null}
        tipo={modal.tipo}
        superlinea={modal.superlinea}
        auditoria={modal.auditoria as Auditoria | null}
        onClose={modal.cerrar}
        onSuccess={handleSuccess}
      />
    </div>
  );
}