import api from "./api";
import type { TrabajadorForm } from "../types/trabajador";

export interface FiltrosTrabajadores {
  activo?: boolean;
  holdingId?: number;
  empresaId?: number;
  sucursalId?: number;
}

export const listarTrabajadoresRequest = async (
  filtros?: FiltrosTrabajadores
) => {
  const response = await api.get(`/trabajadores`, {
    
    params: filtros,
  });

  return response.data.trabajadores;
};

export const obtenerTrabajadorRequest = async (id: number) => {
  const response = await api.get(`/trabajadores/${id}`, {
    
  });

  return response.data.trabajador;
};

export const crearTrabajadorRequest = async (data: TrabajadorForm) => {
  const response = await api.post(`/trabajadores`, data, {
    
  });

  return response.data;
};

export const actualizarTrabajadorRequest = async (
  id: number,
  data: Partial<TrabajadorForm>
) => {
  const response = await api.put(
    `/trabajadores/${id}`,
    data,
    {
      
    }
  );

  return response.data;
};

export const eliminarTrabajadorRequest = async (id: number) => {
  const response = await api.delete(
    `/trabajadores/${id}`,
    {
      
    }
  );

  return response.data;
};