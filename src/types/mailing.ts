export type EstadoMailing =
  | "BORRADOR"
  | "PROGRAMADA"
  | "ENVIADA"
  | "ENVIADA_CON_ERRORES";

export interface MailingAdjunto {
  id?: number;
  nombre: string;
  url?: string;
  mimeType?: string;
  size?: number;
  createdAt?: string;
}

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

  adjuntos?: MailingAdjunto[];

  _count?: {
    destinatarios: number;
    adjuntos?: number;
  };
}

export interface CrearCampanaPayload {
  asunto: string;
  cuerpo: string;
  grupo: string;
  emailsPersonalizados?: string;
  fechaProgramada?: string | null;
  archivos?: File[];
}