import api from "./api";
import type {
  ActualizarIncidenciaPayload,
  CrearIncidenciaPayload,
  IncidenciaAsistencia,
  ResumenIncidenciaTrabajador,
} from "../types/incidencias";


export const listarIncidenciasRequest = async (params?: {
  empresaId?: number;
  trabajadorId?: number;
  sucursalId?: number;
  tipo?: string;
  mes?: number;
  año?: number;
}): Promise<IncidenciaAsistencia[]> => {
  const res = await api.get(`/incidencias`, {
    
    params,
  });

  return res.data.incidencias;
};

export const crearIncidenciaRequest = async (
  data: CrearIncidenciaPayload
): Promise<{ incidencia: IncidenciaAsistencia; message: string }> => {
  const res = await api.post(`/incidencias`, data, {
    
  });

  return res.data;
};

export const actualizarIncidenciaRequest = async (
  id: number,
  data: ActualizarIncidenciaPayload
): Promise<{ incidencia: IncidenciaAsistencia; message: string }> => {
  const res = await api.put(`/incidencias/${id}`, data, {
    
  });

  return res.data;
};

export const eliminarIncidenciaRequest = async (
  id: number
): Promise<{ message: string }> => {
  const res = await api.delete(`/incidencias/${id}`, {
    
  });

  return res.data;
};

export const resumenIncidenciasRequest = async (params: {
  empresaId: number;
  sucursalId?: number;
  mes: number;
  año: number;
}): Promise<ResumenIncidenciaTrabajador[]> => {
  const res = await api.get(`/incidencias/resumen`, {
    
    params,
  });

  return res.data.resumen;
};