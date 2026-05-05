import Select, { type SingleValue, type StylesConfig } from "react-select";
import type { TarifaForm } from "../../types/tarifa";

interface Option {
  value: number;
  label: string;
}

interface Props {
  open: boolean;
  loading: boolean;
  editando: boolean;
  empresaNombre?: string;
  form: TarifaForm;
  opcionesSucursales?: Option[];
  opcionesCargos?: Option[];
  onClose: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onChange: (field: keyof TarifaForm, value: string | number | "") => void;
  onCrearSucursal: () => void;
  onCrearCargo: () => void;
}

const formatearMiles = (value: string | number | undefined | null) => {
  const soloNumeros = String(value ?? "").replace(/\D/g, "");
  if (!soloNumeros) return "";
  return new Intl.NumberFormat("es-CL").format(Number(soloNumeros));
};

const limpiarNumero = (value: string) => value.replace(/\D/g, "");

const selectStyles: StylesConfig<Option, false> = {
  control: (base, state) => ({
    ...base,
    minHeight: "50px",
    borderRadius: "16px",
    borderColor: state.isFocused ? "#4E1743" : "#cbd5e1",
    boxShadow: state.isFocused
      ? "0 0 0 4px rgba(78, 23, 67, 0.10)"
      : "none",
    "&:hover": {
      borderColor: "#4E1743",
    },
  }),
};

export default function AsociarCargoModal({
  open,
  loading,
  editando,
  empresaNombre,
  form,
  opcionesSucursales = [],
  opcionesCargos = [],
  onClose,
  onSubmit,
  onChange,
  onCrearSucursal,
  onCrearCargo,
}: Props) {
  if (!open) return null;

  const sucursalSeleccionada =
    opcionesSucursales.find((opcion) => opcion.value === form.sucursalId) ||
    null;

  const cargoSeleccionado =
    opcionesCargos.find((opcion) => opcion.value === form.cargoId) || null;

  const totalMensual =
    Number(form.sueldoBase || 0) +
    Number(form.bonoColacion || 0) +
    Number(form.bonoLocomocion || 0) +
    Number(form.bonoAsistencia || 0) +
    Number(form.bonoNoche || 0) +
    Number(form.otrosBonos || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-6 py-4">
          <div>
            <h3 className="text-lg font-black text-[#4E1743]">
              {editando ? "Editar tarifa" : "Crear tarifa por sucursal"}
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
          <div className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-sm font-semibold text-slate-700">
                  Sucursal
                </label>

                <button
                  type="button"
                  onClick={onCrearSucursal}
                  className="text-sm font-bold text-[#4E1743] hover:underline"
                >
                  Crear sucursal
                </button>
              </div>

              <Select<Option, false>
                value={sucursalSeleccionada}
                onChange={(opcion: SingleValue<Option>) =>
                  onChange("sucursalId", opcion?.value ?? "")
                }
                options={opcionesSucursales}
                placeholder="Seleccionar sucursal..."
                isSearchable
                isClearable
                noOptionsMessage={() => "No hay sucursales"}
                styles={selectStyles}
              />
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-sm font-semibold text-slate-700">
                  Cargo
                </label>

                <button
                  type="button"
                  onClick={onCrearCargo}
                  className="text-sm font-bold text-[#4E1743] hover:underline"
                >
                  Crear cargo
                </button>
              </div>

              <Select<Option, false>
                value={cargoSeleccionado}
                onChange={(opcion: SingleValue<Option>) =>
                  onChange("cargoId", opcion?.value ?? "")
                }
                options={opcionesCargos}
                placeholder="Seleccionar cargo..."
                isSearchable
                isClearable
                noOptionsMessage={() => "No hay cargos"}
                styles={selectStyles}
              />
            </div>
          </div>

          <div className="mb-5 rounded-2xl bg-slate-50 p-5">
            <h4 className="mb-4 text-sm font-black uppercase tracking-wide text-[#4E1743]">
              Sueldo base y bonos
            </h4>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {[
                ["sueldoBase", "Sueldo base", "Ej: 539000"],
                ["bonoColacion", "Bono colación", "Ej: 25000"],
                ["bonoLocomocion", "Bono locomoción", "Ej: 25000"],
                ["bonoAsistencia", "Bono asistencia", "Ej: 30000"],
                ["bonoNoche", "Bono noche", "Ej: 20000"],
                ["otrosBonos", "Otros bonos", "Ej: 10000"],
                ["valorHoraExtra", "Valor hora extra", "Ej: 4500"],
              ].map(([field, label, placeholder]) => (
                <div key={field}>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    {label}
                  </label>

                  <div className="flex overflow-hidden rounded-2xl border border-slate-300 bg-white focus-within:border-[#4E1743] focus-within:ring-4 focus-within:ring-[#4E1743]/10">
                    <span className="flex items-center bg-slate-50 px-4 font-black text-slate-500">
                      $
                    </span>

                    <input
                      value={formatearMiles(form[field as keyof TarifaForm])}
                      onChange={(e) =>
                        onChange(
                          field as keyof TarifaForm,
                          limpiarNumero(e.target.value)
                        )
                      }
                      className="w-full px-4 py-3 font-semibold outline-none"
                      placeholder={placeholder}
                      inputMode="numeric"
                      required={field === "sueldoBase"}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-sm font-bold text-slate-500">
              Total mensual estimado
            </p>

            <p className="mt-2 text-3xl font-black text-slate-900">
              {new Intl.NumberFormat("es-CL", {
                style: "currency",
                currency: "CLP",
                maximumFractionDigits: 0,
              }).format(totalMensual)}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Sueldo base + bonos. No incluye horas extras.
            </p>
          </div>

          <div className="sticky bottom-0 -mx-6 -mb-6 flex gap-3 border-t bg-white p-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-2xl border border-slate-300 px-4 py-3 font-bold text-slate-700 hover:bg-slate-50"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={loading || !form.sucursalId || !form.cargoId || !form.sueldoBase}
              className="flex-1 rounded-2xl bg-[#4E1743] px-4 py-3 font-black text-white hover:bg-[#3d1235] disabled:opacity-60"
            >
              {loading ? "Guardando..." : editando ? "Actualizar" : "Crear tarifa"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}