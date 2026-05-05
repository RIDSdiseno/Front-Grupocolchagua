import PhoneInputModule from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import type { Empresa, EmpresaForm } from "../../types/empresa";

const PhoneInput = (PhoneInputModule as any).default || PhoneInputModule;

interface Props {
  open: boolean;
  loading: boolean;
  editando: Empresa | null;
  form: EmpresaForm;
  onClose: () => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
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
  onClose,
  onChange,
  onSubmit,
}: Props) {
  if (!open) return null;

  const handleRutChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valorFormateado = formatearRutInput(e.target.value);

    onChange({
      target: {
        name: "rut",
        value: valorFormateado,
      },
    } as React.ChangeEvent<HTMLInputElement>);
  };

  const handleTelefonoChange = (value: string) => {
    onChange({
      target: {
        name: "encargadoTelefono",
        value: value ? `+${value}` : "",
      },
    } as React.ChangeEvent<HTMLInputElement>);
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
              <div className="mb-4">
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

              <div className="mb-4">
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
              <div className="mb-4">
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

              <div className="mb-4">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Teléfono encargado
                </label>

                <PhoneInput
                  country="cl"
                  value={form.encargadoTelefono?.replace("+", "") || ""}
                  onChange={handleTelefonoChange}
                  inputProps={{
                    name: "encargadoTelefono",
                    required: false,
                  }}
                  enableSearch
                  searchPlaceholder="Buscar país"
                  placeholder="+56 9 1234 5678"
                  containerClass="!w-full"
                  inputClass="!h-[50px] !w-full !rounded-xl !border !border-slate-300 !pl-14 !text-sm !outline-none focus:!border-[#4E1743] focus:!ring-2 focus:!ring-[#4E1743]/20"
                  buttonClass="!rounded-l-xl !border-slate-300 !bg-white hover:!bg-slate-50"
                  dropdownClass="!text-sm"
                />
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h4 className="mb-3 text-sm font-bold uppercase tracking-wide text-[#4E1743]">
              Logo
            </h4>

            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Logo / Foto
            </label>
            <input
              name="foto"
              type="file"
              accept="image/*"
              onChange={onChange}
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