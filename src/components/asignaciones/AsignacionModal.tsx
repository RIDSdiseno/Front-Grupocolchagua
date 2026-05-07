import { useEffect, useState } from "react";
import type { Asignacion, AsignacionForm } from "../../types/asignacion";
import type { Trabajador } from "../../types/trabajador";
import type { Cargo } from "../../types/cargo";
import {
  listarHoldingsRequest,
  obtenerHoldingRequest,
  type Holding,
} from "../../services/Holding.service";

interface SucursalOption {
  id: number;
  nombre: string;
  comuna?: string | null;
  ciudad?: string | null;
}

interface EmpresaOption {
  id: number;
  nombre: string;
  rut?: string | null;
  Sucursal: SucursalOption[];
}

interface Props {
  open: boolean;
  loading: boolean;
  editando: Asignacion | null;
  form: AsignacionForm;
  trabajadores: Trabajador[];
  cargos: Cargo[];
  onClose: () => void;
  onChange: (name: keyof AsignacionForm, value: number | string | "") => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

export default function AsignacionModal({
  open,
  loading,
  editando,
  form,
  trabajadores,
  cargos,
  onClose,
  onChange,
  onSubmit,
}: Props) {
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [empresasHolding, setEmpresasHolding] = useState<EmpresaOption[]>([]);
  const [sucursales, setSucursales] = useState<SucursalOption[]>([]);
  const [holdingId, setHoldingId] = useState<number | "">("");
  const [cargandoEmpresas, setCargandoEmpresas] = useState(false);

  useEffect(() => {
    if (!open) return;

    let activo = true;

    void listarHoldingsRequest()
      .then((data) => {
        if (activo) setHoldings(data);
      })
      .catch(() => {
        if (activo) setHoldings([]);
      });

    return () => {
      activo = false;
    };
  }, [open]);

  useEffect(() => {
    if (!open || !editando || holdings.length === 0 || !form.empresaId) return;

    let activo = true;

    const buscarHoldingInicial = async () => {
      for (const holding of holdings) {
        try {
          const detalle = await obtenerHoldingRequest(holding.id);

          if (!activo) return;

          const existeEmpresa = detalle.empresas.some(
            (item) => item.Empresa.id === Number(form.empresaId)
          );

          if (existeEmpresa) {
            const empresasDelHolding = detalle.empresas.map((item) => ({
              id: item.Empresa.id,
              nombre: item.Empresa.nombre,
              rut: item.Empresa.rut,
              Sucursal: item.Empresa.Sucursal || [],
            }));

            const empresaSeleccionada = empresasDelHolding.find(
              (empresa) => empresa.id === Number(form.empresaId)
            );

            setHoldingId(holding.id);
            setEmpresasHolding(empresasDelHolding);
            setSucursales(empresaSeleccionada?.Sucursal || []);
            break;
          }
        } catch {
          // continúa buscando
        }
      }
    };

    void buscarHoldingInicial();

    return () => {
      activo = false;
    };
  }, [open, editando, holdings, form.empresaId]);

  const handleHoldingChange = async (value: string) => {
    const nuevoHoldingId = value ? Number(value) : "";

    setHoldingId(nuevoHoldingId);
    setEmpresasHolding([]);
    setSucursales([]);

    onChange("empresaId", "");
    onChange("sucursalId", "");

    if (!nuevoHoldingId) return;

    setCargandoEmpresas(true);

    try {
      const holding = await obtenerHoldingRequest(Number(nuevoHoldingId));

      const empresasDelHolding = holding.empresas.map((item) => ({
        id: item.Empresa.id,
        nombre: item.Empresa.nombre,
        rut: item.Empresa.rut,
        Sucursal: item.Empresa.Sucursal || [],
      }));

      setEmpresasHolding(empresasDelHolding);
    } catch {
      setEmpresasHolding([]);
    } finally {
      setCargandoEmpresas(false);
    }
  };

  const handleEmpresaChange = (value: string) => {
    const nuevaEmpresaId = value ? Number(value) : "";

    onChange("empresaId", nuevaEmpresaId);
    onChange("sucursalId", "");

    const empresaSeleccionada = empresasHolding.find(
      (empresa) => empresa.id === Number(value)
    );

    setSucursales(empresaSeleccionada?.Sucursal || []);
  };

  const handleSucursalChange = (value: string) => {
    onChange("sucursalId", value ? Number(value) : "");
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-6 py-4">
          <h3 className="text-lg font-bold text-[#4E1743]">
            {editando ? "Editar asignación" : "Nueva asignación"}
          </h3>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-3 py-1 text-xl font-bold text-slate-500 hover:bg-slate-100"
          >
            ×
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6">
          <div className="mb-5">
            <h4 className="mb-3 text-sm font-bold uppercase tracking-wide text-[#4E1743]">
              Trabajador
            </h4>

            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Trabajador <span className="text-red-500">*</span>
            </label>

            <select
              value={form.trabajadorId}
              onChange={(e) =>
                onChange(
                  "trabajadorId",
                  e.target.value ? Number(e.target.value) : ""
                )
              }
              required
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-[#4E1743] focus:ring-2 focus:ring-[#4E1743]/20"
            >
              <option value="">Selecciona un trabajador</option>

              {trabajadores
                .filter((t) => t.activo)
                .map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.apellido}, {t.nombre} — {t.rut}
                  </option>
                ))}
            </select>
          </div>

