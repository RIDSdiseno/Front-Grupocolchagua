export type EstadoPostulacion =
  | "PENDIENTE"
  | "POR_CONTACTAR"
  | "CONTACTADO"
  | "DESCARTADO";

export interface Postulacion {
  id: number;
  nombre: string;
  apellido: string;
  rut: string | null;
  email: string;
  telefono: string;
  cargoPostula: string;
  comuna: string | null;
  region: string | null;
  experiencia: string | null;
  disponibilidad: string | null;
  mensaje: string | null;
  cvUrl: string;
  cvPublicId: string;
  estado: EstadoPostulacion;
  createdAt: string;
  updatedAt: string;
}