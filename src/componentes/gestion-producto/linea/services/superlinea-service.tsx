import ApiService from "../../../../utils/apiService";
import { SelectSuperlinea } from "../../../../interfaces/gestion-producto/superlinea/interfaces-superlinea";

const SuperlineaService = {
  async obtenerTodas(): Promise<SelectSuperlinea[]> {
    return await ApiService.get("/superlinea");
  },
};

export default SuperlineaService;