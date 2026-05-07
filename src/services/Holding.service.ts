import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export interface Holding {
  id: number;
  nombre: string;

  _count?: {
    empresas: number;
  };
}

export interface HoldingEmpresa {
  id: number;

  Empresa: {
    id: number;
    nombre: string;
    rut?: string | null;

    Sucursal: {
      id: number;
      nombre: string;
      comuna?: string | null;
      ciudad?: string | null;
    }[];
  };
}

export interface HoldingDetalle extends Holding {
  empresas: HoldingEmpresa[];
}

export const listarHoldingsRequest = async (): Promise<Holding[]> => {
  const token = localStorage.getItem("token");

  const res = await axios.get(`${API_URL}/holdings`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data.holdings;
};

export const obtenerHoldingRequest = async (
  id: number
): Promise<HoldingDetalle> => {
  const token = localStorage.getItem("token");

  const res = await axios.get(`${API_URL}/holdings/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data.holding;
};

export const crearHoldingRequest = async (
  nombre: string
): Promise<Holding> => {
  const token = localStorage.getItem("token");

  const res = await axios.post(
    `${API_URL}/holdings`,
    { nombre },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data.holding;
};

export const actualizarHoldingRequest = async (
  id: number,
  nombre: string
): Promise<Holding> => {
  const token = localStorage.getItem("token");

  const res = await axios.put(
    `${API_URL}/holdings/${id}`,
    { nombre },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data.holding;
};

export const eliminarHoldingRequest = async (
  id: number
): Promise<void> => {
  const token = localStorage.getItem("token");

  await axios.delete(`${API_URL}/holdings/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};