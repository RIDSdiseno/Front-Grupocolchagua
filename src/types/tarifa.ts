import type { Empresa } from "./empresa";
import type { Cargo } from "./cargo";
import type { Sucursal } from "./sucursal";

export interface Tarifa {
  id: number;
  empresaId: number;
  sucursalId: number;
  cargoId: number;

  sueldoBase: number;
  bonoColacion: number;
  bonoLocomocion: number;
  bonoAsistencia: number;
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
  bonoColacion: string;
  bonoLocomocion: string;
  bonoAsistencia: string;
  bonoNoche: string;
  otrosBonos: string;
  valorHoraExtra: string;
}