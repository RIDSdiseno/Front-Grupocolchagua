export interface Asignacion {
  id: number;
  trabajadorId: number;
  empresaId: number;
  sucursalId?: number | null;
  cargoId: number;
  fechaInicio: string;
  fechaFin?: string | null;
  Trabajador: { id: number; nombre: string; apellido: string; rut: string };
  Empresa: { id: number; nombre: string };
  Sucursal?: { id: number; nombre: string } | null;
  Cargo: { id: number; nombre: string };
}

export interface AsignacionForm {
  trabajadorId: number | "";
  empresaId: number | "";
  sucursalId: number | "";
  cargoId: number | "";
  fechaInicio: string;
  fechaFin: string;
}
