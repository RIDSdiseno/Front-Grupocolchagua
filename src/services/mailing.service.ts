import axios from "axios";
import type { CrearCampanaPayload, MailingCampana } from "../types/mailing";

const API_URL = import.meta.env.VITE_API_URL;

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");

  return {
    Authorization: `Bearer ${token}`,
  };
};

export const listarCampanasRequest = async (): Promise<MailingCampana[]> => {
  const res = await axios.get(`${API_URL}/mailing`, {
    headers: getAuthHeaders(),
  });

  return res.data.campanas;
};

export const crearCampanaRequest = async (
  data: CrearCampanaPayload
): Promise<{ campana: MailingCampana; message: string }> => {
  const res = await axios.post(`${API_URL}/mailing`, data, {
    headers: getAuthHeaders(),
  });

  return res.data;
};

export const enviarCampanaRequest = async (
  id: number
): Promise<{ campana: MailingCampana; message: string }> => {
  const res = await axios.post(
    `${API_URL}/mailing/${id}/enviar`,
    {},
    {
      headers: getAuthHeaders(),
    }
  );

  return res.data;
};

export const eliminarCampanaRequest = async (
  id: number
): Promise<{ message: string }> => {
  const res = await axios.delete(`${API_URL}/mailing/${id}`, {
    headers: getAuthHeaders(),
  });

  return res.data;
};