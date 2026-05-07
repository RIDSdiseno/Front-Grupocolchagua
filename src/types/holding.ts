export interface Holding {
  id: number;
  nombre: string;
  logoUrl?: string | null;
  logoPublicId?: string | null;
  _count?: {
    Empresa: number;
  };
}