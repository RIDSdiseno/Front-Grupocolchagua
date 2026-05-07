import PhoneInputModule from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import type { Empresa, EmpresaForm } from "../../types/empresa";
import type { Holding } from "../../services/Holding.service";

type PhoneInputModuleType = typeof PhoneInputModule & {
  default?: typeof PhoneInputModule;
};

const PhoneInput =
  (PhoneInputModule as PhoneInputModuleType).default || PhoneInputModule;

interface Props {
  open: boolean;
  loading: boolean;
  editando: Empresa | null;
  form: EmpresaForm;
  holdings: Holding[];
  onClose: () => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

const formatearRutInput = (value: string) => {
  const limpio = value.replace(/[^0-9kK]/g, "").toUpperCase();
  if (limpio.length <= 1) return limpio;
  const cuerpo = limpio.slice(0, -1);
  const dv = limpio.slice(-1);
  const cuerpoFormateado = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${cuerpoFormateado}-${dv}`;
};

export default function EmpresaModal({
  open,
  loading,
  editando,
  form,
  holdings,
  onClose,
  onChange,
  onSubmit,
}: Props) {
  if (!open) return null;

  const handleRutChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valorFormateado = formatearRutInput(e.target.value);

    const syntheticEvent: React.ChangeEvent<HTMLInputElement> = {
      ...e,
      target: { ...e.target, name: "rut", value: valorFormateado },
    };

    onChange(syntheticEvent);
  };

  const handleTelefonoChange = (value: string) => {
    const syntheticEvent = {
      target: {
        name: "encargadoTelefono",
        value: value ? `+${value}` : "",
      },
    } as unknown as React.ChangeEvent<HTMLInputElement>;

    onChange(syntheticEvent);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-6 py-4">
          <h3 className="text-lg font-bold text-[#4E1743]">
            {editando ? "Editar empresa" : "Nueva empresa"}
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
              Grupo empresarial
            </h4>

            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Holdings
            </label>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {holdings.map((holding) => {
                const checked = form.holdingIds?.includes(holding.id) ?? false;

                return (
                  <label
                    key={holding.id}
                    className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 font-semibold transition ${
                      checked
                        ? "border-[#4E1743] bg-[#4E1743]/10 text-[#4E1743]"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      name="holdingIds"
                      value={holding.id}
                      checked={checked}
                      onChange={onChange}
                      className="h-4 w-4 accent-[#4E1743]"
                    />
                    {holding.nombre}
                  </label>
                );
              })}
            </div>

            {holdings.length === 0 && (
              <p className="mt-2 text-sm text-slate-500">
                No hay holdings registrados.
              </p>
            )}
          </div>

          <div className="mb-5">
            <h4 className="mb-3 text-sm font-bold uppercase tracking-wide text-[#4E1743]">
              Datos de la empresa
            </h4>

            <div className="mb-4">
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Razón social
              </label>
              <input
                name="razonSocial"
                value={form.razonSocial}
                onChange={onChange}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#4E1743] focus:ring-2 focus:ring-[#4E1743]/20"
                placeholder="Ej: IKEA Chile SpA"
                required
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Alias
                </label>
                <input
                  name="alias"
                  value={form.alias}
                  onChange={onChange}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#4E1743] focus:ring-2 focus:ring-[#4E1743]/20"
                  placeholder="Ej: IKEA"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  RUT
                </label>
                <input
                  name="rut"
                  value={form.rut}
                  onChange={handleRutChange}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#4E1743] focus:ring-2 focus:ring-[#4E1743]/20"
                  placeholder="Ej: 76.123.456-7"
                  maxLength={12}
                  required
                />
              </div>
            </div>
          </div>

          <div className="mb-5">
            <h4 className="mb-3 text-sm font-bold uppercase tracking-wide text-[#4E1743]">
              Contacto encargado
            </h4>

            <div className="mb-4">
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Nombre encargado
              </label>
              <input
                name="encargadoNombre"
                value={form.encargadoNombre}
                onChange={onChange}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#4E1743] focus:ring-2 focus:ring-[#4E1743]/20"
                placeholder="Ej: Juan Pérez"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Correo encargado
                </label>
                <input
                  name="encargadoCorreo"
                  type="email"
                  value={form.encargadoCorreo}
                  onChange={onChange}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#4E1743] focus:ring-2 focus:ring-[#4E1743]/20"
                  placeholder="Ej: encargado@empresa.cl"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Teléfono encargado
                </label>
                <PhoneInput
                  country="cl"
                  value={form.encargadoTelefono?.replace("+", "") || ""}
                  onChange={handleTelefonoChange}
                  inputProps={{ name: "encargadoTelefono" }}
                  enableSearch
                  placeholder="+56 9 1234 5678"
                  containerClass="!w-full"
                  inputClass="!h-[50px] !w-full !rounded-xl !border !border-slate-300 !pl-14 !text-sm !outline-none focus:!border-[#4E1743] focus:!ring-2 focus:!ring-[#4E1743]/20"
                />
              </div>
            </div>
          </div>

          <div className="mb-6">
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Logo
            </label>
            <input
              name="foto"
              type="file"
              accept="image/*"
              onChange={onChange as React.ChangeEventHandler<HTMLInputElement>}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm"
            />

            {editando?.logoUrl && (
              <img
                src={editando.logoUrl}
                alt={editando.nombre}
                className="mt-4 h-20 w-20 rounded-xl border object-contain"
              />
            )}
          </div>

          <div className="flex gap-3 border-t pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border px-4 py-3 font-semibold"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-xl bg-[#4E1743] px-4 py-3 font-bold text-white"
            >
              {loading ? "Guardando..." : editando ? "Actualizar" : "Crear"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}