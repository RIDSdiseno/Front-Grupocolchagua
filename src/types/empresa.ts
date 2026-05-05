export interface Empresa {
  id: number;
  nombre: string;
  razonSocial?: string | null;
  rut?: string | null;
  logoUrl?: string | null;
  logoPublicId?: string | null;
  encargadoNombre?: string | null;
  encargadoCorreo?: string | null;
  encargadoTelefono?: string | null;
}

export interface EmpresaForm {
  razonSocial: string;
  alias: string;
  rut: string;
  foto: File | null;
  encargadoNombre: string;
  encargadoCorreo: string;
  encargadoTelefono: string;
}