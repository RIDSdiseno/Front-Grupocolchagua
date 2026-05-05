export interface Sucursal {
  id: number;
  nombre: string;
  direccion?: string | null;
  comuna?: string | null;
  ciudad?: string | null;
  activo: boolean;
  empresaId: number;
}

export interface SucursalForm {
  nombre: string;
  direccion: string;
  comuna: string;
  ciudad: string;
}