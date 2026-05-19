export interface TrabajadorBasico {
  id: number;
  nombre: string;
  apellido: string;
  rut: string;
}

export interface EmpresaBasica {
  id: number;
  nombre: string;
}

export interface SucursalBasica {
  id: number;
  nombre: string;
}

export interface CargoBasico {
  id: number;
  nombre: string;
}

export interface PreLiquidacion {
  id: number;
  trabajadorId: number;
  empresaId: number;
  sucursalId?: number | null;
  cargoId: number;

  mes: number;
  anio: number;

  sueldoBase: number;
  diasTrabajados: number;
  diasLibres: number;
  diasFalta: number;

  cantidadHorasExtras: number;
  cantidadHorasExtrasPendientes: number;

  montoDiasTrabajados: number;
  montoHorasExtras: number;
  montoHorasExtrasPendientes: number;

  difRem: number;
  difRem2: number;
  difLiq: number;

  asignacionPerdidaCaja: number;
  colacion: number;
  movilizacion: number;
  viatico: number;

  bonoImponible1: number;
  bonoImponible2: number;
  bonoImponible3: number;
  colacionExtraNoImponible: number;
  bonoTurnoNocturno: number;

  totalHaberes: number;
  totalDescuentos: number;
  anticipo: number;
  montoInformar: number;

  estado: "BORRADOR" | "APROBADA" | string;
  observacion?: string | null;

  createdAt: string;
  updatedAt: string;

  Trabajador?: TrabajadorBasico;
  Empresa?: EmpresaBasica;
  Sucursal?: SucursalBasica | null;
  Cargo?: CargoBasico;
}

export interface GenerarPreLiquidacionesPayload {
  empresaId: number;
  sucursalId?: number;
  mes: number;
  anio: number;
}

export interface ActualizarPreLiquidacionPayload {
  difRem?: number;
  difRem2?: number;
  difLiq?: number;
  asignacionPerdidaCaja?: number;
  colacion?: number;
  movilizacion?: number;
  viatico?: number;
  bonoImponible1?: number;
  bonoImponible2?: number;
  bonoImponible3?: number;
  colacionExtraNoImponible?: number;
  bonoTurnoNocturno?: number;
  cantidadHorasExtrasPendientes?: number;
  montoHorasExtrasPendientes?: number;
  anticipo?: number;
  observacion?: string | null;
}