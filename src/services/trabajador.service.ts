import axios from "axios";
import type { TrabajadorForm } from "../types/trabajador";

const API_URL = import.meta.env.VITE_API_URL;

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");

  return {
    Authorization: `Bearer ${token}`,
  };
};

export interface FiltrosTrabajadores {
  activo?: boolean;
  holdingId?: number;
  empresaId?: number;
  sucursalId?: number;
}

export const listarTrabajadoresRequest = async (
  filtros?: FiltrosTrabajadores
) => {
  const response = await axios.get(`${API_URL}/trabajadores`, {
    headers: getAuthHeaders(),
    params: filtros,
  });

  return response.data.trabajadores;
};

export const obtenerTrabajadorRequest = async (id: number) => {
  const response = await axios.get(`${API_URL}/trabajadores/${id}`, {
    headers: getAuthHeaders(),
  });

  return response.data.trabajador;
};

export const crearTrabajadorRequest = async (data: TrabajadorForm) => {
  const response = await axios.post(`${API_URL}/trabajadores`, data, {
    headers: getAuthHeaders(),
  });

  return response.data;
};

export const actualizarTrabajadorRequest = async (
  id: number,
  data: Partial<TrabajadorForm>
) => {
  const response = await axios.put(
    `${API_URL}/trabajadores/${id}`,
    data,
    {
      headers: getAuthHeaders(),
    }
  );

  return response.data;
};

export const eliminarTrabajadorRequest = async (id: number) => {
  const response = await axios.delete(
    `${API_URL}/trabajadores/${id}`,
    {
      headers: getAuthHeaders(),
    }
  );

  return response.data;
};