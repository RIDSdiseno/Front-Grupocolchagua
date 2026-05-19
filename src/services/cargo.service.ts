import api from "./api";
import type { CargoForm } from "../types/cargo";

export const listarCargosRequest = async () => {
  const response = await api.get(`/cargos`, {
    
  });

  return response.data.cargos;
};

export const crearCargoRequest = async (data: CargoForm) => {
  const response = await api.post(`/cargos`, data, {
    
  });

  return response.data;
};

export const actualizarCargoRequest = async (id: number, data: CargoForm) => {
  const response = await api.put(`/cargos/${id}`, data, {
    
  });

  return response.data;
};

export const eliminarCargoRequest = async (id: number) => {
  const response = await api.delete(`/cargos/${id}`, {
    
  });

  return response.data;
};