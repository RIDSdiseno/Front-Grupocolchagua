export type TipoIncidencia =
  | "ATRASO"
  | "SALIDA_ANTICIPADA"
  | "PERMISO_SIN_GOCE"
  | "ANTICIPO"
  | "DESCUENTO_MANUAL"
  | "BONO_MANUAL";

export type TipoIncidenciaModal = TipoIncidencia | "NINGUNA";

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

export interface IncidenciaAsistencia {
  id: number;
  trabajadorId: number;
  empresaId: number;
  sucursalId?: number | null;
  cargoId?: number | null;
  fecha: string;
  tipo: TipoIncidencia;
  minutos: number;
  monto: number;
  observacion?: string | null;
  createdAt: string;
  updatedAt: string;
  Trabajador?: TrabajadorBasico;
  Empresa?: EmpresaBasica;
  Sucursal?: SucursalBasica | null;
  Cargo?: CargoBasico | null;
}

export interface CrearIncidenciaPayload {
  trabajadorId: number;
  empresaId: number;
  sucursalId?: number | null;
  cargoId?: number | null;
  fecha: string;
  tipo: TipoIncidencia;
  minutos?: number;
  monto?: number;
  observacion?: string;
}

export interface ActualizarIncidenciaPayload {
  trabajadorId?: number;
  empresaId?: number;
  sucursalId?: number | null;
  cargoId?: number | null;
  fecha?: string;
  tipo?: TipoIncidencia;
  minutos?: number;
  monto?: number;
  observacion?: string | null;
}

export interface ResumenIncidenciaTrabajador {
  trabajador: TrabajadorBasico;
  empresa: EmpresaBasica;
  sucursal?: SucursalBasica | null;
  cargo?: CargoBasico | null;
  totalAtrasos: number;
  totalSalidasAnticipadas: number;
  totalPermisosSinGoce: number;
  totalAnticipos: number;
  totalDescuentosManuales: number;
  totalBonosManuales: number;
  totalMinutosAtraso: number;
  totalMinutosSalidaAnticipada: number;
  totalDescuentos: number;
  totalBonos: number;
  incidencias: IncidenciaAsistencia[];
}