import type { Empresa } from "./empresa";
import type { Cargo } from "./cargo";

export interface Tarifa {
  id: number;
  empresaId: number;
  cargoId: number;
  pagoPorHora: number;

  Empresa?: Empresa;
  Cargo?: Cargo;
}

export interface TarifaForm {
  cargoId: number | "";
  pagoPorHora: string;
}