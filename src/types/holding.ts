export interface Holding {
  id: number;
  nombre: string;
  logoUrl?: string | null;
  logoPublicId?: string | null;

  _count?: {
    Empresa: number;
  };
}

export interface HoldingSucursal {
  id: number;
  nombre: string;
  empresaId: number;
  holdingId: number;
  comuna?: string | null;
  ciudad?: string | null;
}

export interface HoldingEmpresa {
  id: number;

  Empresa: {
    id: number;
    nombre: string;
    rut?: string | null;

    Sucursal: HoldingSucursal[];
  };
}

export interface HoldingDetalle extends Holding {
  empresas: HoldingEmpresa[];
}