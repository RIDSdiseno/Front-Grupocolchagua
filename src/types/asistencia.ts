export type EstadoAsistencia = "A" | "L" | "F";
export type TurnoAsistencia = "diurno" | "nocturno";

export interface Asistencia {
  id: number;
  trabajadorId: number;
  fecha: string;
  estado: EstadoAsistencia;
  horasExtras: number;
  turno: TurnoAsistencia;
  cargoId: number;
  empresaId: number;
  sucursalId?: number | null;
  observacion?: string | null;
  Trabajador: { id: number; nombre: string; apellido: string; rut: string };
  Cargo: { id: number; nombre: string };
  Empresa: { id: number; nombre: string };
  Sucursal?: { id: number; nombre: string } | null;
}

export interface AsistenciaForm {
  estado: EstadoAsistencia;
  horasExtras: number;
  turno: TurnoAsistencia;
  observacion: string;
}
