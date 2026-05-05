import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import CrearCargoModal from "../components/cargos/CrearCargoModal";
import AsociarCargoModal from "../components/cargos/AsociarCargoModal";
import type { Empresa } from "../types/empresa";
import type { Cargo } from "../types/cargo";
import type { Tarifa } from "../types/tarifa";
import { listarEmpresasRequest } from "../services/empresa.service";
import { crearCargoRequest, listarCargosRequest } from "../services/cargo.service";
import {
  actualizarTarifaRequest,
  crearTarifaEmpresaRequest,
  eliminarTarifaRequest,
  listarTarifasPorEmpresaRequest,
} from "../services/tarifa.service";

const formatearCLP = (valor: number) => {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(valor);
};

export default function Cargos() {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [cargos, setCargos] = useState<Cargo[]>([]);
  const [empresaId, setEmpresaId] = useState<number | "">("");
  const [cargoId, setCargoId] = useState<number | null>(null);
  const [tarifas, setTarifas] = useState<Tarifa[]>([]);
  const [pagoPorHora, setPagoPorHora] = useState("");
  const [editando, setEditando] = useState<Tarifa | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingTarifas, setLoadingTarifas] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  const [modalCargoOpen, setModalCargoOpen] = useState(false);
  const [modalAsociarOpen, setModalAsociarOpen] = useState(false);
  const [nuevoCargo, setNuevoCargo] = useState("");

  const empresaSeleccionada = useMemo(() => {
    if (!empresaId) return null;
    return empresas.find((empresa) => empresa.id === Number(empresaId)) || null;
  }, [empresas, empresaId]);

  const opcionesCargos = useMemo(() => {
    return cargos.map((cargo) => ({
      value: cargo.id,
      label: cargo.nombre,
    }));
  }, [cargos]);

  const promedioTarifa = useMemo(() => {
    if (tarifas.length === 0) return 0;

    const total = tarifas.reduce(
      (acc, tarifa) => acc + Number(tarifa.pagoPorHora || 0),
      0
    );

    return Math.round(total / tarifas.length);
  }, [tarifas]);

  const cargarEmpresas = async () => {
    try {
      const data = await listarEmpresasRequest();
      setEmpresas(data);

      if (data.length > 0) {
        setEmpresaId(data[0].id);
      }
    } catch {
      setError("Error al cargar empresas");
    }
  };

  const cargarCargos = async () => {
    try {
      const data = await listarCargosRequest();
      setCargos(data);
    } catch {
      setError("Error al cargar cargos");
    }
  };

  const cargarTarifas = async (idEmpresa: number) => {
    try {
      setLoadingTarifas(true);
      const data = await listarTarifasPorEmpresaRequest(idEmpresa);
      setTarifas(data);
    } catch {
      setError("Error al cargar cargos de la empresa");
    } finally {
      setLoadingTarifas(false);
    }
  };

  useEffect(() => {
    cargarEmpresas();
    cargarCargos();
  }, []);

  useEffect(() => {
    if (empresaId) {
      cargarTarifas(Number(empresaId));
      limpiarFormulario();
      setMensaje("");
      setError("");
    }
  }, [empresaId]);

  const limpiarFormulario = () => {
    setCargoId(null);
    setPagoPorHora("");
    setEditando(null);
    setModalAsociarOpen(false);
  };

  const abrirAsociar = () => {
    setCargoId(null);
    setPagoPorHora("");
    setEditando(null);
    setMensaje("");
    setError("");
    setModalAsociarOpen(true);
  };

  const editarTarifa = (tarifa: Tarifa) => {
    setEditando(tarifa);
    setCargoId(tarifa.cargoId);
    setPagoPorHora(String(tarifa.pagoPorHora || ""));
    setMensaje("");
    setError("");
    setModalAsociarOpen(true);
  };

  const crearNuevoCargo = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!nuevoCargo.trim()) {
      setError("Debes ingresar el nombre del cargo");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setMensaje("");

      const response = await crearCargoRequest({
        nombre: nuevoCargo.trim(),
      });

      await cargarCargos();

      if (response.cargo?.id) {
        setCargoId(response.cargo.id);
      }

      setNuevoCargo("");
      setModalCargoOpen(false);
      setMensaje("Cargo creado correctamente");
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al crear cargo");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!empresaId) {
      setError("Debes seleccionar una empresa");
      return;
    }

    if (!cargoId) {
      setError("Debes seleccionar un cargo");
      return;
    }

    if (!pagoPorHora || Number(pagoPorHora) <= 0) {
      setError("Debes ingresar una tarifa por hora válida");
      return;
    }

    setLoading(true);
    setError("");
    setMensaje("");

    try {
      const data = {
        cargoId,
        pagoPorHora,
      };

      if (editando) {
        await actualizarTarifaRequest(editando.id, data);
        setMensaje("Tarifa actualizada correctamente");
      } else {
        await crearTarifaEmpresaRequest(Number(empresaId), data);
        setMensaje("Cargo agregado a la empresa correctamente");
      }

      limpiarFormulario();
      await cargarTarifas(Number(empresaId));
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al guardar cargo");
    } finally {
      setLoading(false);
    }
  };

  const eliminarTarifa = async (tarifa: Tarifa) => {
    const confirmar = confirm(
      `¿Eliminar el cargo ${tarifa.Cargo?.nombre || ""} de esta empresa?`
    );

    if (!confirmar || !empresaId) return;

    try {
      setError("");
      setMensaje("");
      await eliminarTarifaRequest(tarifa.id);
      setMensaje("Cargo eliminado de la empresa correctamente");
      await cargarTarifas(Number(empresaId));
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al eliminar cargo");
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-8 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="mb-2 text-sm font-bold uppercase tracking-wide text-[#4E1743]">
            Configuración operacional
          </p>
          <h2 className="text-3xl font-black text-slate-900">
            Cargos por empresa
          </h2>
          <p className="mt-2 max-w-2xl text-slate-500">
            Selecciona una empresa, elige un cargo global y define la tarifa por
            hora específica para esa empresa.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setModalCargoOpen(true)}
          className="rounded-2xl bg-[#4E1743] px-6 py-4 font-black text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-[#3d1235]"
        >
          Crear cargo global
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

      <div className="mb-6 grid grid-cols-1 gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-black text-slate-900">
                Selección de empresa
              </h3>
              <p className="text-sm text-slate-500">
                Cada empresa puede tener los mismos cargos con distintas tarifas.
              </p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#4E1743]/10 text-lg font-black text-[#4E1743]">
              {empresas.length}
            </div>
          </div>

          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Empresa cliente
          </label>

          <select
            value={empresaId}
            onChange={(e) =>
              setEmpresaId(e.target.value ? Number(e.target.value) : "")
            }
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-700 outline-none transition focus:border-[#4E1743] focus:ring-4 focus:ring-[#4E1743]/10"
          >
            <option value="">Selecciona una empresa</option>

            {empresas.map((empresa) => (
              <option key={empresa.id} value={empresa.id}>
                {empresa.nombre} {empresa.rut ? `- ${empresa.rut}` : ""}
              </option>
            ))}
          </select>

          {empresaSeleccionada && (
            <div className="mt-5 rounded-2xl bg-slate-50 p-5">
              <div className="flex items-center gap-4">
                {empresaSeleccionada.logoUrl ? (
                  <img
                    src={empresaSeleccionada.logoUrl}
                    alt={empresaSeleccionada.nombre}
                    className="h-14 w-14 rounded-2xl border bg-white object-contain p-1"
                  />
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#4E1743]/10 text-xl font-black text-[#4E1743]">
                    {empresaSeleccionada.nombre?.charAt(0)}
                  </div>
                )}

                <div>
                  <p className="text-lg font-black text-slate-900">
                    {empresaSeleccionada.nombre}
                  </p>
                  <p className="text-sm text-slate-500">
                    {empresaSeleccionada.razonSocial || "-"} ·{" "}
                    {empresaSeleccionada.rut || "-"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-bold text-slate-500">Cargos asociados</p>
            <p className="mt-3 text-4xl font-black text-slate-900">
              {tarifas.length}
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Configurados para la empresa seleccionada.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-bold text-slate-500">Tarifa promedio</p>
            <p className="mt-3 text-4xl font-black text-slate-900">
              {formatearCLP(promedioTarifa)}
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Promedio por hora de los cargos activos.
            </p>
          </div>
        </div>
      </div>

      {empresaSeleccionada && (
        <div className="mb-6 flex justify-end">
          <button
            type="button"
            onClick={abrirAsociar}
            className="rounded-2xl bg-[#4E1743] px-6 py-4 font-black text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-[#3d1235]"
          >
            Asociar cargo a empresa
          </button>
        </div>
      )}

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5">
          <h3 className="text-lg font-black text-slate-900">
            Cargos asociados
            {empresaSeleccionada ? ` a ${empresaSeleccionada.nombre}` : ""}
          </h3>
          <p className="text-sm text-slate-500">
            Lista de cargos configurados para la empresa seleccionada.
          </p>
        </div>

        {!empresaSeleccionada ? (
          <div className="rounded-2xl bg-slate-50 py-12 text-center text-slate-500">
            Selecciona una empresa para ver sus cargos.
          </div>
        ) : loadingTarifas ? (
          <div className="rounded-2xl bg-slate-50 py-12 text-center text-slate-500">
            Cargando cargos...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead>
                <tr className="border-b text-slate-500">
                  <th className="py-4">Cargo</th>
                  <th className="py-4">Tarifa por hora</th>
                  <th className="py-4">Estado</th>
                  <th className="py-4 text-right">Acciones</th>
                </tr>
              </thead>

              <tbody>
                {tarifas.map((tarifa) => (
                  <tr
                    key={tarifa.id}
                    className="border-b transition hover:bg-slate-50 last:border-none"
                  >
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#4E1743]/10 font-black text-[#4E1743]">
                          {tarifa.Cargo?.nombre?.charAt(0) || "C"}
                        </div>

                        <div>
                          <p className="font-black text-slate-900">
                            {tarifa.Cargo?.nombre || "-"}
                          </p>
                          <p className="text-xs text-slate-500">
                            ID tarifa #{tarifa.id}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-4">
                      <span className="rounded-full bg-slate-100 px-4 py-2 font-black text-slate-800">
                        {formatearCLP(tarifa.pagoPorHora)}
                      </span>
                    </td>

                    <td className="py-4">
                      <span className="rounded-full bg-green-50 px-4 py-2 text-xs font-black text-green-700">
                        Activo
                      </span>
                    </td>

                    <td className="py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => editarTarifa(tarifa)}
                          className="rounded-xl bg-slate-100 px-4 py-2 font-bold text-slate-700 transition hover:bg-slate-200"
                        >
                          Editar
                        </button>

                        <button
                          onClick={() => eliminarTarifa(tarifa)}
                          className="rounded-xl bg-red-50 px-4 py-2 font-bold text-red-700 transition hover:bg-red-100"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {tarifas.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-slate-500">
                      Esta empresa aún no tiene cargos asociados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AsociarCargoModal
        open={modalAsociarOpen}
        loading={loading}
        editando={!!editando}
        empresaNombre={empresaSeleccionada?.nombre}
        cargoId={cargoId}
        pagoPorHora={pagoPorHora}
        opcionesCargos={opcionesCargos}
        onClose={limpiarFormulario}
        onSubmit={handleSubmit}
        onCargoChange={setCargoId}
        onPagoChange={setPagoPorHora}
        onCrearCargo={() => setModalCargoOpen(true)}
      />

      <CrearCargoModal
        open={modalCargoOpen}
        loading={loading}
        nombre={nuevoCargo}
        onClose={() => {
          setNuevoCargo("");
          setModalCargoOpen(false);
        }}
        onChange={setNuevoCargo}
        onSubmit={crearNuevoCargo}
      />
    </DashboardLayout>
  );
}