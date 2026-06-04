import type { Dispatch, SetStateAction } from "react";
import type {
  CrearEmpleoPayload,
  Empleo,
  EstadoEmpleo,
  JornadaEmpleo,
  ModalidadEmpleo,
} from "../../types/empleo";

interface Props {
  open: boolean;
  editando: Empleo | null;
  form: CrearEmpleoPayload;
  guardando: boolean;
  onClose: () => void;
  onSubmit: () => void;
  setForm: Dispatch<SetStateAction<CrearEmpleoPayload>>;
}

const estadosLista: EstadoEmpleo[] = [
  "BORRADOR",
  "PUBLICADO",
  "PAUSADO",
  "CERRADO",
];

const modalidades: ModalidadEmpleo[] = ["PRESENCIAL", "REMOTO", "HIBRIDO"];

const jornadas: JornadaEmpleo[] = [
  "FULL_TIME",
  "PART_TIME",
  "TURNOS",
  "FREELANCE",
  "PRACTICA",
];

const estadoLabel: Record<EstadoEmpleo, string> = {
  BORRADOR: "Borrador",
  PUBLICADO: "Publicado",
  PAUSADO: "Pausado",
  CERRADO: "Cerrado",
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

export default function EmpleoFormModal({
  open,
  editando,
  form,
  guardando,
  onClose,
  onSubmit,
  setForm,
}: Props) {
  if (!open) return null;

  const formatearSueldoInput = (valor: string) => {
    const soloNumeros = valor.replace(/\D/g, "");

    if (!soloNumeros) return "";

    return `$${Number(soloNumeros).toLocaleString("es-CL")}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h3 className="text-xl font-bold text-slate-800">
              {editando ? "Editar empleo" : "Nuevo empleo"}
            </h3>
            <p className="text-sm text-slate-500">
              Completa la información de la oferta laboral.
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

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-600">
              Título *
            </label>
            <input
              value={form.titulo}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, titulo: e.target.value }))
              }
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-[#4E1743] focus:outline-none focus:ring-2 focus:ring-[#4E1743]/20"
              placeholder="Ej: Operario de bodega"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-600">
              Empresa
            </label>
            <input
              value={form.empresa ?? ""}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, empresa: e.target.value }))
              }
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-[#4E1743] focus:outline-none focus:ring-2 focus:ring-[#4E1743]/20"
              placeholder="Ej: Grupo Colchagua"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-600">
              Cargo
            </label>
            <input
              value={form.cargo ?? ""}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, cargo: e.target.value }))
              }
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-[#4E1743] focus:outline-none focus:ring-2 focus:ring-[#4E1743]/20"
              placeholder="Ej: Asistente RRHH"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-600">
              Ubicación
            </label>
            <input
              value={form.ubicacion ?? ""}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, ubicacion: e.target.value }))
              }
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-[#4E1743] focus:outline-none focus:ring-2 focus:ring-[#4E1743]/20"
              placeholder="Ej: Santiago Centro"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-600">
              Comuna
            </label>
            <input
              value={form.comuna ?? ""}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, comuna: e.target.value }))
              }
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-[#4E1743] focus:outline-none focus:ring-2 focus:ring-[#4E1743]/20"
              placeholder="Ej: Santiago"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-600">
              Región
            </label>
            <input
              value={form.region ?? ""}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, region: e.target.value }))
              }
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-[#4E1743] focus:outline-none focus:ring-2 focus:ring-[#4E1743]/20"
              placeholder="Ej: Metropolitana"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-600">
              Modalidad
            </label>
            <select
              value={form.modalidad ?? "PRESENCIAL"}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  modalidad: e.target.value as ModalidadEmpleo,
                }))
              }
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-[#4E1743] focus:outline-none"
            >
              {modalidades.map((modalidad) => (
                <option key={modalidad} value={modalidad}>
                  {modalidadLabel[modalidad]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-600">
              Jornada
            </label>
            <select
              value={form.jornada ?? "FULL_TIME"}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  jornada: e.target.value as JornadaEmpleo,
                }))
              }
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-[#4E1743] focus:outline-none"
            >
              {jornadas.map((jornada) => (
                <option key={jornada} value={jornada}>
                  {jornadaLabel[jornada]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-600">
              Sueldo
            </label>
            <input
              value={form.sueldo ?? ""}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  sueldo: formatearSueldoInput(e.target.value),
                }))
              }
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-[#4E1743] focus:outline-none focus:ring-2 focus:ring-[#4E1743]/20"
              placeholder="Ej: $650.000"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-600">
              Vacantes
            </label>
            <input
              type="number"
              min={1}
              value={form.vacantes ?? 1}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  vacantes: Number(e.target.value),
                }))
              }
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-[#4E1743] focus:outline-none focus:ring-2 focus:ring-[#4E1743]/20"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-600">
              Estado
            </label>
            <select
              value={form.estado ?? "BORRADOR"}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  estado: e.target.value as EstadoEmpleo,
                }))
              }
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-[#4E1743] focus:outline-none"
            >
              {estadosLista.map((estado) => (
                <option key={estado} value={estado}>
                  {estadoLabel[estado]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-600">
              Fecha cierre
            </label>
            <input
              type="date"
              value={form.fechaCierre ?? ""}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  fechaCierre: e.target.value,
                }))
              }
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-[#4E1743] focus:outline-none focus:ring-2 focus:ring-[#4E1743]/20"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-semibold text-slate-600">
              Descripción *
            </label>
            <textarea
              rows={4}
              value={form.descripcion}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  descripcion: e.target.value,
                }))
              }
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-[#4E1743] focus:outline-none focus:ring-2 focus:ring-[#4E1743]/20"
              placeholder="Describe las funciones principales del empleo..."
            />
          </div>

          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-semibold text-slate-600">
              Requisitos
            </label>
            <textarea
              rows={3}
              value={form.requisitos ?? ""}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  requisitos: e.target.value,
                }))
              }
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-[#4E1743] focus:outline-none focus:ring-2 focus:ring-[#4E1743]/20"
              placeholder="Ej: experiencia mínima, disponibilidad, conocimientos..."
            />
          </div>

          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-semibold text-slate-600">
              Beneficios
            </label>
            <textarea
              rows={3}
              value={form.beneficios ?? ""}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  beneficios: e.target.value,
                }))
              }
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-[#4E1743] focus:outline-none focus:ring-2 focus:ring-[#4E1743]/20"
              placeholder="Ej: colación, movilización, bonos, estabilidad laboral..."
            />
          </div>
        </div>

        <div className="mt-6 flex flex-col justify-end gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={onSubmit}
            disabled={guardando}
            className="rounded-xl bg-[#4E1743] px-5 py-2 text-sm font-semibold text-white hover:bg-[#3d1235] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {guardando
              ? "Guardando..."
              : editando
              ? "Guardar cambios"
              : "Crear empleo"}
          </button>
        </div>
      </div>
    </div>
  );
}