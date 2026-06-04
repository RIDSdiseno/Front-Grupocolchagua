import api from "./api";
import { Postulacion, EstadoPostulacion } from "../types/postulacion";

export const obtenerPostulaciones = async (): Promise<Postulacion[]> => {
  const { data } = await api.get("/postulaciones");
  return data.postulaciones;
};

export const obtenerPostulacion = async (
  id: number
): Promise<Postulacion> => {
  const { data } = await api.get(`/postulaciones/${id}`);
  return data.postulacion;
};

export const actualizarEstadoPostulacion = async (
  id: number,
  estado: EstadoPostulacion
): Promise<Postulacion> => {
  const { data } = await api.patch(
    `/postulaciones/${id}/estado`,
    { estado }
  );

  return data.postulacion;
};