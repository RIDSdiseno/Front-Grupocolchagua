export interface SucursalHolding {
  id: number;
  nombre: string;
}

export interface SucursalEmpresa {
  id: number;
  nombre: string;

  holdings?: {
    id: number;
    holdingId: number;
    empresaId: number;

    Holding: {
      id: number;
      nombre: string;
    };
  }[];
}

export interface Sucursal {
  id: number;
  nombre: string;
  direccion?: string | null;
  comuna?: string | null;
  ciudad?: string | null;
  activo: boolean;

  empresaId: number;
  holdingId: number;

  Empresa?: SucursalEmpresa;
  Holding?: SucursalHolding;
}

export interface SucursalForm {
  nombre: string;
  direccion: string;
  comuna: string;
  ciudad: string;

  holdingId?: number | string;
  activo?: boolean;
}