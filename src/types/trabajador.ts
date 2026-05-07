export interface Trabajador {
  id: number;
  nombre: string;
  apellido: string;
  rut: string;
  telefono?: string | null;
  email?: string | null;
  activo: boolean;
  createdAt: string;

  Asignacion?: {
    id: number;
    empresaId: number;
    sucursalId?: number | null;
    cargoId: number;

    Empresa?: {
      id: number;
      nombre: string;
    };

    Sucursal?: {
      id: number;
      nombre: string;
      holdingId: number;
      empresaId: number;
      comuna?: string | null;
      ciudad?: string | null;
    } | null;

    Cargo?: {
      id: number;
      nombre: string;
    };
  }[];
}

export interface TrabajadorForm {
  nombre: string;
  apellido: string;
  rut: string;
  telefono: string;
  email: string;
  activo: boolean;
}