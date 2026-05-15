export type EstadoMailing =
  | "BORRADOR"
  | "PROGRAMADA"
  | "ENVIADA"
  | "ENVIADA_CON_ERRORES";

export interface MailingCampana {
  id: number;
  asunto: string;
  cuerpo: string;
  grupo: string;
  estado: EstadoMailing;
  fechaProgramada?: string | null;
  enviados: number;
  errores: number;
  createdAt: string;
  updatedAt: string;

  _count?: {
    destinatarios: number;
  };
}

export interface CrearCampanaPayload {
  asunto: string;
  cuerpo: string;
  grupo: string;
  emailsPersonalizados?: string;
  fechaProgramada?: string | null;
}