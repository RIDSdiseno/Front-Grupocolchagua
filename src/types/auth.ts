export interface LoginRequest {
  email: string;
  password: string;
}

export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: string;
}

export interface LoginResponse {
  ok: boolean;
  message: string;
  token: string;
  usuario: Usuario;
}