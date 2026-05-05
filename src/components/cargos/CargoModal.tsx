import type { Cargo, CargoForm } from "../../types/cargo";

interface Props {
  open: boolean;
  loading: boolean;
  editando: Cargo | null;
  form: CargoForm;
  onClose: () => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

export default function CargoModal({
  open,
  loading,
  editando,
  form,
  onClose,
  onChange,
  onSubmit,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h3 className="text-lg font-bold text-[#4E1743]">
            {editando ? "Editar cargo" : "Nuevo cargo"}
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
          <div className="mb-6">
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Nombre del cargo
            </label>

            <input
              name="nombre"
              value={form.nombre}
              onChange={onChange}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#4E1743] focus:ring-2 focus:ring-[#4E1743]/20"
              placeholder="Ej: Operario, Supervisor, Reponedor"
              required
            />
          </div>

          <div className="flex gap-3">
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