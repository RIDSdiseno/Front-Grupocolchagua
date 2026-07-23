export const EMPRESAS_TALANA = {
  GRUPO_COLCHAGUA: 1408,
  GRUPO_SANTA_CRUZ: 1570,
} as const;

export type EmpresaTalanaId =
  | typeof EMPRESAS_TALANA.GRUPO_COLCHAGUA
  | typeof EMPRESAS_TALANA.GRUPO_SANTA_CRUZ;

export interface TalanaPersona {
  id: number;
  rut?: string;
  nombre?: string;
  apellidoPaterno?: string;
  apellidoMaterno?: string;
  email?: string;
  sexo?: string;
  fechaNacimiento?: string;
  nacionalidad?: string;
  [key: string]: unknown;
}

export interface TalanaCoincidenciaTrabajador {
  empresaId: number;
  persona: TalanaPersona;
}

export interface TrabajadorConMarcacionesTalana {
  talanaPersonaId: number;
  rut: string;
  nombre?: string;
  apellidoPaterno?: string;
  apellidoMaterno?: string;
  nombreCompleto: string;
  cantidadMarcaciones: number;
  primeraMarcacion: string;
  ultimaMarcacion: string;
  oficinas: number[];
  metodosMarcacion: string[];
}

export interface ResultadoTrabajadoresConMarcacionesTalana {
  empresaId: number;
  desde: string;
  hasta: string;
  totalMarcaciones: number;
  marcacionesProcesadas: number;
  paginasProcesadas: number;
  trabajadoresUnicos: number;
  trabajadores: TrabajadorConMarcacionesTalana[];
}

export const TIPOS_LIQUIDACION_TALANA = [
  "sueldo",
  "anticipo",
  "finiquito",
  "histórica",
  "reliquidacion",
  "sueldo reprocesada",
] as const;

export type TipoLiquidacionTalana = (typeof TIPOS_LIQUIDACION_TALANA)[number];

export interface FiltrosLiquidacionesTalana {
  empleado?: number;
  tipoLiquidacion?: TipoLiquidacionTalana;
  periodo?: string;
  codigoDeProceso?: string;
  periodoMes?: number;
  periodoAno?: number;
  cursor?: string;
  pageSize?: number;
  rut?: string;
}

export interface TalanaLiquidacion {
  id?: number | string;
  empleado?: number | string;
  contrato?: number | string;
  rut?: string;
  tipoLiquidacion?: string;
  periodo?: unknown;
  totalHaberes?: number;
  totalDescuentos?: number;
  liquido?: number;
  [key: string]: unknown;
}

export interface TalanaComprobanteLiquidacion {
  id: number | string;
  rut?: string;
  contrato?: number | string;
  uuid?: string;
  periodo_desde?: string;
  periodo_hasta?: string;
  url?: string;
  [key: string]: unknown;
}

export interface TalanaRespuestaPaginada<T> {
  count?: number;
  next?: string | null;
  previous?: string | null;
  results?: T[];
  [key: string]: unknown;
}

export type TalanaRespuestaListado<T> = TalanaRespuestaPaginada<T> | T[];

export interface TalanaContrato {
  id?: number | string;
  rut?: string;
  [key: string]: unknown;
}

export interface ResultadoMuestraContratoTalana {
  empresaId: number;
  fechaConsulta?: string;
  totalContratos: number;
  contratoEncontrado: boolean;
  contrato: TalanaContrato | null;
}
