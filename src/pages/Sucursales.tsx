import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import EditarSucursalModal from "../components/sucursal/EditarSucursalModal";
import type { Sucursal } from "../types/sucursal";
import {
  listarTodasSucursalesRequest,
  actualizarSucursalRequest,
  eliminarSucursalRequest,
} from "../services/sucursal.service";

type SucursalConEmpresa = Sucursal & { Empresa: { id: number; nombre: string } };

interface SucursalEditForm {
  nombre: string;
  direccion: string;
  comuna: string;
  ciudad: string;
  activo: boolean;
}

const initialForm: SucursalEditForm = {
  nombre: "",
  direccion: "",
  comuna: "",
  ciudad: "",
  activo: true,
};

export default function Sucursales() {
  const [sucursales, setSucursales] = useState<SucursalConEmpresa[]>([]);
  const [editando, setEditando] = useState<SucursalConEmpresa | null>(null);
  const [form, setForm] = useState<SucursalEditForm>(initialForm);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [filtroEmpresa, setFiltroEmpresa] = useState<number | "">("");
  const [filtroActivo, setFiltroActivo] = useState<"todas" | "activas" | "inactivas">("todas");

  const cargarSucursales = async () => {
    try {
      const data = await listarTodasSucursalesRequest();
      setSucursales(data);
    } catch {
      setError("Error al cargar sucursales");
    }
  };

  useEffect(() => {
    cargarSucursales();
  }, []);

  // Empresas únicas para el filtro
  const empresas = useMemo(() => {
    const map = new Map<number, string>();
    for (const s of sucursales) {
      map.set(s.Empresa.id, s.Empresa.nombre);
    }
    return Array.from(map.entries()).map(([id, nombre]) => ({ id, nombre }));
  }, [sucursales]);

  const sucursalesFiltradas = useMemo(() => {
    return sucursales.filter((s) => {
      const coincideEmpresa = !filtroEmpresa || s.Empresa.id === filtroEmpresa;
      const coincideActivo =
        filtroActivo === "todas" ||
        (filtroActivo === "activas" && s.activo) ||
        (filtroActivo === "inactivas" && !s.activo);
      return coincideEmpresa && coincideActivo;
    });
  }, [sucursales, filtroEmpresa, filtroActivo]);

  const totalActivas = useMemo(() => sucursales.filter((s) => s.activo).length, [sucursales]);

  const abrirEditar = (s: SucursalConEmpresa) => {
    setEditando(s);
    setForm({
      nombre: s.nombre,
      direccion: s.direccion || "",
      comuna: s.comuna || "",
      ciudad: s.ciudad || "",
      activo: s.activo,
    });
    setMensaje("");
    setError("");
    setModalOpen(true);
  };

  const cerrarModal = () => {
    setEditando(null);
    setForm(initialForm);
    setModalOpen(false);
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
    if (!editando) return;
    setLoading(true);
    setError("");
    setMensaje("");

    try {
      await actualizarSucursalRequest(editando.id, form);
      setMensaje("Sucursal actualizada correctamente");
      cerrarModal();
      await cargarSucursales();
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al actualizar sucursal");
    } finally {
      setLoading(false);
    }
  };

  const eliminarSucursal = async (s: SucursalConEmpresa) => {
    const confirmar = confirm(
      `¿Eliminar la sucursal "${s.nombre}" de ${s.Empresa.nombre}? Esta acción no se puede deshacer.`
    );
    if (!confirmar) return;

    try {
      await eliminarSucursalRequest(s.id);
      setMensaje("Sucursal eliminada correctamente");
      await cargarSucursales();
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al eliminar sucursal");
    }
  };

  const toggleActivo = async (s: SucursalConEmpresa) => {
    try {
      await actualizarSucursalRequest(s.id, { activo: !s.activo });
      await cargarSucursales();
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al cambiar estado");
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-8 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="mb-2 text-sm font-bold uppercase tracking-wide text-[#4E1743]">
            Gestión de ubicaciones
          </p>
          <h2 className="text-3xl font-black text-slate-900">Sucursales</h2>
          <p className="mt-2 max-w-2xl text-slate-500">
            Administra las sucursales de cada empresa cliente.
          </p>
        </div>
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

      {/* Cards */}
      <div className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-bold text-slate-500">Total sucursales</p>
          <p className="mt-3 text-4xl font-black text-slate-900">{sucursales.length}</p>
          <p className="mt-2 text-sm text-slate-500">Registradas en el sistema.</p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-bold text-slate-500">Activas</p>
          <p className="mt-3 text-4xl font-black text-slate-900">{totalActivas}</p>
          <p className="mt-2 text-sm text-slate-500">Disponibles para asignación.</p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-[#4E1743] p-6 text-white shadow-sm">
          <p className="text-sm font-bold text-white/70">Empresas</p>
          <p className="mt-3 text-4xl font-black">{empresas.length}</p>
          <p className="mt-2 text-sm text-white/70">Con sucursales registradas.</p>
        </div>
      </div>

      {/* Tabla */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-black text-slate-900">Listado de sucursales</h3>
            <p className="text-sm text-slate-500">
              {sucursalesFiltradas.length} resultado{sucursalesFiltradas.length !== 1 ? "s" : ""}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <select
              value={filtroEmpresa}
              onChange={(e) => setFiltroEmpresa(e.target.value ? Number(e.target.value) : "")}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm outline-none focus:border-[#4E1743] focus:ring-2 focus:ring-[#4E1743]/20"
            >
              <option value="">Todas las empresas</option>
              {empresas.map((e) => (
                <option key={e.id} value={e.id}>{e.nombre}</option>
              ))}
            </select>

            <select
              value={filtroActivo}
              onChange={(e) => setFiltroActivo(e.target.value as typeof filtroActivo)}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm outline-none focus:border-[#4E1743] focus:ring-2 focus:ring-[#4E1743]/20"
            >
              <option value="todas">Todas</option>
              <option value="activas">Activas</option>
              <option value="inactivas">Inactivas</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead>
              <tr className="border-b text-slate-500">
                <th className="py-4">Sucursal</th>
                <th className="py-4">Empresa</th>
                <th className="py-4">Dirección</th>
                <th className="py-4">Comuna / Ciudad</th>
                <th className="py-4">Estado</th>
                <th className="py-4 text-right">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {sucursalesFiltradas.map((s) => (
                <tr
                  key={s.id}
                  className="border-b transition hover:bg-slate-50 last:border-none"
                >
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#4E1743]/10 text-sm font-black text-[#4E1743]">
                        {s.nombre.charAt(0)}
                      </div>
                      <div>
                        <p className="font-black text-slate-900">{s.nombre}</p>
                        <p className="text-xs text-slate-400">ID #{s.id}</p>
                      </div>
                    </div>
                  </td>

                  <td className="py-4 font-semibold text-slate-700">
                    {s.Empresa.nombre}
                  </td>

                  <td className="py-4 text-slate-500">
                    {s.direccion || <span className="text-slate-300">—</span>}
                  </td>

                  <td className="py-4 text-slate-500">
                    {s.comuna || s.ciudad
                      ? [s.comuna, s.ciudad].filter(Boolean).join(", ")
                      : <span className="text-slate-300">—</span>}
                  </td>

                  <td className="py-4">
                    <button
                      onClick={() => toggleActivo(s)}
                      title="Clic para cambiar estado"
                      className={`rounded-full px-3 py-1 text-xs font-bold transition hover:opacity-75 ${
                        s.activo
                          ? "bg-green-100 text-green-700"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {s.activo ? "Activa" : "Inactiva"}
                    </button>
                  </td>

                  <td className="py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => abrirEditar(s)}
                        className="rounded-xl bg-slate-100 px-4 py-2 font-bold text-slate-700 transition hover:bg-slate-200"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => eliminarSucursal(s)}
                        className="rounded-xl bg-red-50 px-4 py-2 font-bold text-red-700 transition hover:bg-red-100"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {sucursalesFiltradas.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    {filtroEmpresa || filtroActivo !== "todas"
                      ? "No hay sucursales con ese criterio."
                      : "No hay sucursales registradas."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editando && (
        <EditarSucursalModal
          open={modalOpen}
          loading={loading}
          sucursal={editando}
          form={form}
          onClose={cerrarModal}
          onChange={handleChange}
          onSubmit={handleSubmit}
        />
      )}
    </DashboardLayout>
  );
}
