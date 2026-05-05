import type { Trabajador, TrabajadorForm } from "../../types/trabajador";

interface Props {
  open: boolean;
  loading: boolean;
  editando: Trabajador | null;
  form: TrabajadorForm;
  onClose: () => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

const formatearRutInput = (value: string) => {
  const limpio = value.replace(/[^0-9kK]/g, "").toUpperCase();
  if (limpio.length <= 1) return limpio;
  const cuerpo = limpio.slice(0, -1);
  const dv = limpio.slice(-1);
  return cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "-" + dv;
};

export default function TrabajadorModal({
  open,
  loading,
  editando,
  form,
  onClose,
  onChange,
  onSubmit,
}: Props) {
  if (!open) return null;

  const handleRutChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      target: { name: "rut", value: formatearRutInput(e.target.value) },
    } as React.ChangeEvent<HTMLInputElement>);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-6 py-4">
          <h3 className="text-lg font-bold text-[#4E1743]">
            {editando ? "Editar trabajador" : "Nuevo trabajador"}
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
              Datos personales
            </h4>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Nombre <span className="text-red-500">*</span>
                </label>
                <input
                  name="nombre"
                  value={form.nombre}
                  onChange={onChange}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#4E1743] focus:ring-2 focus:ring-[#4E1743]/20"
                  placeholder="Ej: Juan"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Apellido <span className="text-red-500">*</span>
                </label>
                <input
                  name="apellido"
                  value={form.apellido}
                  onChange={onChange}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#4E1743] focus:ring-2 focus:ring-[#4E1743]/20"
                  placeholder="Ej: Pérez"
                  required
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                RUT <span className="text-red-500">*</span>
              </label>
              <input
                name="rut"
                value={form.rut}
                onChange={handleRutChange}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#4E1743] focus:ring-2 focus:ring-[#4E1743]/20"
                placeholder="Ej: 12.345.678-9"
                maxLength={12}
                required
              />
            </div>
          </div>

          <div className="mb-5">
            <h4 className="mb-3 text-sm font-bold uppercase tracking-wide text-[#4E1743]">
              Contacto
            </h4>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Teléfono
                </label>
                <input
                  name="telefono"
                  value={form.telefono}
                  onChange={onChange}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#4E1743] focus:ring-2 focus:ring-[#4E1743]/20"
                  placeholder="Ej: +56 9 1234 5678"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Correo electrónico
                </label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={onChange}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#4E1743] focus:ring-2 focus:ring-[#4E1743]/20"
                  placeholder="Ej: juan@correo.cl"
                />
              </div>
            </div>
          </div>

          {editando && (
            <div className="mb-5">
              <h4 className="mb-3 text-sm font-bold uppercase tracking-wide text-[#4E1743]">
                Estado
              </h4>
              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  name="activo"
                  checked={form.activo}
                  onChange={(e) =>
                    onChange({
                      target: { name: "activo", value: e.target.checked as any },
                    } as React.ChangeEvent<HTMLInputElement>)
                  }
                  className="h-5 w-5 accent-[#4E1743]"
                />
                <span className="text-sm font-semibold text-slate-700">
                  Trabajador activo
                </span>
              </label>
            </div>
          )}

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
