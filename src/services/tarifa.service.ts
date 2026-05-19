import api from "./api";
import type { TarifaForm } from "../types/tarifa";

const toNumber = (value: string) => Number(value || 0);

export const listarTarifasPorEmpresaRequest = async (empresaId: number) => {
  const response = await api.get(`/tarifas/empresa/${empresaId}`);

  return response.data.tarifas;
};

export const crearTarifaEmpresaRequest = async (
  empresaId: number,
  data: TarifaForm
) => {
  const response = await api.post(`/tarifas/empresa/${empresaId}`, {
    sucursalId: data.sucursalId,
    cargoId: data.cargoId,

    sueldoBase: toNumber(data.sueldoBase),
    bonoAsistencia: toNumber(data.bonoAsistencia),
    bonoCaja: toNumber(data.bonoCaja),
    bonoResponsabilidad: toNumber(data.bonoResponsabilidad),
    bonoColacion: toNumber(data.bonoColacion),
    bonoMovilizacion: toNumber(data.bonoMovilizacion),
    bonoNoche: toNumber(data.bonoNoche),
    otrosBonos: toNumber(data.otrosBonos),
    valorHoraExtra: toNumber(data.valorHoraExtra),
  });

  return response.data;
};

export const actualizarTarifaRequest = async (
  id: number,
  data: TarifaForm
) => {
  const response = await api.put(`/tarifas/${id}`, {
    sucursalId: data.sucursalId,
    cargoId: data.cargoId,

    sueldoBase: toNumber(data.sueldoBase),
    bonoAsistencia: toNumber(data.bonoAsistencia),
    bonoCaja: toNumber(data.bonoCaja),
    bonoResponsabilidad: toNumber(data.bonoResponsabilidad),
    bonoColacion: toNumber(data.bonoColacion),
    bonoMovilizacion: toNumber(data.bonoMovilizacion),
    bonoNoche: toNumber(data.bonoNoche),
    otrosBonos: toNumber(data.otrosBonos),
    valorHoraExtra: toNumber(data.valorHoraExtra),
  });

  return response.data;
};

export const eliminarTarifaRequest = async (id: number) => {
  const response = await api.delete(`/tarifas/${id}`);

  return response.data;
};