import axios from "axios";
import type { EmpresaForm } from "../types/empresa";

const API_URL = import.meta.env.VITE_API_URL;

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");

  return {
    Authorization: `Bearer ${token}`,
  };
};

export const listarEmpresasRequest = async () => {
  const response = await axios.get(`${API_URL}/empresas`, {
    headers: getAuthHeaders(),
  });

  return response.data.empresas;
};

export const crearEmpresaRequest = async (data: EmpresaForm) => {
  const formData = new FormData();

  formData.append("razonSocial", data.razonSocial);
  formData.append("alias", data.alias);
  formData.append("rut", data.rut);

  // 🔥 NUEVO: enviar datos del encargado
  formData.append("encargadoNombre", data.encargadoNombre || "");
  formData.append("encargadoCorreo", data.encargadoCorreo || "");
  formData.append("encargadoTelefono", data.encargadoTelefono || "");

  if (data.foto) {
    formData.append("foto", data.foto);
  }

  const response = await axios.post(`${API_URL}/empresas`, formData, {
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

export const actualizarEmpresaRequest = async (
  id: number,
  data: EmpresaForm
) => {
  const formData = new FormData();

  formData.append("razonSocial", data.razonSocial);
  formData.append("alias", data.alias);
  formData.append("rut", data.rut);

  // 🔥 NUEVO: enviar datos del encargado
  formData.append("encargadoNombre", data.encargadoNombre || "");
  formData.append("encargadoCorreo", data.encargadoCorreo || "");
  formData.append("encargadoTelefono", data.encargadoTelefono || "");

  if (data.foto) {
    formData.append("foto", data.foto);
  }

  const response = await axios.put(`${API_URL}/empresas/${id}`, formData, {
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

export const eliminarEmpresaRequest = async (id: number) => {
  const response = await axios.delete(`${API_URL}/empresas/${id}`, {
    headers: getAuthHeaders(),
  });

  return response.data;
};