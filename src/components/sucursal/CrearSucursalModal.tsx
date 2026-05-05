import type { SucursalForm } from "../../types/sucursal";

interface Props {
  open: boolean;
  loading: boolean;
  empresaNombre?: string;
  form: SucursalForm;
  onClose: () => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

export default function CrearSucursalModal({
  open,
  loading,
  empresaNombre,
  form,
  onClose,
  onChange,
  onSubmit,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-lg rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <h3 className="text-lg font-black text-[#4E1743]">
              Crear sucursal
            </h3>
            <p className="text-sm text-slate-500">
              Empresa: {empresaNombre || "-"}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-3 py-1 text-xl font-bold text-slate-500 hover:bg-slate-100"
          >
            ×
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6">
          <div className="mb-4">
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Nombre sucursal
            </label>
            <input
              name="nombre"
              value={form.nombre}
              onChange={onChange}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 font-semibold outline-none focus:border-[#4E1743] focus:ring-4 focus:ring-[#4E1743]/10"
              placeholder="Ej: Maipú, Las Condes, Centro"
              required
            />
          </div>

          <div className="mb-4">
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Dirección
            </label>
            <input
              name="direccion"
              value={form.direccion}
              onChange={onChange}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 font-semibold outline-none focus:border-[#4E1743] focus:ring-4 focus:ring-[#4E1743]/10"
              placeholder="Ej: Av. Principal 123"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="mb-4">
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Comuna
              </label>
              <input
                name="comuna"
                value={form.comuna}
                onChange={onChange}
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 font-semibold outline-none focus:border-[#4E1743] focus:ring-4 focus:ring-[#4E1743]/10"
                placeholder="Ej: Maipú"
              />
            </div>

            <div className="mb-4">
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Ciudad
              </label>
              <input
                name="ciudad"
                value={form.ciudad}
                onChange={onChange}
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 font-semibold outline-none focus:border-[#4E1743] focus:ring-4 focus:ring-[#4E1743]/10"
                placeholder="Ej: Santiago"
              />
            </div>
          </div>

          <div className="mt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-2xl border border-slate-300 px-4 py-3 font-bold text-slate-700 hover:bg-slate-50"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-2xl bg-[#4E1743] px-4 py-3 font-black text-white hover:bg-[#3d1235] disabled:opacity-60"
            >
              {loading ? "Guardando..." : "Crear"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}