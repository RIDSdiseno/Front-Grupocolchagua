import api from "./api";
import type { AsignacionForm } from "../types/asignacion";

export interface FiltrosAsignacion {
  empresaId?: number;
  trabajadorId?: number;
  sucursalId?: number;
}

export const listarAsignacionesRequest = async (
  filtros?: FiltrosAsignacion
) => {
  const response = await api.get("/asignaciones", {
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

  const response = await api.post("/asignaciones", payload);

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

  const response = await api.put(`/asignaciones/${id}`, payload);

  return response.data;
};

export const eliminarAsignacionRequest = async (id: number) => {
  const response = await api.delete(`/asignaciones/${id}`);

  return response.data;
};