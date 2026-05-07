import axios from "axios";
import type { AsignacionForm } from "../types/asignacion";

const API_URL = import.meta.env.VITE_API_URL;

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");

  return {
    Authorization: `Bearer ${token}`,
  };
};

export interface FiltrosAsignacion {
  empresaId?: number;
  trabajadorId?: number;
  sucursalId?: number;
}

export const listarAsignacionesRequest = async (
  filtros?: FiltrosAsignacion
) => {
  const response = await axios.get(`${API_URL}/asignaciones`, {
    headers: getAuthHeaders(),
    params: filtros,
  });

  return response.data.asignaciones;
};

export const crearAsignacionRequest = async (data: AsignacionForm) => {
  const payload = {
    trabajadorId: data.trabajadorId || undefined,
    empresaId: data.empresaId || undefined,
    sucursalId: data.sucursalId || null,
    cargoId: data.cargoId || undefined,
    fechaInicio: data.fechaInicio,
    fechaFin: data.fechaFin || null,
  };

  const response = await axios.post(`${API_URL}/asignaciones`, payload, {
    headers: getAuthHeaders(),
  });

  return response.data;
};

export const actualizarAsignacionRequest = async (
  id: number,
  data: Partial<AsignacionForm>
) => {
  const payload = {
    ...data,
    sucursalId: data.sucursalId || null,
    fechaFin: data.fechaFin || null,
  };

  const response = await axios.put(
    `${API_URL}/asignaciones/${id}`,
    payload,
    {
      headers: getAuthHeaders(),
    }
  );

  return response.data;
};

export const eliminarAsignacionRequest = async (id: number) => {
  const response = await axios.delete(`${API_URL}/asignaciones/${id}`, {
    headers: getAuthHeaders(),
  });

  return response.data;
};