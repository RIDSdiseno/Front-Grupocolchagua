import type {
  Empleo,
  EstadoEmpleo,
  JornadaEmpleo,
  ModalidadEmpleo,
} from "../../types/empleo";

interface Props {
  empleo: Empleo | null;
  accionId: number | null;
  onClose: () => void;
  onEdit: (empleo: Empleo) => void;
  onDelete: (empleo: Empleo) => void;
}

const estadoConfig: Record<
  EstadoEmpleo,
  { label: string; color: string; bg: string }
> = {
  BORRADOR: { label: "Borrador", color: "text-slate-700", bg: "bg-slate-100" },
  PUBLICADO: {
    label: "Publicado",
    color: "text-emerald-700",
    bg: "bg-emerald-100",
  },
  PAUSADO: { label: "Pausado", color: "text-amber-700", bg: "bg-amber-100" },
  CERRADO: { label: "Cerrado", color: "text-red-700", bg: "bg-red-100" },
};

const modalidadLabel: Record<ModalidadEmpleo, string> = {
  PRESENCIAL: "Presencial",
  REMOTO: "Remoto",
  HIBRIDO: "Híbrido",
};

const jornadaLabel: Record<JornadaEmpleo, string> = {
  FULL_TIME: "Full time",
  PART_TIME: "Part time",
  TURNOS: "Turnos",
  FREELANCE: "Freelance",
  PRACTICA: "Práctica",
};

export default function EmpleoVerModal({
  empleo,
  accionId,
  onClose,
  onEdit,
  onDelete,
}: Props) {
  if (!empleo) return null;

  const formatearFecha = (fecha: string | null) => {
    if (!fecha) return "—";

    return new Date(fecha).toLocaleDateString("es-CL", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const formatearSueldo = (valor: string | null) => {
    if (!valor) return "—";

    const soloNumeros = valor.replace(/\D/g, "");

    if (!soloNumeros) return valor;

    return `$${Number(soloNumeros).toLocaleString("es-CL")}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h3 className="text-xl font-bold text-slate-800">
              {empleo.titulo}
            </h3>
            <p className="text-sm text-slate-500">
              {empleo.empresa || "Sin empresa"} · {empleo.cargo || "Sin cargo"}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            ✕
          </button>
        </div>

        <div className="mb-5 grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
          <div>
            <p className="font-semibold text-slate-500">Estado</p>
            <span
              className={`mt-1 inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${
                estadoConfig[empleo.estado].bg
              } ${estadoConfig[empleo.estado].color}`}
            >
              {estadoConfig[empleo.estado].label}
            </span>
          </div>

          <div>
            <p className="font-semibold text-slate-500">Vacantes</p>
            <p className="text-slate-700">{empleo.vacantes}</p>
          </div>

          <div>
            <p className="font-semibold text-slate-500">Modalidad</p>
            <p className="text-slate-700">
              {empleo.modalidad ? modalidadLabel[empleo.modalidad] : "—"}
            </p>
          </div>

          <div>
            <p className="font-semibold text-slate-500">Jornada</p>
            <p className="text-slate-700">
              {empleo.jornada ? jornadaLabel[empleo.jornada] : "—"}
            </p>
          </div>

          <div>
            <p className="font-semibold text-slate-500">Ubicación</p>
            <p className="text-slate-700">
              {[empleo.ubicacion, empleo.comuna, empleo.region]
                .filter(Boolean)
                .join(", ") || "—"}
            </p>
          </div>

          <div>
            <p className="font-semibold text-slate-500">Sueldo</p>
            <p className="text-slate-700">{formatearSueldo(empleo.sueldo)}</p>
          </div>

          <div>
            <p className="font-semibold text-slate-500">Publicado</p>
            <p className="text-slate-700">
              {formatearFecha(empleo.publicadoEn)}
            </p>
          </div>

          <div>
            <p className="font-semibold text-slate-500">Cierre</p>
            <p className="text-slate-700">
              {formatearFecha(empleo.fechaCierre)}
            </p>
          </div>
        </div>

        <div className="mb-5 rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
          <p className="mb-1 font-semibold text-slate-500">Descripción</p>
          <p className="whitespace-pre-line">{empleo.descripcion}</p>
        </div>

        {empleo.requisitos && (
          <div className="mb-5 rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
            <p className="mb-1 font-semibold text-slate-500">Requisitos</p>
            <p className="whitespace-pre-line">{empleo.requisitos}</p>
          </div>
        )}

        {empleo.beneficios && (
          <div className="mb-5 rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
            <p className="mb-1 font-semibold text-slate-500">Beneficios</p>
            <p className="whitespace-pre-line">{empleo.beneficios}</p>
          </div>
        )}

        <div className="flex flex-col justify-end gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => onEdit(empleo)}
            className="rounded-xl bg-blue-50 px-4 py-2 text-center text-sm font-semibold text-blue-700 hover:bg-blue-600 hover:text-white"
          >
            Editar
          </button>

          <button
            type="button"
            onClick={() => onDelete(empleo)}
            disabled={accionId === empleo.id}
            className="rounded-xl bg-red-50 px-4 py-2 text-center text-sm font-semibold text-red-700 hover:bg-red-600 hover:text-white disabled:opacity-60"
          >
            Eliminar
          </button>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-[#4E1743] px-5 py-2 text-sm font-semibold text-white hover:bg-[#3d1235]"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}