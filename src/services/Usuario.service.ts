import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: string;
}

export interface UsuarioForm {
  nombre: string;
  email: string;
  password: string;
  rol: string;
}

const getHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

export const listarUsuariosRequest = async (): Promise<Usuario[]> => {
  const res = await axios.get(`${API_URL}/usuarios`, { headers: getHeaders() });
  return res.data.usuarios;
};

export const crearUsuarioRequest = async (form: UsuarioForm): Promise<Usuario> => {
  const res = await axios.post(`${API_URL}/usuarios`, form, { headers: getHeaders() });
  return res.data.usuario;
};

export const actualizarUsuarioRequest = async (
  id: number,
  form: Partial<UsuarioForm>
): Promise<Usuario> => {
  const res = await axios.put(`${API_URL}/usuarios/${id}`, form, { headers: getHeaders() });
  return res.data.usuario;
};

export const eliminarUsuarioRequest = async (id: number): Promise<void> => {
  await axios.delete(`${API_URL}/usuarios/${id}`, { headers: getHeaders() });
};