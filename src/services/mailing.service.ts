import api from "./api";
import type { CrearCampanaPayload, MailingCampana } from "../types/mailing";

const crearFormDataCampana = (data: CrearCampanaPayload) => {
  const formData = new FormData();

  formData.append("asunto", data.asunto);
  formData.append("cuerpo", data.cuerpo);
  formData.append("grupo", data.grupo);

  if (data.emailsPersonalizados) {
    formData.append("emailsPersonalizados", data.emailsPersonalizados);
  }

  if (data.fechaProgramada) {
    formData.append("fechaProgramada", data.fechaProgramada);
  }

  data.archivos?.forEach((archivo) => {
    formData.append("archivos", archivo);
  });

  return formData;
};

export const listarCampanasRequest = async (): Promise<MailingCampana[]> => {
  const res = await api.get("/mailing");
  return res.data.campanas;
};

export const crearCampanaRequest = async (
  data: CrearCampanaPayload
): Promise<{ campana: MailingCampana; message: string }> => {
  const tieneArchivos = Boolean(data.archivos && data.archivos.length > 0);

  if (tieneArchivos) {
    const formData = crearFormDataCampana(data);

    const res = await api.post("/mailing", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return res.data;
  }

  const res = await api.post("/mailing", data);
  return res.data;
};

export const enviarCampanaRequest = async (
  id: number
): Promise<{ campana: MailingCampana; message: string }> => {
  const res = await api.post(`/mailing/${id}/enviar`, {});
  return res.data;
};

export const eliminarCampanaRequest = async (
  id: number
): Promise<{ message: string }> => {
  const res = await api.delete(`/mailing/${id}`);
  return res.data;
};