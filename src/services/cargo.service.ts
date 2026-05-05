import axios from "axios";
import type { CargoForm } from "../types/cargo";

const API_URL = import.meta.env.VITE_API_URL;

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");

  return {
    Authorization: `Bearer ${token}`,
  };
};

export const listarCargosRequest = async () => {
  const response = await axios.get(`${API_URL}/cargos`, {
    headers: getAuthHeaders(),
  });

  return response.data.cargos;
};

export const crearCargoRequest = async (data: CargoForm) => {
  const response = await axios.post(`${API_URL}/cargos`, data, {
    headers: getAuthHeaders(),
  });

  return response.data;
};

export const actualizarCargoRequest = async (id: number, data: CargoForm) => {
  const response = await axios.put(`${API_URL}/cargos/${id}`, data, {
    headers: getAuthHeaders(),
  });

  return response.data;
};

export const eliminarCargoRequest = async (id: number) => {
  const response = await axios.delete(`${API_URL}/cargos/${id}`, {
    headers: getAuthHeaders(),
  });

  return response.data;
};