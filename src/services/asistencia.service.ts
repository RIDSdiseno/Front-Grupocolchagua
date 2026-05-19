import api from "./api";
import type { AsistenciaForm } from "../types/asistencia";

export interface FiltrosAsistencia {
  holdingId?: number;
  empresaId: number;
  sucursalId?: number;
  mes: number;
  año: number;
}

export interface RegistrarAsistenciaPayload {
  trabajadorId: number;
  fecha: string;
  estado: string;
  horasExtras: number;
  turno: string;
  cargoId: number;
  empresaId: number;
  sucursalId?: number | null;
  observacion?: string;
}

export interface RegistrarAsistenciaMasivaPayload {
  registros: RegistrarAsistenciaPayload[];
}

export const listarAsistenciaRequest = async ({
  holdingId,
  empresaId,
  sucursalId,
  mes,
  año,
}: FiltrosAsistencia) => {
  const response = await api.get("/asistencia", {
    params: {
      holdingId,
      empresaId,
      sucursalId,
      mes,
      año,
    },
  });

  return response.data.registros;
};

export const registrarAsistenciaRequest = async (
  data: RegistrarAsistenciaPayload
) => {
  const response = await api.post("/asistencia", data);
  return response.data;
};

export const registrarAsistenciaMasivaRequest = async (
  data: RegistrarAsistenciaMasivaPayload
): Promise<{
  ok: boolean;
  message: string;
  procesados: number;
  errores: string[];
}> => {
  const response = await api.post("/asistencia/bulk", data);
  return response.data;
};

export const actualizarAsistenciaRequest = async (
  id: number,
  data: Partial<AsistenciaForm>
) => {
  const response = await api.put(`/asistencia/${id}`, data);
  return response.data;
};

export const eliminarAsistenciaRequest = async (id: number) => {
  const response = await api.delete(`/asistencia/${id}`);
  return response.data;
};

export const resumenAsistenciaRequest = async ({
  holdingId,
  empresaId,
  sucursalId,
  mes,
  año,
}: FiltrosAsistencia) => {
  const response = await api.get("/asistencia/resumen", {
    params: {
      holdingId,
      empresaId,
      sucursalId,
      mes,
      año,
    },
  });

  return response.data.resumen;
};