export interface EmpresaHolding {
  id: number;
  holdingId: number;
  empresaId: number;

  Holding: {
    id: number;
    nombre: string;
    logoUrl?: string | null;
    logoPublicId?: string | null;
  };
}

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

  holdings?: EmpresaHolding[];
}

export interface EmpresaForm {
  razonSocial: string;
  alias: string;
  rut: string;
  foto: File | null;
  encargadoNombre: string;
  encargadoCorreo: string;
  encargadoTelefono: string;

  holdingIds: number[];
}

export interface Holding {
  id: number;
  nombre: string;
  logoUrl?: string | null;
  logoPublicId?: string | null;

  _count?: {
    empresas: number;
  };
}