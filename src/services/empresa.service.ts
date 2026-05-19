import api from "./api";
import type { EmpresaForm } from "../types/empresa";

export const listarEmpresasRequest = async () => {
  const response = await api.get("/empresas");
  return response.data.empresas;
};

export const crearEmpresaRequest = async (data: EmpresaForm) => {
  const formData = new FormData();

  formData.append("razonSocial", data.razonSocial);
  formData.append("alias", data.alias);
  formData.append("rut", data.rut);

  data.holdingIds.forEach((id) => {
    formData.append("holdingIds", String(id));
  });

  formData.append("encargadoNombre", data.encargadoNombre || "");
  formData.append("encargadoCorreo", data.encargadoCorreo || "");
  formData.append("encargadoTelefono", data.encargadoTelefono || "");

  if (data.foto) {
    formData.append("foto", data.foto);
  }

  const response = await api.post("/empresas", formData, {
    headers: {
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

  data.holdingIds.forEach((holdingId) => {
    formData.append("holdingIds", String(holdingId));
  });

  formData.append("encargadoNombre", data.encargadoNombre || "");
  formData.append("encargadoCorreo", data.encargadoCorreo || "");
  formData.append("encargadoTelefono", data.encargadoTelefono || "");

  if (data.foto) {
    formData.append("foto", data.foto);
  }

  const response = await api.put(`/empresas/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

export const eliminarEmpresaRequest = async (id: number) => {
  const response = await api.delete(`/empresas/${id}`);
  return response.data;
};