import type { Empresa } from "./empresa";
import type { Cargo } from "./cargo";
import type { Sucursal } from "./sucursal";

export interface Tarifa {
  id: number;
  empresaId: number;
  sucursalId: number;
  cargoId: number;

  sueldoBase: number;
  bonoAsistencia: number;
  bonoCaja: number;
  bonoResponsabilidad: number;
  bonoColacion: number;
  bonoMovilizacion: number;
  bonoNoche: number;
  otrosBonos: number;
  valorHoraExtra: number;

  Empresa?: Empresa;
  Sucursal?: Sucursal;
  Cargo?: Cargo;
}

export interface TarifaForm {
  sucursalId: number | "";
  cargoId: number | "";

  sueldoBase: string;
  bonoAsistencia: string;
  bonoCaja: string;
  bonoResponsabilidad: string;
  bonoColacion: string;
  bonoMovilizacion: string;
  bonoNoche: string;
  otrosBonos: string;
  valorHoraExtra: string;
}