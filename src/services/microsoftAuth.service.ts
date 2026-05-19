import api from "./api";



interface MicrosoftLoginPayload {
  email: string;
  nombre: string;
  microsoftId: string;
}

export const loginMicrosoftBackend = async (payload: MicrosoftLoginPayload) => {
  const response = await api.post(`/auth/microsoft`, payload);
  return response.data;
};