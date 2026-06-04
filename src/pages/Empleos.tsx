import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import EmpleoFormModal from "../components/empleos/EmpleoFormModal";
import EmpleoVerModal from "../components/empleos/EmpleoVerModal";
import {
  actualizarEmpleo,
  cerrarEmpleo,
  crearEmpleo,
  eliminarEmpleo,
  obtenerEmpleos,
  pausarEmpleo,
  publicarEmpleo,
} from "../services/empleo.service";
import type {
  CrearEmpleoPayload,
  Empleo,
  EstadoEmpleo,
  JornadaEmpleo,
  ModalidadEmpleo,
} from "../types/empleo";

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

const estadosLista: EstadoEmpleo[] = [
  "BORRADOR",
  "PUBLICADO",
  "PAUSADO",
  "CERRADO",
];

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

const formInicial: CrearEmpleoPayload = {
  titulo: "",
  empresa: "",
  cargo: "",
  ubicacion: "",
  comuna: "",
  region: "",
  modalidad: "PRESENCIAL",
  jornada: "FULL_TIME",
  sueldo: "",
  descripcion: "",
  requisitos: "",
  beneficios: "",
  vacantes: 1,
  estado: "BORRADOR",
  fechaCierre: "",
};

export default function Empleos() {
  const [empleos, setEmpleos] = useState<Empleo[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<EstadoEmpleo | "Todos">(
    "Todos"
  );
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [accionId, setAccionId] = useState<number | null>(null);
  const [modalFormulario, setModalFormulario] = useState(false);
  const [modalVer, setModalVer] = useState<Empleo | null>(null);
  const [editando, setEditando] = useState<Empleo | null>(null);
  const [form, setForm] = useState<CrearEmpleoPayload>(formInicial);

  useEffect(() => {
    let mounted = true;

    const cargar = async () => {
      try {
        const data = await obtenerEmpleos();
        if (mounted) setEmpleos(data);
      } catch (error) {
        console.error("Error cargando empleos:", error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void cargar();

    return () => {
      mounted = false;
    };
  }, []);

  const cargarEmpleos = async () => {
    try {
      setLoading(true);
      const data = await obtenerEmpleos();
      setEmpleos(data);
    } catch (error) {
      console.error("Error cargando empleos:", error);
      alert("No se pudieron cargar los empleos.");
    } finally {
      setLoading(false);
    }
  };

  const abrirNuevo = () => {
    setEditando(null);
    setForm(formInicial);
    setModalFormulario(true);
  };

  const abrirEditar = (empleo: Empleo) => {
    setEditando(empleo);
    setModalVer(null);
    setForm({
      titulo: empleo.titulo,
      empresa: empleo.empresa ?? "",
      cargo: empleo.cargo ?? "",
      ubicacion: empleo.ubicacion ?? "",
      comuna: empleo.comuna ?? "",
      region: empleo.region ?? "",
      modalidad: empleo.modalidad ?? "PRESENCIAL",
      jornada: empleo.jornada ?? "FULL_TIME",
      sueldo: empleo.sueldo ?? "",
      descripcion: empleo.descripcion,
      requisitos: empleo.requisitos ?? "",
      beneficios: empleo.beneficios ?? "",
      vacantes: empleo.vacantes,
      estado: empleo.estado,
      fechaCierre: empleo.fechaCierre
        ? empleo.fechaCierre.substring(0, 10)
        : "",
    });
    setModalFormulario(true);
  };

  const cerrarFormulario = () => {
    setModalFormulario(false);
    setEditando(null);
    setForm(formInicial);
  };

  const guardarEmpleo = async () => {
    if (!form.titulo.trim() || !form.descripcion.trim()) {
      alert("El título y la descripción son obligatorios.");
      return;
    }

    try {
      setGuardando(true);

      const payload: CrearEmpleoPayload = {
        ...form,
        empresa: form.empresa || null,
        cargo: form.cargo || null,
        ubicacion: form.ubicacion || null,
        comuna: form.comuna || null,
        region: form.region || null,
        sueldo: form.sueldo || null,
        requisitos: form.requisitos || null,
        beneficios: form.beneficios || null,
        fechaCierre: form.fechaCierre || null,
        vacantes: Number(form.vacantes) || 1,
      };

      if (editando) {
        const actualizado = await actualizarEmpleo(editando.id, payload);
        setEmpleos((prev) =>
          prev.map((e) => (e.id === actualizado.id ? actualizado : e))
        );
      } else {
        const creado = await crearEmpleo(payload);
        setEmpleos((prev) => [creado, ...prev]);
      }

      cerrarFormulario();
    } catch (error) {
      console.error("Error guardando empleo:", error);
      alert("No se pudo guardar el empleo.");
    } finally {
      setGuardando(false);
    }
  };

  const cambiarEstado = async (empleo: Empleo, accion: EstadoEmpleo) => {
    try {
      setAccionId(empleo.id);

      let actualizado: Empleo;

      if (accion === "PUBLICADO") actualizado = await publicarEmpleo(empleo.id);
      else if (accion === "PAUSADO") actualizado = await pausarEmpleo(empleo.id);
      else if (accion === "CERRADO") actualizado = await cerrarEmpleo(empleo.id);
      else actualizado = await actualizarEmpleo(empleo.id, { estado: "BORRADOR" });

      setEmpleos((prev) =>
        prev.map((e) => (e.id === actualizado.id ? actualizado : e))
      );

      if (modalVer?.id === actualizado.id) {
        setModalVer(actualizado);
      }
    } catch (error) {
      console.error("Error cambiando estado:", error);
      alert("No se pudo cambiar el estado del empleo.");
    } finally {
      setAccionId(null);
    }
  };

  const eliminar = async (empleo: Empleo) => {
    if (!confirm(`¿Eliminar el empleo "${empleo.titulo}"?`)) return;

    try {
      setAccionId(empleo.id);
      await eliminarEmpleo(empleo.id);
      setEmpleos((prev) => prev.filter((e) => e.id !== empleo.id));

      if (modalVer?.id === empleo.id) {
        setModalVer(null);
      }
    } catch (error) {
      console.error("Error eliminando empleo:", error);
      alert("No se pudo eliminar el empleo.");
    } finally {
      setAccionId(null);
    }
  };

  const filtrados = useMemo(() => {
    const textoBusqueda = busqueda.trim().toLowerCase();

    return empleos.filter((empleo) => {
      const texto = `
        ${empleo.titulo}
        ${empleo.empresa ?? ""}
        ${empleo.cargo ?? ""}
        ${empleo.ubicacion ?? ""}
        ${empleo.comuna ?? ""}
        ${empleo.region ?? ""}
        ${empleo.descripcion}
        ${empleo.sueldo ?? ""}
      `.toLowerCase();

      const coincideBusqueda =
        textoBusqueda.length === 0 || texto.includes(textoBusqueda);

      const coincideEstado =
        filtroEstado === "Todos" || empleo.estado === filtroEstado;

      return coincideBusqueda && coincideEstado;
    });
  }, [empleos, busqueda, filtroEstado]);

  const contadores = estadosLista.reduce((acc, estado) => {
    acc[estado] = empleos.filter((empleo) => empleo.estado === estado).length;
    return acc;
  }, {} as Record<EstadoEmpleo, number>);

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
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Empleos</h2>
            <p className="text-sm text-slate-500">
              Creación y publicación de ofertas laborales para la web pública.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={cargarEmpleos}
              disabled={loading}
              className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Cargando..." : "Actualizar"}
            </button>

            <button
              type="button"
              onClick={abrirNuevo}
              className="rounded-xl bg-[#4E1743] px-5 py-2.5 font-semibold text-white transition hover:bg-[#3d1235]"
            >
              + Nuevo empleo
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {estadosLista.map((estado) => (
            <button
              type="button"
              key={estado}
              onClick={() =>
                setFiltroEstado(filtroEstado === estado ? "Todos" : estado)
              }
              className={`rounded-xl border-2 p-3 text-center transition ${
                filtroEstado === estado
                  ? "border-[#4E1743] bg-[#4E1743] text-white"
                  : "border-slate-200 bg-white hover:border-[#4E1743]/40"
              }`}
            >
              <p className="text-2xl font-bold">{contadores[estado] ?? 0}</p>
              <p className="text-xs font-medium">
                {estadoConfig[estado].label}
              </p>
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            placeholder="Buscar por título, empresa, cargo, comuna, región o descripción..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm shadow-sm focus:border-[#4E1743] focus:outline-none focus:ring-2 focus:ring-[#4E1743]/20"
          />

          <select
            value={filtroEstado}
            onChange={(e) =>
              setFiltroEstado(e.target.value as EstadoEmpleo | "Todos")
            }
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm shadow-sm focus:border-[#4E1743] focus:outline-none"
          >
            <option value="Todos">Todos los estados</option>
            {estadosLista.map((estado) => (
              <option key={estado} value={estado}>
                {estadoConfig[estado].label}
              </option>
            ))}
          </select>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-4 text-left">Oferta</th>
                  <th className="px-5 py-4 text-left">Empresa</th>
                  <th className="hidden px-5 py-4 text-left md:table-cell">
                    Modalidad
                  </th>
                  <th className="hidden px-5 py-4 text-left lg:table-cell">
                    Vacantes
                  </th>
                  <th className="hidden px-5 py-4 text-left lg:table-cell">
                    Cierre
                  </th>
                  <th className="px-5 py-4 text-left">Estado</th>
                  <th className="px-5 py-4 text-right">Acciones</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      Cargando empleos...
                    </td>
                  </tr>
                ) : filtrados.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      No se encontraron empleos.
                    </td>
                  </tr>
                ) : (
                  filtrados.map((empleo) => (
                    <tr key={empleo.id} className="transition hover:bg-slate-50">
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-800">
                          {empleo.titulo}
                        </p>
                        <p className="text-xs text-slate-400">
                          {empleo.cargo || "Sin cargo definido"}
                        </p>
                        <p className="text-xs text-slate-400">
                          {[empleo.comuna, empleo.region]
                            .filter(Boolean)
                            .join(", ") || "Sin ubicación"}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {empleo.empresa || "—"}
                        <p className="text-xs text-slate-400">
                          {formatearSueldo(empleo.sueldo)}
                        </p>
                      </td>

                      <td className="hidden px-5 py-4 text-slate-600 md:table-cell">
                        {empleo.modalidad
                          ? modalidadLabel[empleo.modalidad]
                          : "—"}

                        {empleo.jornada && (
                          <p className="text-xs text-slate-400">
                            {jornadaLabel[empleo.jornada]}
                          </p>
                        )}
                      </td>

                      <td className="hidden px-5 py-4 text-slate-600 lg:table-cell">
                        {empleo.vacantes}
                      </td>

                      <td className="hidden px-5 py-4 text-slate-600 lg:table-cell">
                        {formatearFecha(empleo.fechaCierre)}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                            estadoConfig[empleo.estado].bg
                          } ${estadoConfig[empleo.estado].color}`}
                        >
                          {estadoConfig[empleo.estado].label}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-right">
                        <div className="flex flex-wrap justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setModalVer(empleo)}
                            className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-[#4E1743] hover:text-white"
                          >
                            Ver
                          </button>

                          <button
                            type="button"
                            onClick={() => abrirEditar(empleo)}
                            className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 transition hover:bg-blue-600 hover:text-white"
                          >
                            Editar
                          </button>

                          {empleo.estado !== "PUBLICADO" && (
                            <button
                              type="button"
                              onClick={() => cambiarEstado(empleo, "PUBLICADO")}
                              disabled={accionId === empleo.id}
                              className="rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 transition hover:bg-emerald-600 hover:text-white disabled:opacity-60"
                            >
                              Publicar
                            </button>
                          )}

                          {empleo.estado === "PUBLICADO" && (
                            <button
                              type="button"
                              onClick={() => cambiarEstado(empleo, "PAUSADO")}
                              disabled={accionId === empleo.id}
                              className="rounded-lg bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700 transition hover:bg-amber-600 hover:text-white disabled:opacity-60"
                            >
                              Pausar
                            </button>
                          )}

                          {empleo.estado !== "CERRADO" && (
                            <button
                              type="button"
                              onClick={() => cambiarEstado(empleo, "CERRADO")}
                              disabled={accionId === empleo.id}
                              className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-600 hover:text-white disabled:opacity-60"
                            >
                              Cerrar
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => eliminar(empleo)}
                            disabled={accionId === empleo.id}
                            className="rounded-lg bg-red-100 px-3 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-700 hover:text-white disabled:opacity-60"
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="border-t border-slate-100 px-5 py-3 text-xs text-slate-400">
            {filtrados.length} de {empleos.length} empleo(s)
          </div>
        </div>
      </div>

      <EmpleoFormModal
        open={modalFormulario}
        editando={editando}
        form={form}
        guardando={guardando}
        onClose={cerrarFormulario}
        onSubmit={guardarEmpleo}
        setForm={setForm}
      />

      <EmpleoVerModal
        empleo={modalVer}
        accionId={accionId}
        onClose={() => setModalVer(null)}
        onEdit={abrirEditar}
        onDelete={eliminar}
      />
    </DashboardLayout>
  );
}