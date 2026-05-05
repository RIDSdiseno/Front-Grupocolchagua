import axios from "axios";
import type { SucursalForm } from "../types/sucursal";

const API_URL = import.meta.env.VITE_API_URL;

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");

  return {
    Authorization: `Bearer ${token}`,
  };
};

export const listarSucursalesPorEmpresaRequest = async (empresaId: number) => {
  const response = await axios.get(`${API_URL}/sucursales/empresa/${empresaId}`, {
    headers: getAuthHeaders(),
  });

  return response.data.sucursales;
};

export const crearSucursalRequest = async (
  empresaId: number,
  data: SucursalForm
) => {
  const response = await axios.post(
    `${API_URL}/sucursales/empresa/${empresaId}`,
    data,
    {
      headers: getAuthHeaders(),
    }
  );

  return response.data;
};