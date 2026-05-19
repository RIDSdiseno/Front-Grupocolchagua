import api from "./api";
import type { SucursalForm } from "../types/sucursal";


export const listarSucursalesPorEmpresaRequest = async (
  empresaId: number,
  holdingId?: number
) => {
  const response = await api.get(
    `/sucursales/empresa/${empresaId}`,
    {
      
      params: holdingId ? { holdingId } : {},
    }
  );

  return response.data.sucursales;
};

export const listarTodasSucursalesRequest = async () => {
  const response = await api.get(`/sucursales`, {
    
  });

  return response.data.sucursales;
};

export const crearSucursalRequest = async (
  empresaId: number,
  data: SucursalForm
) => {
  const response = await api.post(
    `/sucursales/empresa/${empresaId}`,
    data,
    {
      
    }
  );

  return response.data;
};

export const actualizarSucursalRequest = async (
  id: number,
  data: Partial<SucursalForm> & { activo?: boolean }
) => {
  const response = await api.put(`/sucursales/${id}`, data, {
    
  });

  return response.data;
};

export const eliminarSucursalRequest = async (id: number) => {
  const response = await api.delete(`/sucursales/${id}`, {
    
  });

  return response.data;
};