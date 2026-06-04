import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import {
  actualizarEstadoPostulacion,
  obtenerPostulaciones,
} from "../services/postulacion.service";
import type {
  EstadoPostulacion,
  Postulacion,
} from "../types/postulacion";

const estadoConfig: Record<
  EstadoPostulacion,
  { label: string; color: string; bg: string }
> = {
  PENDIENTE: {
    label: "Pendiente",
    color: "text-amber-700",
    bg: "bg-amber-100",
  },
  POR_CONTACTAR: {
    label: "Por contactar",
    color: "text-blue-700",
    bg: "bg-blue-100",
  },
  CONTACTADO: {
    label: "Contactado",
    color: "text-emerald-700",
    bg: "bg-emerald-100",
  },
  DESCARTADO: {
    label: "Descartado",
    color: "text-red-700",
    bg: "bg-red-100",
  },
};

const estadosLista: EstadoPostulacion[] = [
  "PENDIENTE",
  "POR_CONTACTAR",
  "CONTACTADO",
  "DESCARTADO",
];

export default function Postulantes() {
  const [postulantes, setPostulantes] = useState<Postulacion[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<
    EstadoPostulacion | "Todos"
  >("Todos");
  const [modalVer, setModalVer] = useState<Postulacion | null>(null);
  const [loading, setLoading] = useState(true);
  const [actualizandoId, setActualizandoId] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;

    const cargar = async () => {
      try {
        const data = await obtenerPostulaciones();

        if (mounted) {
          setPostulantes(data);
        }
      } catch (error) {
        console.error("Error cargando postulaciones:", error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    void cargar();

    return () => {
      mounted = false;
    };
  }, []);

  const cargarPostulaciones = async () => {
    try {
      setLoading(true);
      const data = await obtenerPostulaciones();
      setPostulantes(data);
    } catch (error) {
      console.error("Error cargando postulaciones:", error);
      alert("No se pudieron cargar las postulaciones.");
    } finally {
      setLoading(false);
    }
  };

  const filtrados = useMemo(() => {
    const textoBusqueda = busqueda.trim().toLowerCase();

    return postulantes.filter((p) => {
      const texto = `
        ${p.nombre}
        ${p.apellido}
        ${p.email}
        ${p.telefono}
        ${p.rut ?? ""}
        ${p.cargoPostula}
        ${p.comuna ?? ""}
        ${p.region ?? ""}
      `.toLowerCase();

      const coincideBusqueda =
        textoBusqueda.length === 0 || texto.includes(textoBusqueda);

      const coincideEstado =
        filtroEstado === "Todos" || p.estado === filtroEstado;

      return coincideBusqueda && coincideEstado;
    });
  }, [postulantes, busqueda, filtroEstado]);

  const contadores = estadosLista.reduce((acc, estado) => {
    acc[estado] = postulantes.filter((p) => p.estado === estado).length;
    return acc;
  }, {} as Record<EstadoPostulacion, number>);

  const cambiarEstado = async (id: number, estado: EstadoPostulacion) => {
    try {
      setActualizandoId(id);

      const actualizada = await actualizarEstadoPostulacion(id, estado);

      setPostulantes((prev) =>
        prev.map((p) => (p.id === id ? actualizada : p))
      );

      if (modalVer?.id === id) {
        setModalVer(actualizada);
      }
    } catch (error) {
      console.error("Error actualizando estado:", error);
      alert("No se pudo actualizar el estado de la postulación.");
    } finally {
      setActualizandoId(null);
    }
  };

  const formatearFecha = (fecha: string) => {
    if (!fecha) return "—";

    return new Date(fecha).toLocaleDateString("es-CL", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              Postulaciones
            </h2>
            <p className="text-sm text-slate-500">
              Gestión de candidatos recibidos desde el formulario público.
            </p>
          </div>

          <button
            type="button"
            onClick={cargarPostulaciones}
            disabled={loading}
            className="rounded-xl bg-[#4E1743] px-5 py-2.5 font-semibold text-white transition hover:bg-[#3d1235] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Cargando..." : "Actualizar"}
          </button>
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
            placeholder="Buscar por nombre, apellido, email, teléfono, RUT, cargo, comuna o región..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm shadow-sm focus:border-[#4E1743] focus:outline-none focus:ring-2 focus:ring-[#4E1743]/20"
          />

          <select
            value={filtroEstado}
            onChange={(e) =>
              setFiltroEstado(e.target.value as EstadoPostulacion | "Todos")
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
                  <th className="px-5 py-4 text-left">Postulante</th>
                  <th className="px-5 py-4 text-left">RUT</th>
                  <th className="px-5 py-4 text-left">Cargo</th>
                  <th className="hidden px-5 py-4 text-left md:table-cell">
                    Ubicación
                  </th>
                  <th className="hidden px-5 py-4 text-left lg:table-cell">
                    Teléfono
                  </th>
                  <th className="hidden px-5 py-4 text-left lg:table-cell">
                    Fecha
                  </th>
                  <th className="px-5 py-4 text-left">Estado</th>
                  <th className="px-5 py-4 text-right">Acciones</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="py-12 text-center text-slate-400"
                    >
                      Cargando postulaciones...
                    </td>
                  </tr>
                ) : filtrados.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="py-12 text-center text-slate-400"
                    >
                      No se encontraron postulaciones.
                    </td>
                  </tr>
                ) : (
                  filtrados.map((p) => (
                    <tr key={p.id} className="transition hover:bg-slate-50">
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-800">
                          {p.nombre} {p.apellido || "Sin apellido"}
                        </p>
                        <p className="text-xs text-slate-400">{p.email}</p>
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {p.rut || "—"}
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {p.cargoPostula || "—"}
                      </td>

                      <td className="hidden px-5 py-4 text-slate-600 md:table-cell">
                        {[p.comuna, p.region].filter(Boolean).join(", ") ||
                          "—"}
                      </td>

                      <td className="hidden px-5 py-4 text-slate-600 lg:table-cell">
                        {p.telefono || "—"}
                      </td>

                      <td className="hidden px-5 py-4 text-slate-600 lg:table-cell">
                        {formatearFecha(p.createdAt)}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                            estadoConfig[p.estado].bg
                          } ${estadoConfig[p.estado].color}`}
                        >
                          {estadoConfig[p.estado].label}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setModalVer(p)}
                            className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-[#4E1743] hover:text-white"
                          >
                            Ver
                          </button>

                          <a
                            href={p.cvUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 transition hover:bg-blue-600 hover:text-white"
                          >
                            Ver CV
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="border-t border-slate-100 px-5 py-3 text-xs text-slate-400">
            {filtrados.length} de {postulantes.length} postulación(es)
          </div>
        </div>
      </div>

      {modalVer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-start justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-800">
                  {modalVer.nombre} {modalVer.apellido || "Sin apellido"}
                </h3>
                <p className="text-sm text-slate-500">
                  Postula a: {modalVer.cargoPostula || "—"}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setModalVer(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="mb-5 grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
              <div>
                <p className="font-semibold text-slate-500">Nombre</p>
                <p className="text-slate-700">{modalVer.nombre}</p>
              </div>

              <div>
                <p className="font-semibold text-slate-500">Apellido</p>
                <p className="text-slate-700">
                  {modalVer.apellido || "—"}
                </p>
              </div>

              <div>
                <p className="font-semibold text-slate-500">RUT</p>
                <p className="text-slate-700">{modalVer.rut || "—"}</p>
              </div>

              <div>
                <p className="font-semibold text-slate-500">Cargo postulado</p>
                <p className="text-slate-700">
                  {modalVer.cargoPostula || "—"}
                </p>
              </div>

              <div>
                <p className="font-semibold text-slate-500">Email</p>
                <p className="text-slate-700">{modalVer.email}</p>
              </div>

              <div>
                <p className="font-semibold text-slate-500">Teléfono</p>
                <p className="text-slate-700">
                  {modalVer.telefono || "—"}
                </p>
              </div>

              <div>
                <p className="font-semibold text-slate-500">Comuna</p>
                <p className="text-slate-700">{modalVer.comuna || "—"}</p>
              </div>

              <div>
                <p className="font-semibold text-slate-500">Región</p>
                <p className="text-slate-700">{modalVer.region || "—"}</p>
              </div>

              <div>
                <p className="font-semibold text-slate-500">Disponibilidad</p>
                <p className="text-slate-700">
                  {modalVer.disponibilidad || "—"}
                </p>
              </div>

              <div>
                <p className="font-semibold text-slate-500">
                  Fecha postulación
                </p>
                <p className="text-slate-700">
                  {formatearFecha(modalVer.createdAt)}
                </p>
              </div>

              <div>
                <p className="font-semibold text-slate-500">Estado actual</p>
                <span
                  className={`mt-1 inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${
                    estadoConfig[modalVer.estado].bg
                  } ${estadoConfig[modalVer.estado].color}`}
                >
                  {estadoConfig[modalVer.estado].label}
                </span>
              </div>
            </div>

            {modalVer.experiencia && (
              <div className="mb-5 rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
                <p className="mb-1 font-semibold text-slate-500">
                  Experiencia
                </p>
                {modalVer.experiencia}
              </div>
            )}

            {modalVer.mensaje && (
              <div className="mb-5 rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
                <p className="mb-1 font-semibold text-slate-500">Mensaje</p>
                {modalVer.mensaje}
              </div>
            )}

            <div className="mb-5">
              <p className="mb-2 text-sm font-semibold text-slate-600">
                Cambiar estado
              </p>

              <div className="flex flex-wrap gap-2">
                {estadosLista.map((estado) => (
                  <button
                    type="button"
                    key={estado}
                    onClick={() => cambiarEstado(modalVer.id, estado)}
                    disabled={actualizandoId === modalVer.id}
                    className={`rounded-full px-3 py-1 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                      modalVer.estado === estado
                        ? `${estadoConfig[estado].bg} ${estadoConfig[estado].color} ring-2 ring-[#4E1743] ring-offset-1`
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {estadoConfig[estado].label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col justify-end gap-3 sm:flex-row">
              <a
                href={modalVer.cvUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl bg-slate-100 px-4 py-2 text-center text-sm font-semibold text-slate-700 hover:bg-slate-200"
              >
                Ver CV
              </a>

              <button
                type="button"
                onClick={() => setModalVer(null)}
                className="rounded-xl bg-[#4E1743] px-5 py-2 text-sm font-semibold text-white hover:bg-[#3d1235]"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}