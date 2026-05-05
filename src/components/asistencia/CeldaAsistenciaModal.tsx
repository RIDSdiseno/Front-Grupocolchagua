import type { AsistenciaForm, EstadoAsistencia, TurnoAsistencia } from "../../types/asistencia";

interface Props {
  open: boolean;
  loading: boolean;
  trabajadorNombre: string;
  fecha: string; // "2026-03-15"
  form: AsistenciaForm;
  onClose: () => void;
  onChange: (field: keyof AsistenciaForm, value: string | number) => void;
  onSubmit: () => void;
  onEliminar?: () => void;
  esEdicion: boolean;
}

const ESTADOS: { valor: EstadoAsistencia; label: string; color: string }[] = [
  { valor: "A", label: "Asistió", color: "bg-green-500 text-white" },
  { valor: "L", label: "Libre", color: "bg-slate-400 text-white" },
  { valor: "F", label: "Falta", color: "bg-red-500 text-white" },
];

const formatFechaLegible = (fecha: string) => {
  const [año, mes, dia] = fecha.split("-").map(Number);
  return new Date(Date.UTC(año, mes - 1, dia)).toLocaleDateString("es-CL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
};

export default function CeldaAsistenciaModal({
  open,
  loading,
  trabajadorNombre,
  fecha,
  form,
  onClose,
  onChange,
  onSubmit,
  onEliminar,
  esEdicion,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <h3 className="font-bold text-[#4E1743]">{trabajadorNombre}</h3>
            <p className="text-sm capitalize text-slate-500">
              {formatFechaLegible(fecha)}
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

        <div className="p-6">
          {/* Estado */}
          <div className="mb-5">
            <p className="mb-3 text-sm font-bold uppercase tracking-wide text-[#4E1743]">
              Estado
            </p>
            <div className="flex gap-3">
              {ESTADOS.map(({ valor, label, color }) => (
                <button
                  key={valor}
                  type="button"
                  onClick={() => onChange("estado", valor)}
                  className={`flex-1 rounded-xl py-3 font-black transition ${
                    form.estado === valor
                      ? color + " shadow-md scale-105"
                      : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                  }`}
                >
                  {valor}
                  <span className="block text-xs font-semibold opacity-80">
                    {label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Horas extras */}
          <div className="mb-5">
            <p className="mb-3 text-sm font-bold uppercase tracking-wide text-[#4E1743]">
              Horas extras
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() =>
                  onChange("horasExtras", Math.max(0, form.horasExtras - 0.5))
                }
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-xl font-black hover:bg-slate-200"
              >
                −
              </button>
              <span className="flex-1 rounded-xl border border-slate-200 py-2 text-center text-2xl font-black text-slate-900">
                {form.horasExtras}h
              </span>
              <button
                type="button"
                onClick={() =>
                  onChange("horasExtras", Math.min(12, form.horasExtras + 0.5))
                }
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-xl font-black hover:bg-slate-200"
              >
                +
              </button>
            </div>
          </div>

          {/* Turno */}
          <div className="mb-5">
            <p className="mb-3 text-sm font-bold uppercase tracking-wide text-[#4E1743]">
              Turno
            </p>
            <div className="flex gap-3">
              {(["diurno", "nocturno"] as TurnoAsistencia[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => onChange("turno", t)}
                  className={`flex-1 rounded-xl py-3 font-bold capitalize transition ${
                    form.turno === t
                      ? "bg-[#4E1743] text-white shadow-md"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Observación */}
          <div className="mb-5">
            <p className="mb-2 text-sm font-bold uppercase tracking-wide text-[#4E1743]">
              Observación{" "}
              <span className="font-normal normal-case text-slate-400">
                (opcional)
              </span>
            </p>
            <input
              type="text"
              value={form.observacion}
              onChange={(e) => onChange("observacion", e.target.value)}
              placeholder="Ej: llegó tarde, salida anticipada..."
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-[#4E1743] focus:ring-2 focus:ring-[#4E1743]/20"
            />
          </div>

          {/* Acciones */}
          <div className="flex gap-3">
            {esEdicion && onEliminar && (
              <button
                type="button"
                onClick={onEliminar}
                className="rounded-xl bg-red-50 px-4 py-3 font-bold text-red-700 hover:bg-red-100"
              >
                Eliminar
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-slate-300 px-4 py-3 font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={onSubmit}
              disabled={loading}
              className="flex-1 rounded-xl bg-[#4E1743] px-4 py-3 font-bold text-white hover:bg-[#3d1235] disabled:opacity-60"
            >
              {loading ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