          <div className="mb-5">
            <h4 className="mb-3 text-sm font-bold uppercase tracking-wide text-[#4E1743]">
              Destino
            </h4>

            <div className="mb-4">
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Holding <span className="text-red-500">*</span>
              </label>

              <select
                value={holdingId}
                onChange={(e) => handleHoldingChange(e.target.value)}
                required
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-[#4E1743] focus:ring-2 focus:ring-[#4E1743]/20"
              >
                <option value="">Selecciona un holding</option>

                {holdings.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Empresa <span className="text-red-500">*</span>
              </label>

              <select
                value={form.empresaId}
                onChange={(e) => handleEmpresaChange(e.target.value)}
                required
                disabled={!holdingId || cargandoEmpresas}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-[#4E1743] focus:ring-2 focus:ring-[#4E1743]/20 disabled:bg-slate-50 disabled:text-slate-400"
              >
                <option value="">
                  {cargandoEmpresas
                    ? "Cargando empresas..."
                    : !holdingId
                    ? "Primero selecciona un holding"
                    : "Selecciona una empresa"}
                </option>

                {empresasHolding.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Sucursal <span className="text-red-500">*</span>
              </label>

              <select
                value={form.sucursalId}
                onChange={(e) => handleSucursalChange(e.target.value)}
                required
                disabled={!form.empresaId}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-[#4E1743] focus:ring-2 focus:ring-[#4E1743]/20 disabled:bg-slate-50 disabled:text-slate-400"
              >
                <option value="">
                  {!form.empresaId
                    ? "Primero selecciona una empresa"
                    : sucursales.length === 0
                    ? "Sin sucursales registradas"
                    : "Selecciona una sucursal"}
                </option>

                {sucursales.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nombre}
                    {s.comuna ? ` - ${s.comuna}` : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mb-5">
            <h4 className="mb-3 text-sm font-bold uppercase tracking-wide text-[#4E1743]">
              Cargo
            </h4>

            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Cargo <span className="text-red-500">*</span>
            </label>

            <select
              value={form.cargoId}
              onChange={(e) =>
                onChange("cargoId", e.target.value ? Number(e.target.value) : "")
              }
              required
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-[#4E1743] focus:ring-2 focus:ring-[#4E1743]/20"
            >
              <option value="">Selecciona un cargo</option>

              {cargos.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-5">
            <h4 className="mb-3 text-sm font-bold uppercase tracking-wide text-[#4E1743]">
              Período
            </h4>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Fecha de inicio <span className="text-red-500">*</span>
                </label>

                <input
                  type="date"
                  value={form.fechaInicio}
                  onChange={(e) => onChange("fechaInicio", e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#4E1743] focus:ring-2 focus:ring-[#4E1743]/20"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Fecha de término{" "}
                  <span className="font-normal text-slate-400">(opcional)</span>
                </label>

                <input
                  type="date"
                  value={form.fechaFin}
                  onChange={(e) => onChange("fechaFin", e.target.value)}
                  min={form.fechaInicio || undefined}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#4E1743] focus:ring-2 focus:ring-[#4E1743]/20"
                />

                <p className="mt-1 text-xs text-slate-400">
                  Dejar vacío para contrato indefinido
                </p>
              </div>
            </div>
          </div>

          <div className="sticky bottom-0 -mx-6 -mb-6 flex gap-3 border-t bg-white p-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-slate-300 px-4 py-3 font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-xl bg-[#4E1743] px-4 py-3 font-bold text-white hover:bg-[#3d1235] disabled:opacity-60"
            >
              {loading ? "Guardando..." : editando ? "Actualizar" : "Crear"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}