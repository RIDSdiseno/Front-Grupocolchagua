import api from "./api";


export interface Holding {
  id: number;
  nombre: string;
  logoUrl?: string | null;
  logoPublicId?: string | null;

  _count?: {
    empresas: number;
  };
}

export interface HoldingSucursal {
  id: number;
  nombre: string;
  empresaId: number;
  holdingId: number;
  direccion?: string | null;
  comuna?: string | null;
  ciudad?: string | null;
  activo?: boolean;
}

export interface HoldingEmpresa {
  id: number;
  holdingId: number;
  empresaId: number;

  Empresa: {
    id: number;
    nombre: string;
    rut?: string | null;
    razonSocial?: string | null;
    logoUrl?: string | null;
    logoPublicId?: string | null;

    Sucursal: HoldingSucursal[];
  };
}

export interface HoldingDetalle extends Holding {
  empresas: HoldingEmpresa[];
}

export const listarHoldingsRequest = async (): Promise<Holding[]> => {
  const res = await api.get(`/holdings`, {
    
  });

  return res.data.holdings;
};

export const obtenerHoldingRequest = async (
  id: number
): Promise<HoldingDetalle> => {
  const res = await api.get(`/holdings/${id}`, {
    
  });

  return res.data.holding;
};

export const crearHoldingRequest = async (
  nombre: string
): Promise<Holding> => {
  const res = await api.post(
    `/holdings`,
    { nombre },
    {
      
    }
  );

  return res.data.holding;
};

export const actualizarHoldingRequest = async (
  id: number,
  nombre: string
): Promise<Holding> => {
  const res = await api.put(
    `/holdings/${id}`,
    { nombre },
    {
      
    }
  );

  return res.data.holding;
};

export const eliminarHoldingRequest = async (id: number): Promise<void> => {
  await api.delete(`/holdings/${id}`, {
    
  });
};