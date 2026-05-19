import api from "./api";
import type {
  ActualizarPreLiquidacionPayload,
  GenerarPreLiquidacionesPayload,
  PreLiquidacion,
} from "../types/preliquidaciones";


export const listarPreLiquidacionesRequest = async (params?: {
  empresaId?: number;
  sucursalId?: number;
  trabajadorId?: number;
  mes?: number;
  anio?: number;
  estado?: string;
}): Promise<PreLiquidacion[]> => {
  const res = await api.get(`/preliquidaciones`, {
    
    params,
  });

  return res.data.preliquidaciones;
};

export const generarPreLiquidacionesRequest = async (
  data: GenerarPreLiquidacionesPayload
): Promise<{
  message: string;
  total: number;
  preliquidaciones: PreLiquidacion[];
}> => {
  const res = await api.post(`/preliquidaciones/generar`, data, {
    
  });

  return res.data;
};

export const obtenerPreLiquidacionRequest = async (
  id: number
): Promise<PreLiquidacion> => {
  const res = await api.get(`/preliquidaciones/${id}`, {
    
  });

  return res.data.preliquidacion;
};

export const actualizarPreLiquidacionRequest = async (
  id: number,
  data: ActualizarPreLiquidacionPayload
): Promise<{ message: string; preliquidacion: PreLiquidacion }> => {
  const res = await api.put(`/preliquidaciones/${id}`, data, {
    
  });

  return res.data;
};

export const aprobarPreLiquidacionRequest = async (
  id: number
): Promise<{ message: string; preliquidacion: PreLiquidacion }> => {
  const res = await api.patch(
    `/preliquidaciones/${id}/aprobar`,
    {},
    {
      
    }
  );

  return res.data;
};

export const eliminarPreLiquidacionRequest = async (
  id: number
): Promise<{ message: string }> => {
  const res = await api.delete(`/preliquidaciones/${id}`, {
    
  });

  return res.data;
};