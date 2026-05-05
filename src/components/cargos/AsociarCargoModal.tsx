import Select from "react-select";

interface Option {
  value: number;
  label: string;
}

interface Props {
  open: boolean;
  loading: boolean;
  editando: boolean;
  empresaNombre?: string;

  sucursalId: number | null;
  cargoId: number | null;
  pagoPorHora: string;

  opcionesSucursales: Option[];
  opcionesCargos: Option[];

  onClose: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onSucursalChange: (sucursalId: number | null) => void;
  onCargoChange: (cargoId: number | null) => void;
  onPagoChange: (value: string) => void;
  onCrearSucursal: () => void;
  onCrearCargo: () => void;
}

const formatearMiles = (value: string) => {
  const soloNumeros = value.replace(/\D/g, "");
  if (!soloNumeros) return "";
  return new Intl.NumberFormat("es-CL").format(Number(soloNumeros));
};

const selectStyles = {
  control: (base: any, state: any) => ({
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
  sucursalId,
  cargoId,
  pagoPorHora,
  opcionesSucursales,
  opcionesCargos,
  onClose,
  onSubmit,
  onSucursalChange,
  onCargoChange,
  onPagoChange,
  onCrearSucursal,
  onCrearCargo,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-xl rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <h3 className="text-lg font-black text-[#4E1743]">
              {editando ? "Editar tarifa" : "Asociar cargo a sucursal"}
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
          <div className="mb-5">
            <div className="mb-2 flex items-center justify-between gap-3">
              <label className="block text-sm font-semibold text-slate-700">
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

            <Select
              value={
                opcionesSucursales.find(
                  (opcion) => opcion.value === sucursalId
                ) || null
              }
              onChange={(opcion) =>
                onSucursalChange(opcion ? opcion.value : null)
              }
              options={opcionesSucursales}
              placeholder="Buscar o seleccionar sucursal..."
              isSearchable
              noOptionsMessage={() => "No hay sucursales disponibles"}
              styles={selectStyles}
            />
          </div>

          <div className="mb-5">
            <div className="mb-2 flex items-center justify-between gap-3">
              <label className="block text-sm font-semibold text-slate-700">
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

            <Select
              value={
                opcionesCargos.find((opcion) => opcion.value === cargoId) ||
                null
              }
              onChange={(opcion) => onCargoChange(opcion ? opcion.value : null)}
              options={opcionesCargos}
              placeholder="Buscar o seleccionar cargo..."
              isSearchable
              noOptionsMessage={() => "No hay cargos disponibles"}
              styles={selectStyles}
            />
          </div>

          <div className="mb-6">
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Tarifa por hora
            </label>

            <div className="flex overflow-hidden rounded-2xl border border-slate-300 focus-within:border-[#4E1743] focus-within:ring-4 focus-within:ring-[#4E1743]/10">
              <span className="flex items-center bg-slate-50 px-4 font-black text-slate-500">
                $
              </span>

              <input
                value={formatearMiles(pagoPorHora)}
                onChange={(e) => onPagoChange(e.target.value.replace(/\D/g, ""))}
                className="w-full px-4 py-3 font-semibold outline-none"
                placeholder="4.500"
                inputMode="numeric"
                required
              />
            </div>
          </div>

          <div className="flex gap-3">
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
              {loading ? "Guardando..." : editando ? "Actualizar" : "Agregar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}