import axios from "axios";
import type { TarifaForm } from "../types/tarifa";

const API_URL = import.meta.env.VITE_API_URL;

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");

  return {
    Authorization: `Bearer ${token}`,
  };
};

export const listarTarifasPorEmpresaRequest = async (empresaId: number) => {
  const response = await axios.get(`${API_URL}/tarifas/empresa/${empresaId}`, {
    headers: getAuthHeaders(),
  });

  return response.data.tarifas;
};

export const crearTarifaEmpresaRequest = async (
  empresaId: number,
  data: TarifaForm
) => {
  const response = await axios.post(
    `${API_URL}/tarifas/empresa/${empresaId}`,
    {
      sucursalId: data.sucursalId,
      cargoId: data.cargoId,
      pagoPorHora: Number(data.pagoPorHora),
    },
    {
      headers: getAuthHeaders(),
    }
  );

  return response.data;
};

export const actualizarTarifaRequest = async (
  id: number,
  data: TarifaForm
) => {
  const response = await axios.put(
    `${API_URL}/tarifas/${id}`,
    {
      sucursalId: data.sucursalId,
      cargoId: data.cargoId,
      pagoPorHora: Number(data.pagoPorHora),
    },
    {
      headers: getAuthHeaders(),
    }
  );

  return response.data;
};

export const eliminarTarifaRequest = async (id: number) => {
  const response = await axios.delete(`${API_URL}/tarifas/${id}`, {
    headers: getAuthHeaders(),
  });

  return response.data;
};