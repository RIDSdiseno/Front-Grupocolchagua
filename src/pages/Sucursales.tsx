import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import EditarSucursalModal from "../components/sucursal/EditarSucursalModal";
import type { Sucursal } from "../types/sucursal";
import {
  listarTodasSucursalesRequest,
  actualizarSucursalRequest,
  eliminarSucursalRequest,
} from "../services/sucursal.service";
import { listarHoldingsRequest, type Holding } from "../services/Holding.service";

type EmpresaHoldingRelacion = {
  id: number;
  holdingId: number;
  empresaId: number;
  Holding: {
    id: number;
    nombre: string;
  };
};

type SucursalConEmpresa = Sucursal & {
  holdingId: number;
  Empresa: {
    id: number;
    nombre: string;
    holdings?: EmpresaHoldingRelacion[];
  };
  Holding?: {
    id: number;
    nombre: string;
  };
};

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
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [sucursales, setSucursales] = useState<SucursalConEmpresa[]>([]);
  const [holdingSeleccionado, setHoldingSeleccionado] = useState<number | "">("");
  const [empresaSeleccionada, setEmpresaSeleccionada] = useState<number | "">("");
  const [editando, setEditando] = useState<SucursalConEmpresa | null>(null);
  const [form, setForm] = useState<SucursalEditForm>(initialForm);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [filtroActivo, setFiltroActivo] =
    useState<"todas" | "activas" | "inactivas">("todas");
  const [recargar, setRecargar] = useState(0);

  useEffect(() => {
    let activo = true;

    void (async () => {
      try {
        const [holdingsData, sucursalesData] = await Promise.all([
          listarHoldingsRequest(),
          listarTodasSucursalesRequest(),
        ]);

        if (!activo) return;

        setHoldings(holdingsData);
        setSucursales(sucursalesData);

        setHoldingSeleccionado((prev) =>
          prev === "" && holdingsData.length > 0 ? holdingsData[0].id : prev
        );
      } catch {
        if (activo) setError("Error al cargar datos");
      }
    })();

    return () => {
      activo = false;
    };
  }, [recargar]);

  const recargarDatos = () => setRecargar((n) => n + 1);

  const perteneceAlHolding = (
    sucursal: SucursalConEmpresa,
    holdingId: number | ""
  ) => {
    if (!holdingId) return true;
    return sucursal.holdingId === Number(holdingId);
  };

  const empresasDelHolding = useMemo(() => {
    const map = new Map<number, string>();

    for (const sucursal of sucursales) {
      if (perteneceAlHolding(sucursal, holdingSeleccionado)) {
        map.set(sucursal.Empresa.id, sucursal.Empresa.nombre);
      }
    }

    return Array.from(map.entries()).map(([id, nombre]) => ({ id, nombre }));
  }, [sucursales, holdingSeleccionado]);

  const holdingActual = useMemo(() => {
    if (!holdingSeleccionado) return null;
    return holdings.find((h) => h.id === Number(holdingSeleccionado)) || null;
  }, [holdings, holdingSeleccionado]);

  const empresaActual = useMemo(() => {
    if (!empresaSeleccionada) return null;
    return (
      empresasDelHolding.find((e) => e.id === Number(empresaSeleccionada)) ||
      null
    );
  }, [empresasDelHolding, empresaSeleccionada]);

  const sucursalesFiltradas = useMemo(() => {
    return sucursales.filter((sucursal) => {
      const coincideHolding = perteneceAlHolding(sucursal, holdingSeleccionado);

      const coincideEmpresa =
        !empresaSeleccionada ||
        sucursal.Empresa.id === Number(empresaSeleccionada);

      const coincideActivo =
        filtroActivo === "todas" ||
        (filtroActivo === "activas" && sucursal.activo) ||
        (filtroActivo === "inactivas" && !sucursal.activo);

      return coincideHolding && coincideEmpresa && coincideActivo;
    });
  }, [sucursales, holdingSeleccionado, empresaSeleccionada, filtroActivo]);

  const totalActivas = useMemo(
    () => sucursalesFiltradas.filter((s) => s.activo).length,
    [sucursalesFiltradas]
  );

  const handleHoldingChange = (id: number) => {
    setHoldingSeleccionado(id);
    setEmpresaSeleccionada("");
    setMensaje("");
    setError("");
  };

  const abrirEditar = (sucursal: SucursalConEmpresa) => {
    setEditando(sucursal);
    setForm({
      nombre: sucursal.nombre,
      direccion: sucursal.direccion || "",
      comuna: sucursal.comuna || "",
      ciudad: sucursal.ciudad || "",
      activo: sucursal.activo,
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

  const obtenerMensajeError = (err: unknown, fallback: string) => {
    return (
      (err as { response?: { data?: { message?: string } } })?.response?.data
        ?.message || fallback
    );
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
      recargarDatos();
    } catch (err: unknown) {
      setError(obtenerMensajeError(err, "Error al actualizar sucursal"));
    } finally {
      setLoading(false);
    }
  };

  const eliminarSucursal = async (sucursal: SucursalConEmpresa) => {
    const confirmar = confirm(
      `¿Eliminar la sucursal "${sucursal.nombre}" de ${sucursal.Empresa.nombre}? Esta acción no se puede deshacer.`
    );

    if (!confirmar) return;

    try {
      await eliminarSucursalRequest(sucursal.id);
      setMensaje("Sucursal eliminada correctamente");
      recargarDatos();
    } catch (err: unknown) {
      setError(obtenerMensajeError(err, "Error al eliminar sucursal"));
    }
  };

  const toggleActivo = async (sucursal: SucursalConEmpresa) => {
    try {
      await actualizarSucursalRequest(sucursal.id, {
        activo: !sucursal.activo,
      });
      recargarDatos();
    } catch (err: unknown) {
      setError(obtenerMensajeError(err, "Error al cambiar estado"));
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

      <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-base font-black text-slate-900">
          Grupo empresarial
        </h3>

        <div className="flex flex-wrap gap-3">
          {holdings.map((h) => (
            <button
              key={h.id}
              type="button"
              onClick={() => handleHoldingChange(h.id)}
              className={`rounded-2xl px-6 py-3 font-bold transition ${
                holdingSeleccionado === h.id
                  ? "bg-[#4E1743] text-white shadow-lg"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {h.nombre}
            </button>
          ))}

          <button
            type="button"
            onClick={() => {
              setHoldingSeleccionado("");
              setEmpresaSeleccionada("");
            }}
            className={`rounded-2xl px-6 py-3 font-bold transition ${
              holdingSeleccionado === ""
                ? "bg-[#4E1743] text-white shadow-lg"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Todas
          </button>
        </div>

        {holdingSeleccionado !== "" && (
          <div className="mt-5 border-t pt-5">
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Empresa
              {holdingActual && (
                <span className="ml-1 text-[#4E1743]">
                  · {holdingActual.nombre}
                </span>
              )}
            </label>

            {empresasDelHolding.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-500">
                No hay empresas con sucursales en este holding.
              </div>
            ) : (
              <select
                value={empresaSeleccionada}
                onChange={(e) =>
                  setEmpresaSeleccionada(
                    e.target.value ? Number(e.target.value) : ""
                  )
                }
                className="w-full max-w-sm rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-[#4E1743] focus:ring-4 focus:ring-[#4E1743]/10"
              >
                <option value="">Todas las empresas</option>
                {empresasDelHolding.map((empresa) => (
                  <option key={empresa.id} value={empresa.id}>
                    {empresa.nombre}
                  </option>
                ))}
              </select>
            )}
          </div>
        )}
      </div>

      <div className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-bold text-slate-500">Total sucursales</p>
          <p className="mt-3 text-4xl font-black text-slate-900">
            {sucursalesFiltradas.length}
          </p>
          <p className="mt-2 text-sm text-slate-500">
            {empresaActual
              ? `En ${empresaActual.nombre}`
              : holdingActual
              ? `En ${holdingActual.nombre}`
              : "Registradas en el sistema."}
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-bold text-slate-500">Activas</p>
          <p className="mt-3 text-4xl font-black text-slate-900">
            {totalActivas}
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Disponibles para asignación.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-[#4E1743] p-6 text-white shadow-sm">
          <p className="text-sm font-bold text-white/70">Empresas</p>
          <p className="mt-3 text-4xl font-black">
            {empresasDelHolding.length}
          </p>
          <p className="mt-2 text-sm text-white/70">
            Con sucursales registradas.
          </p>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-black text-slate-900">
              {empresaActual
                ? `Sucursales de ${empresaActual.nombre}`
                : holdingActual
                ? `Sucursales de ${holdingActual.nombre}`
                : "Listado de sucursales"}
            </h3>
            <p className="text-sm text-slate-500">
              {sucursalesFiltradas.length} resultado
              {sucursalesFiltradas.length !== 1 ? "s" : ""}
            </p>
          </div>

          <select
            value={filtroActivo}
            onChange={(e) =>
              setFiltroActivo(e.target.value as typeof filtroActivo)
            }
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm outline-none focus:border-[#4E1743] focus:ring-2 focus:ring-[#4E1743]/20"
          >
            <option value="todas">Todas</option>
            <option value="activas">Activas</option>
            <option value="inactivas">Inactivas</option>
          </select>
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
              {sucursalesFiltradas.map((sucursal) => (
                <tr
                  key={sucursal.id}
                  className="border-b transition hover:bg-slate-50 last:border-none"
                >
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#4E1743]/10 text-sm font-black text-[#4E1743]">
                        {sucursal.nombre.charAt(0)}
                      </div>

                      <div>
                        <p className="font-black text-slate-900">
                          {sucursal.nombre}
                        </p>
                        <p className="text-xs text-slate-400">
                          ID #{sucursal.id}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="py-4 font-semibold text-slate-700">
                    {sucursal.Empresa.nombre}
                  </td>

                  <td className="py-4 text-slate-500">
                    {sucursal.direccion || (
                      <span className="text-slate-300">—</span>
                    )}
                  </td>

                  <td className="py-4 text-slate-500">
                    {sucursal.comuna || sucursal.ciudad ? (
                      [sucursal.comuna, sucursal.ciudad]
                        .filter(Boolean)
                        .join(", ")
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </td>

                  <td className="py-4">
                    <button
                      type="button"
                      onClick={() => toggleActivo(sucursal)}
                      title="Clic para cambiar estado"
                      className={`rounded-full px-3 py-1 text-xs font-bold transition hover:opacity-75 ${
                        sucursal.activo
                          ? "bg-green-100 text-green-700"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {sucursal.activo ? "Activa" : "Inactiva"}
                    </button>
                  </td>

                  <td className="py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => abrirEditar(sucursal)}
                        className="rounded-xl bg-slate-100 px-4 py-2 font-bold text-slate-700 transition hover:bg-slate-200"
                      >
                        Editar
                      </button>

                      <button
                        type="button"
                        onClick={() => eliminarSucursal(sucursal)}
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
                    {empresaActual
                      ? `No hay sucursales en ${empresaActual.nombre}.`
                      : holdingActual
                      ? `No hay sucursales en ${holdingActual.nombre}.`
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