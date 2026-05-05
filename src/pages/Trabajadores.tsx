import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import TrabajadorModal from "../components/trabajadores/TrabajadorModal";
import type { Trabajador, TrabajadorForm } from "../types/trabajador";
import {
  listarTrabajadoresRequest,
  crearTrabajadorRequest,
  actualizarTrabajadorRequest,
  eliminarTrabajadorRequest,
} from "../services/trabajador.service";

const initialForm: TrabajadorForm = {
  nombre: "",
  apellido: "",
  rut: "",
  telefono: "",
  email: "",
  activo: true,
};

export default function Trabajadores() {
  const [trabajadores, setTrabajadores] = useState<Trabajador[]>([]);
  const [form, setForm] = useState<TrabajadorForm>(initialForm);
  const [editando, setEditando] = useState<Trabajador | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [filtroActivo, setFiltroActivo] = useState<"todos" | "activos" | "inactivos">("todos");

  const cargarTrabajadores = async () => {
    try {
      const data = await listarTrabajadoresRequest();
      setTrabajadores(data);
    } catch {
      setError("Error al cargar trabajadores");
    }
  };

  useEffect(() => {
    cargarTrabajadores();
  }, []);

  const trabajadoresFiltrados = useMemo(() => {
    return trabajadores.filter((t) => {
      const coincideBusqueda =
        !busqueda ||
        t.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        t.apellido.toLowerCase().includes(busqueda.toLowerCase()) ||
        t.rut.toLowerCase().includes(busqueda.toLowerCase());

      const coincideActivo =
        filtroActivo === "todos" ||
        (filtroActivo === "activos" && t.activo) ||
        (filtroActivo === "inactivos" && !t.activo);

      return coincideBusqueda && coincideActivo;
    });
  }, [trabajadores, busqueda, filtroActivo]);

  const totalActivos = useMemo(
    () => trabajadores.filter((t) => t.activo).length,
    [trabajadores]
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

  const editarTrabajador = (t: Trabajador) => {
    setEditando(t);
    setForm({
      nombre: t.nombre,
      apellido: t.apellido,
      rut: t.rut,
      telefono: t.telefono || "",
      email: t.email || "",
      activo: t.activo,
    });
    setMensaje("");
    setError("");
    setModalOpen(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMensaje("");

    try {
      if (editando) {
        await actualizarTrabajadorRequest(editando.id, form);
        setMensaje("Trabajador actualizado correctamente");
      } else {
        await crearTrabajadorRequest(form);
        setMensaje("Trabajador creado correctamente");
      }
      cerrarModal();
      await cargarTrabajadores();
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al guardar trabajador");
    } finally {
      setLoading(false);
    }
  };

  const eliminarTrabajador = async (t: Trabajador) => {
    const confirmar = confirm(
      `¿Eliminar a ${t.nombre} ${t.apellido}? Esta acción no se puede deshacer.`
    );
    if (!confirmar) return;

    try {
      await eliminarTrabajadorRequest(t.id);
      setMensaje("Trabajador eliminado correctamente");
      await cargarTrabajadores();
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al eliminar trabajador");
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-8 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="mb-2 text-sm font-bold uppercase tracking-wide text-[#4E1743]">
            Gestión de personal
          </p>
          <h2 className="text-3xl font-black text-slate-900">Trabajadores</h2>
          <p className="mt-2 max-w-2xl text-slate-500">
            Administra el registro de trabajadores disponibles para asignación.
          </p>
        </div>

        <button
          onClick={abrirCrear}
          className="rounded-2xl bg-[#4E1743] px-6 py-4 font-black text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-[#3d1235]"
        >
          Nuevo trabajador
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
          <p className="text-sm font-bold text-slate-500">Total registrados</p>
          <p className="mt-3 text-4xl font-black text-slate-900">
            {trabajadores.length}
          </p>
          <p className="mt-2 text-sm text-slate-500">Trabajadores en el sistema.</p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-bold text-slate-500">Activos</p>
          <p className="mt-3 text-4xl font-black text-slate-900">{totalActivos}</p>
          <p className="mt-2 text-sm text-slate-500">Disponibles para asignación.</p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-[#4E1743] p-6 text-white shadow-sm">
          <p className="text-sm font-bold text-white/70">Inactivos</p>
          <p className="mt-3 text-4xl font-black">
            {trabajadores.length - totalActivos}
          </p>
          <p className="mt-2 text-sm text-white/70">
            Sin asignación activa actualmente.
          </p>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-black text-slate-900">
              Listado de trabajadores
            </h3>
            <p className="text-sm text-slate-500">
              {trabajadoresFiltrados.length} resultado
              {trabajadoresFiltrados.length !== 1 ? "s" : ""}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              type="text"
              placeholder="Buscar por nombre o RUT..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm outline-none focus:border-[#4E1743] focus:ring-2 focus:ring-[#4E1743]/20"
            />

            <select
              value={filtroActivo}
              onChange={(e) =>
                setFiltroActivo(e.target.value as typeof filtroActivo)
              }
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm outline-none focus:border-[#4E1743] focus:ring-2 focus:ring-[#4E1743]/20"
            >
              <option value="todos">Todos</option>
              <option value="activos">Activos</option>
              <option value="inactivos">Inactivos</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead>
              <tr className="border-b text-slate-500">
                <th className="py-4">Trabajador</th>
                <th className="py-4">RUT</th>
                <th className="py-4">Teléfono</th>
                <th className="py-4">Correo</th>
                <th className="py-4">Estado</th>
                <th className="py-4 text-right">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {trabajadoresFiltrados.map((t) => (
                <tr
                  key={t.id}
                  className="border-b transition hover:bg-slate-50 last:border-none"
                >
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#4E1743]/10 text-sm font-black text-[#4E1743]">
                        {t.nombre.charAt(0)}
                        {t.apellido.charAt(0)}
                      </div>
                      <div>
                        <p className="font-black text-slate-900">
                          {t.apellido}, {t.nombre}
                        </p>
                        <p className="text-xs text-slate-500">ID #{t.id}</p>
                      </div>
                    </div>
                  </td>

                  <td className="py-4">
                    <span className="rounded-full bg-slate-100 px-4 py-2 font-bold text-slate-700">
                      {t.rut}
                    </span>
                  </td>

                  <td className="py-4 text-slate-600">{t.telefono || "-"}</td>

                  <td className="py-4 text-slate-600">{t.email || "-"}</td>

                  <td className="py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        t.activo
                          ? "bg-green-100 text-green-700"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {t.activo ? "Activo" : "Inactivo"}
                    </span>
                  </td>

                  <td className="py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => editarTrabajador(t)}
                        className="rounded-xl bg-slate-100 px-4 py-2 font-bold text-slate-700 transition hover:bg-slate-200"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => eliminarTrabajador(t)}
                        className="rounded-xl bg-red-50 px-4 py-2 font-bold text-red-700 transition hover:bg-red-100"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {trabajadoresFiltrados.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    {busqueda || filtroActivo !== "todos"
                      ? "No se encontraron trabajadores con ese criterio."
                      : "No hay trabajadores registrados."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <TrabajadorModal
        open={modalOpen}
        loading={loading}
        editando={editando}
        form={form}
        onClose={cerrarModal}
        onChange={handleChange}
        onSubmit={handleSubmit}
      />
    </DashboardLayout>
  );
}
