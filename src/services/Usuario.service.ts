import api from "./api";

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
  const res = await api.get(`/usuarios`, { headers: getHeaders() });
  return res.data.usuarios;
};

export const crearUsuarioRequest = async (form: UsuarioForm): Promise<Usuario> => {
  const res = await api.post(`/usuarios`, form, { headers: getHeaders() });
  return res.data.usuario;
};

export const actualizarUsuarioRequest = async (
  id: number,
  form: Partial<UsuarioForm>
): Promise<Usuario> => {
  const res = await api.put(`/usuarios/${id}`, form, { headers: getHeaders() });
  return res.data.usuario;
};

export const eliminarUsuarioRequest = async (id: number): Promise<void> => {
  await api.delete(`/usuarios/${id}`, { headers: getHeaders() });
};