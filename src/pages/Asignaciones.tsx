import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import AsignacionModal from "../components/asignaciones/AsignacionModal";
import type { Asignacion, AsignacionForm } from "../types/asignacion";
import type { Trabajador } from "../types/trabajador";
import type { Empresa } from "../types/empresa";
import type { Cargo } from "../types/cargo";
import {
  listarAsignacionesRequest,
  crearAsignacionRequest,
  actualizarAsignacionRequest,
  eliminarAsignacionRequest,
} from "../services/asignacion.service";
import { listarTrabajadoresRequest } from "../services/trabajador.service";
import { listarEmpresasRequest } from "../services/empresa.service";
import { listarCargosRequest } from "../services/cargo.service";

const initialForm: AsignacionForm = {
  trabajadorId: "",
  empresaId: "",
  sucursalId: "",
  cargoId: "",
  fechaInicio: "",
  fechaFin: "",
};

const formatFecha = (fecha: string | null | undefined) => {
  if (!fecha) return "Indefinido";
  return new Date(fecha).toLocaleDateString("es-CL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  });
};

const esActiva = (a: Asignacion) => {
  if (!a.fechaFin) return true;
  return new Date(a.fechaFin) >= new Date(new Date().toDateString());
};

export default function Asignaciones() {
  const [asignaciones, setAsignaciones] = useState<Asignacion[]>([]);
  const [trabajadores, setTrabajadores] = useState<Trabajador[]>([]);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [cargos, setCargos] = useState<Cargo[]>([]);

  const [form, setForm] = useState<AsignacionForm>(initialForm);
  const [editando, setEditando] = useState<Asignacion | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  const [filtroEmpresa, setFiltroEmpresa] = useState<number | "">("");
  const [filtroEstado, setFiltroEstado] = useState<"todas" | "activas" | "vencidas">("todas");

  const cargarDatos = async () => {
    try {
      const [asig, trabs, emps, carg] = await Promise.all([
        listarAsignacionesRequest(),
        listarTrabajadoresRequest(),
        listarEmpresasRequest(),
        listarCargosRequest(),
      ]);
      setAsignaciones(asig);
      setTrabajadores(trabs);
      setEmpresas(emps);
      setCargos(carg);
    } catch {
      setError("Error al cargar los datos");
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const asignacionesFiltradas = useMemo(() => {
    return asignaciones.filter((a) => {
      const coincideEmpresa = !filtroEmpresa || a.empresaId === filtroEmpresa;
      const activa = esActiva(a);
      const coincideEstado =
        filtroEstado === "todas" ||
        (filtroEstado === "activas" && activa) ||
        (filtroEstado === "vencidas" && !activa);
      return coincideEmpresa && coincideEstado;
    });
  }, [asignaciones, filtroEmpresa, filtroEstado]);

  const totalActivas = useMemo(
    () => asignaciones.filter(esActiva).length,
    [asignaciones]
  );

  const abrirCrear = () => {
    setForm(initialForm);
    setEditando(null);
    setMensaje("");
    setError("");
    setModalOpen(true);
  };

  const cerrarModal = () => {
    setForm(initialForm);
    setEditando(null);
    setModalOpen(false);
  };

  const editarAsignacion = (a: Asignacion) => {
    setEditando(a);
    setForm({
      trabajadorId: a.trabajadorId,
      empresaId: a.empresaId,
      sucursalId: a.sucursalId ?? "",
      cargoId: a.cargoId,
      fechaInicio: a.fechaInicio.slice(0, 10),
      fechaFin: a.fechaFin ? a.fechaFin.slice(0, 10) : "",
    });
    setMensaje("");
    setError("");
    setModalOpen(true);
  };

  const handleChange = (name: keyof AsignacionForm, value: number | string | "") => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMensaje("");

    try {
      if (editando) {
        await actualizarAsignacionRequest(editando.id, form);
        setMensaje("Asignación actualizada correctamente");
      } else {
        await crearAsignacionRequest(form);
        setMensaje("Asignación creada correctamente");
      }
      cerrarModal();
      await cargarDatos();
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al guardar asignación");
    } finally {
      setLoading(false);
    }
  };

  const eliminarAsignacion = async (a: Asignacion) => {
    const confirmar = confirm(
      `¿Eliminar la asignación de ${a.Trabajador.apellido}, ${a.Trabajador.nombre} en ${a.Empresa.nombre}?`
    );
    if (!confirmar) return;

    try {
      await eliminarAsignacionRequest(a.id);
      setMensaje("Asignación eliminada correctamente");
      await cargarDatos();
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al eliminar asignación");
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-8 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="mb-2 text-sm font-bold uppercase tracking-wide text-[#4E1743]">
            Gestión operacional
          </p>
          <h2 className="text-3xl font-black text-slate-900">Asignaciones</h2>
          <p className="mt-2 max-w-2xl text-slate-500">
            Vincula trabajadores a empresas, sucursales y cargos por período.
          </p>
        </div>

        <button
          onClick={abrirCrear}
          className="rounded-2xl bg-[#4E1743] px-6 py-4 font-black text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-[#3d1235]"
        >
          Nueva asignación
        </button>
      </div>

      {mensaje && (
        <div className="mb-5 rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-sm font-semibold text-green-700">
          {mensaje}
        </div>
      )}

      {error && (
        <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      <div className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-bold text-slate-500">Total asignaciones</p>
          <p className="mt-3 text-4xl font-black text-slate-900">
            {asignaciones.length}
          </p>
          <p className="mt-2 text-sm text-slate-500">Registradas en el sistema.</p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-bold text-slate-500">Activas</p>
          <p className="mt-3 text-4xl font-black text-slate-900">{totalActivas}</p>
          <p className="mt-2 text-sm text-slate-500">En curso o sin fecha de término.</p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-[#4E1743] p-6 text-white shadow-sm">
          <p className="text-sm font-bold text-white/70">Vencidas</p>
          <p className="mt-3 text-4xl font-black">
            {asignaciones.length - totalActivas}
          </p>
          <p className="mt-2 text-sm text-white/70">Con fecha de término pasada.</p>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-black text-slate-900">
              Listado de asignaciones
            </h3>
            <p className="text-sm text-slate-500">
              {asignacionesFiltradas.length} resultado
              {asignacionesFiltradas.length !== 1 ? "s" : ""}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <select
              value={filtroEmpresa}
              onChange={(e) =>
                setFiltroEmpresa(e.target.value ? Number(e.target.value) : "")
              }
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm outline-none focus:border-[#4E1743] focus:ring-2 focus:ring-[#4E1743]/20"
            >
              <option value="">Todas las empresas</option>
              {empresas.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.nombre}
                </option>
              ))}
            </select>

            <select
              value={filtroEstado}
              onChange={(e) =>
                setFiltroEstado(e.target.value as typeof filtroEstado)
              }
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm outline-none focus:border-[#4E1743] focus:ring-2 focus:ring-[#4E1743]/20"
            >
              <option value="todas">Todas</option>
              <option value="activas">Activas</option>
              <option value="vencidas">Vencidas</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead>
              <tr className="border-b text-slate-500">
                <th className="py-4">Trabajador</th>
                <th className="py-4">Empresa</th>
                <th className="py-4">Sucursal</th>
                <th className="py-4">Cargo</th>
                <th className="py-4">Inicio</th>
                <th className="py-4">Término</th>
                <th className="py-4">Estado</th>
                <th className="py-4 text-right">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {asignacionesFiltradas.map((a) => {
                const activa = esActiva(a);
                return (
                  <tr
                    key={a.id}
                    className="border-b transition hover:bg-slate-50 last:border-none"
                  >
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#4E1743]/10 text-xs font-black text-[#4E1743]">
                          {a.Trabajador.nombre.charAt(0)}
                          {a.Trabajador.apellido.charAt(0)}
                        </div>
                        <div>
                          <p className="font-black text-slate-900">
                            {a.Trabajador.apellido}, {a.Trabajador.nombre}
                          </p>
                          <p className="text-xs text-slate-400">{a.Trabajador.rut}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 font-semibold text-slate-700">
                      {a.Empresa.nombre}
                    </td>

                    <td className="py-4 text-slate-500">
                      {a.Sucursal?.nombre || (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>

                    <td className="py-4">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                        {a.Cargo.nombre}
                      </span>
                    </td>

                    <td className="py-4 text-slate-600">
                      {formatFecha(a.fechaInicio)}
                    </td>

                    <td className="py-4 text-slate-600">
                      {formatFecha(a.fechaFin)}
                    </td>

                    <td className="py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          activa
                            ? "bg-green-100 text-green-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {activa ? "Activa" : "Vencida"}
                      </span>
                    </td>

                    <td className="py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => editarAsignacion(a)}
                          className="rounded-xl bg-slate-100 px-4 py-2 font-bold text-slate-700 transition hover:bg-slate-200"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => eliminarAsignacion(a)}
                          className="rounded-xl bg-red-50 px-4 py-2 font-bold text-red-700 transition hover:bg-red-100"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {asignacionesFiltradas.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    {filtroEmpresa || filtroEstado !== "todas"
                      ? "No hay asignaciones con ese criterio."
                      : "No hay asignaciones registradas."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AsignacionModal
        open={modalOpen}
        loading={loading}
        editando={editando}
        form={form}
        trabajadores={trabajadores}
        empresas={empresas}
        cargos={cargos}
        onClose={cerrarModal}
        onChange={handleChange}
        onSubmit={handleSubmit}
      />
    </DashboardLayout>
  );
}
