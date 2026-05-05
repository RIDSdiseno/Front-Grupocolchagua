export interface Trabajador {
  id: number;
  nombre: string;
  apellido: string;
  rut: string;
  telefono?: string | null;
  email?: string | null;
  activo: boolean;
  createdAt: string;
}

export interface TrabajadorForm {
  nombre: string;
  apellido: string;
  rut: string;
  telefono: string;
  email: string;
  activo: boolean;
}
