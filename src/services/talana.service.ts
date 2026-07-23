import api from "./api";
import type {
  FiltrosLiquidacionesTalana,
  ResultadoMuestraContratoTalana,
  ResultadoTrabajadoresConMarcacionesTalana,
  TalanaComprobanteLiquidacion,
  TalanaCoincidenciaTrabajador,
  TalanaLiquidacion,
  TalanaPersona,
  TalanaRespuestaListado,
  TalanaRespuestaPaginada,
} from "../types/talana";

export const testConexionTalanaRequest = async () => {
  const response = await api.get("/talana/test");
  return response.data;
};

export const buscarTrabajadorTalanaRequest = async (
  rut: string,
  empresa: number | "ambas"
) => {
  const response = await api.get("/talana/trabajador", {
    params: { rut, empresa },
  });

  return response.data as {
    success: boolean;
    message: string;
    data?: TalanaCoincidenciaTrabajador["persona"];
    coincidencias?: TalanaCoincidenciaTrabajador[];
    empresaId?: number;
  };
};

export const listarPersonasTalanaRequest = async (
  empresa: number,
  page: number,
  pageSize: number
) => {
  const response = await api.get("/talana/personas", {
    params: { empresa, page, page_size: pageSize },
  });

  return response.data.data as TalanaRespuestaPaginada<TalanaPersona>;
};

export const listarTrabajadoresConMarcacionesRequest = async (
  desde: string,
  hasta: string,
  empresa: number
) => {
  const response = await api.get("/talana/trabajadores-con-marcaciones", {
    params: { desde, hasta, empresa },
  });

  return response.data.data as ResultadoTrabajadoresConMarcacionesTalana;
};

export const obtenerMuestraContratoRequest = async (
  empresa: number,
  fecha?: string
) => {
  const response = await api.get("/talana/contratos/muestra", {
    params: { empresa, fecha },
  });

  return response.data.data as ResultadoMuestraContratoTalana;
};

export const listarLiquidacionesRequest = async (
  filtros: FiltrosLiquidacionesTalana
) => {
  const response = await api.get("/talana/liquidaciones", {
    params: filtros,
  });

  return response.data.data as TalanaRespuestaListado<TalanaLiquidacion>;
};

export const obtenerLiquidacionRequest = async (id: string) => {
  const response = await api.get(`/talana/liquidaciones/${id}`);
  return response.data.data as TalanaLiquidacion;
};

export const listarComprobantesLiquidacionesRequest = async (
  filtros: FiltrosLiquidacionesTalana
) => {
  const response = await api.get("/talana/liquidaciones/comprobantes", {
    params: filtros,
  });

  return response.data
    .data as TalanaRespuestaListado<TalanaComprobanteLiquidacion>;
};

export const obtenerComprobanteLiquidacionRequest = async (id: string) => {
  const response = await api.get(`/talana/liquidaciones/${id}/comprobante`);
  return response.data.data as TalanaComprobanteLiquidacion;
};
