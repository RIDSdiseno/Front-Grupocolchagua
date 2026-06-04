import api from "./api";
import type {
  ActualizarEmpleoPayload,
  Empleo,
  CrearEmpleoPayload,
} from "../types/empleo";

export const obtenerEmpleos = async (): Promise<Empleo[]> => {
  const { data } = await api.get("/empleos");
  return data.empleos;
};

export const obtenerEmpleosPublicos = async (): Promise<Empleo[]> => {
  const { data } = await api.get("/empleos/publicos");
  return data.empleos;
};

export const obtenerEmpleo = async (id: number): Promise<Empleo> => {
  const { data } = await api.get(`/empleos/${id}`);
  return data.empleo;
};

export const crearEmpleo = async (
  payload: CrearEmpleoPayload
): Promise<Empleo> => {
  const { data } = await api.post("/empleos", payload);
  return data.empleo;
};

export const actualizarEmpleo = async (
  id: number,
  payload: ActualizarEmpleoPayload
): Promise<Empleo> => {
  const { data } = await api.patch(`/empleos/${id}`, payload);
  return data.empleo;
};

export const publicarEmpleo = async (id: number): Promise<Empleo> => {
  const { data } = await api.patch(`/empleos/${id}/publicar`);
  return data.empleo;
};

export const pausarEmpleo = async (id: number): Promise<Empleo> => {
  const { data } = await api.patch(`/empleos/${id}/pausar`);
  return data.empleo;
};

export const cerrarEmpleo = async (id: number): Promise<Empleo> => {
  const { data } = await api.patch(`/empleos/${id}/cerrar`);
  return data.empleo;
};

export const eliminarEmpleo = async (id: number): Promise<void> => {
  await api.delete(`/empleos/${id}`);
};