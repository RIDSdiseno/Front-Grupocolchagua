import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");

  return {
    Authorization: `Bearer ${token}`,
  };
};

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
  const res = await axios.get(`${API_URL}/holdings`, {
    headers: getAuthHeaders(),
  });

  return res.data.holdings;
};

export const obtenerHoldingRequest = async (
  id: number
): Promise<HoldingDetalle> => {
  const res = await axios.get(`${API_URL}/holdings/${id}`, {
    headers: getAuthHeaders(),
  });

  return res.data.holding;
};

export const crearHoldingRequest = async (
  nombre: string
): Promise<Holding> => {
  const res = await axios.post(
    `${API_URL}/holdings`,
    { nombre },
    {
      headers: getAuthHeaders(),
    }
  );

  return res.data.holding;
};

export const actualizarHoldingRequest = async (
  id: number,
  nombre: string
): Promise<Holding> => {
  const res = await axios.put(
    `${API_URL}/holdings/${id}`,
    { nombre },
    {
      headers: getAuthHeaders(),
    }
  );

  return res.data.holding;
};

export const eliminarHoldingRequest = async (id: number): Promise<void> => {
  await axios.delete(`${API_URL}/holdings/${id}`, {
    headers: getAuthHeaders(),
  });
};