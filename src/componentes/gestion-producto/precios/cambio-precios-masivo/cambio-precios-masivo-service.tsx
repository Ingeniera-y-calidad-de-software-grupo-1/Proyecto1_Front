import axiosConfig from "../../../../utils/axiosConfig";
import axios from "axios";
import { createCrudService } from "../../../../utils/crudFactory";
import { FormValues } from "../../producto/interfaces-validaciones-producto";

const apiUrl = axiosConfig.apiUrl;

const baseService = createCrudService<FormValues>("cambio-precios");

const CambioPreciosMasivoService = {
  ...baseService,
  buscarProductos: async (filtros: {
  marcaId?: number;
  lineaId?: number;
  denominacionLinea?: string;
  denominacionSuperLinea?: string;
  skip?: number;
  take?: number;
}) => {
  try {
    const token = localStorage.getItem("Token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const { data } = await axios.get(
      `${apiUrl}/producto/search-by`,
      {
        headers,
        params: {
          ...filtros,
          skip: filtros.skip ?? 0,
          take: filtros.take ?? 100,
        },
      }
    );

    return data;
  } catch (error) {
    throw error;
  }
},

  aplicarCambios: async (payload: any) => {
    try {
      const token = localStorage.getItem("Token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const { data } = await axios.patch(`${apiUrl}/cambio-precios/aplicar-cambios`, payload, { headers });
      return data;
      } catch (error) {
      throw error;
    }
  },

  actualizarPreciosMasivamente: async (payload: {
  tipo: "porcentaje" | "monto";
  valor: number;
  alcance: "global" | "linea";
  lineaId?: number;
  usuarioId: number;
}) => {
  try {
    const token = localStorage.getItem("Token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const { data } = await axios.put(
      `${apiUrl}/producto/precios/actualizacion-masiva`,
      payload,
      { headers }
    );

    return data;
  } catch (error) {
    throw error;
  }
},

  guardarCambios: async (payload: any) => {
    try {
      const token = localStorage.getItem("Token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const { data } = await axios.patch(`${apiUrl}/cambio-precios/guardar-cambios`, payload, { headers });
      return data;
      } catch (error) {
      throw error;
    }
  },
  
};

export default CambioPreciosMasivoService;
