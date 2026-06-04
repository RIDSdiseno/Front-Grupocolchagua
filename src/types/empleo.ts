export type EstadoEmpleo = "BORRADOR" | "PUBLICADO" | "PAUSADO" | "CERRADO";

export type ModalidadEmpleo = "PRESENCIAL" | "REMOTO" | "HIBRIDO";

export type JornadaEmpleo =
  | "FULL_TIME"
  | "PART_TIME"
  | "TURNOS"
  | "FREELANCE"
  | "PRACTICA";

export interface Empleo {
  id: number;
  titulo: string;
  empresa: string | null;
  cargo: string | null;
  ubicacion: string | null;
  comuna: string | null;
  region: string | null;
  modalidad: ModalidadEmpleo | null;
  jornada: JornadaEmpleo | null;
  sueldo: string | null;
  descripcion: string;
  requisitos: string | null;
  beneficios: string | null;
  vacantes: number;
  estado: EstadoEmpleo;
  fechaCierre: string | null;
  publicadoEn: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CrearEmpleoPayload {
  titulo: string;
  empresa?: string | null;
  cargo?: string | null;
  ubicacion?: string | null;
  comuna?: string | null;
  region?: string | null;
  modalidad?: ModalidadEmpleo | null;
  jornada?: JornadaEmpleo | null;
  sueldo?: string | null;
  descripcion: string;
  requisitos?: string | null;
  beneficios?: string | null;
  vacantes?: number;
  estado?: EstadoEmpleo;
  fechaCierre?: string | null;
}

export type ActualizarEmpleoPayload = Partial<CrearEmpleoPayload>;