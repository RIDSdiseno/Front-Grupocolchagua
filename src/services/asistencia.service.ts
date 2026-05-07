import axios from "axios";
import type { AsistenciaForm } from "../types/asistencia";

const API_URL = import.meta.env.VITE_API_URL;

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");

  return {
    Authorization: `Bearer ${token}`,
  };
};

export interface FiltrosAsistencia {
  holdingId?: number;
  empresaId: number;
  sucursalId?: number;
  mes: number;
  año: number;
}

export const listarAsistenciaRequest = async ({
  holdingId,
  empresaId,
  sucursalId,
  mes,
  año,
}: FiltrosAsistencia) => {
  const response = await axios.get(`${API_URL}/asistencia`, {
    headers: getAuthHeaders(),
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

export const registrarAsistenciaRequest = async (data: {
  trabajadorId: number;
  fecha: string;
  estado: string;
  horasExtras: number;
  turno: string;
  cargoId: number;
  empresaId: number;
  sucursalId?: number | null;
  observacion?: string;
}) => {
  const response = await axios.post(`${API_URL}/asistencia`, data, {
    headers: getAuthHeaders(),
  });

  return response.data;
};

export const actualizarAsistenciaRequest = async (
  id: number,
  data: Partial<AsistenciaForm>
) => {
  const response = await axios.put(`${API_URL}/asistencia/${id}`, data, {
    headers: getAuthHeaders(),
  });

  return response.data;
};

export const eliminarAsistenciaRequest = async (id: number) => {
  const response = await axios.delete(`${API_URL}/asistencia/${id}`, {
    headers: getAuthHeaders(),
  });

  return response.data;
};

export const resumenAsistenciaRequest = async ({
  holdingId,
  empresaId,
  sucursalId,
  mes,
  año,
}: FiltrosAsistencia) => {
  const response = await axios.get(`${API_URL}/asistencia/resumen`, {
    headers: getAuthHeaders(),
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