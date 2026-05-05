import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import CrearCargoModal from "../components/cargos/CrearCargoModal";
import AsociarCargoModal from "../components/cargos/AsociarCargoModal";
import CrearSucursalModal from "../components/sucursal/CrearSucursalModal";
import type { Empresa } from "../types/empresa";
import type { Cargo } from "../types/cargo";
import type { Tarifa, TarifaForm } from "../types/tarifa";
import type { Sucursal, SucursalForm } from "../types/sucursal";
import { listarEmpresasRequest } from "../services/empresa.service";
import { crearCargoRequest, listarCargosRequest } from "../services/cargo.service";
import {
  listarSucursalesPorEmpresaRequest,
  crearSucursalRequest,
} from "../services/sucursal.service";
import {
  actualizarTarifaRequest,
  crearTarifaEmpresaRequest,
  eliminarTarifaRequest,
  listarTarifasPorEmpresaRequest,
} from "../services/tarifa.service";

const formatearCLP = (valor: number) =>
  new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(valor);

const obtenerMensajeError = (err: unknown, fallback: string) => {
  if (
    typeof err === "object" &&
    err !== null &&
    "response" in err &&
    typeof (err as { response?: { data?: { message?: unknown } } }).response
      ?.data?.message === "string"
  ) {
    return (err as { response: { data: { message: string } } }).response.data
      .message;
  }

  return fallback;
};

const formSucursalInicial: SucursalForm = {
  nombre: "",
  direccion: "",
  comuna: "",
  ciudad: "",
};

const tarifaFormInicial: TarifaForm = {
  sucursalId: "",
  cargoId: "",
  sueldoBase: "",
  bonoColacion: "",
  bonoLocomocion: "",
  bonoAsistencia: "",
  bonoNoche: "",
  otrosBonos: "",
  valorHoraExtra: "",
};

const calcularTotalMensual = (tarifa: Tarifa) => {
  return (
    Number(tarifa.sueldoBase || 0) +
    Number(tarifa.bonoColacion || 0) +
    Number(tarifa.bonoLocomocion || 0) +
    Number(tarifa.bonoAsistencia || 0) +
    Number(tarifa.bonoNoche || 0) +
    Number(tarifa.otrosBonos || 0)
  );
};

const calcularTotalBonos = (tarifa: Tarifa) => {
  return (
    Number(tarifa.bonoColacion || 0) +
    Number(tarifa.bonoLocomocion || 0) +
    Number(tarifa.bonoAsistencia || 0) +
    Number(tarifa.bonoNoche || 0) +
    Number(tarifa.otrosBonos || 0)
  );
};

export default function Cargos() {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [cargos, setCargos] = useState<Cargo[]>([]);
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [empresaId, setEmpresaId] = useState<number | "">("");
  const [tarifas, setTarifas] = useState<Tarifa[]>([]);
  const [tarifaForm, setTarifaForm] = useState<TarifaForm>(tarifaFormInicial);

  const [editando, setEditando] = useState<Tarifa | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingTarifas, setLoadingTarifas] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  const [modalCargoOpen, setModalCargoOpen] = useState(false);
  const [modalAsociarOpen, setModalAsociarOpen] = useState(false);
  const [modalSucursalOpen, setModalSucursalOpen] = useState(false);
  const [nuevoCargo, setNuevoCargo] = useState("");
  const [formSucursal, setFormSucursal] =
    useState<SucursalForm>(formSucursalInicial);

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

  const opcionesSucursales = useMemo(() => {
    return sucursales.map((sucursal) => ({
      value: sucursal.id,
      label: sucursal.nombre,
    }));
  }, [sucursales]);

  const promedioSueldoBase = useMemo(() => {
    if (tarifas.length === 0) return 0;

    const total = tarifas.reduce(
      (acc, tarifa) => acc + Number(tarifa.sueldoBase || 0),
      0
    );

    return Math.round(total / tarifas.length);
  }, [tarifas]);

  const promedioTotalMensual = useMemo(() => {
    if (tarifas.length === 0) return 0;

    const total = tarifas.reduce(
      (acc, tarifa) => acc + calcularTotalMensual(tarifa),
      0
    );

    return Math.round(total / tarifas.length);
  }, [tarifas]);

  useEffect(() => {
    let activo = true;

    void (async () => {
      try {
        const [empresasData, cargosData] = await Promise.all([
          listarEmpresasRequest(),
          listarCargosRequest(),
        ]);

        if (!activo) return;

        setEmpresas(empresasData);
        setCargos(cargosData);

        if (empresasData.length > 0) {
          setEmpresaId(empresasData[0].id);
        }
      } catch {
        if (activo) {
          setError("Error al cargar datos iniciales");
        }
      }
    })();

    return () => {
      activo = false;
    };
  }, []);

  useEffect(() => {
    if (!empresaId) return;

    let activo = true;

    void (async () => {
      try {
        setLoadingTarifas(true);

        const [tarifasData, sucursalesData] = await Promise.all([
          listarTarifasPorEmpresaRequest(Number(empresaId)),
          listarSucursalesPorEmpresaRequest(Number(empresaId)),
        ]);

        if (!activo) return;

        setTarifas(tarifasData);
        setSucursales(sucursalesData);
      } catch {
        if (activo) {
          setError("Error al cargar datos de la empresa");
          setTarifas([]);
          setSucursales([]);
        }
      } finally {
        if (activo) {
          setLoadingTarifas(false);
        }
      }
    })();

    return () => {
      activo = false;
    };
  }, [empresaId]);

  const cargarCargos = async () => {
    const data = await listarCargosRequest();
    setCargos(data);
  };

  const cargarSucursales = async (idEmpresa: number) => {
    const data = await listarSucursalesPorEmpresaRequest(idEmpresa);
    setSucursales(data);
  };

  const cargarTarifas = async (idEmpresa: number) => {
    setLoadingTarifas(true);

    try {
      const data = await listarTarifasPorEmpresaRequest(idEmpresa);
      setTarifas(data);
    } finally {
      setLoadingTarifas(false);
    }
  };

  const limpiarFormulario = () => {
    setTarifaForm(tarifaFormInicial);
    setEditando(null);
    setModalAsociarOpen(false);
  };

  const handleEmpresaChange = (value: string) => {
    setEmpresaId(value ? Number(value) : "");
    setTarifaForm(tarifaFormInicial);
    setEditando(null);
    setMensaje("");
    setError("");
  };

  const abrirAsociar = () => {
    setTarifaForm(tarifaFormInicial);
    setEditando(null);
    setMensaje("");
    setError("");
    setModalAsociarOpen(true);
  };

  const editarTarifa = (tarifa: Tarifa) => {
    setEditando(tarifa);

    setTarifaForm({
      sucursalId: tarifa.sucursalId,
      cargoId: tarifa.cargoId,
      sueldoBase: String(tarifa.sueldoBase || ""),
      bonoColacion: String(tarifa.bonoColacion || ""),
      bonoLocomocion: String(tarifa.bonoLocomocion || ""),
      bonoAsistencia: String(tarifa.bonoAsistencia || ""),
      bonoNoche: String(tarifa.bonoNoche || ""),
      otrosBonos: String(tarifa.otrosBonos || ""),
      valorHoraExtra: String(tarifa.valorHoraExtra || ""),
    });

    setMensaje("");
    setError("");
    setModalAsociarOpen(true);
  };

  const handleTarifaChange = (
    field: keyof TarifaForm,
    value: string | number | ""
  ) => {
    setTarifaForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSucursalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormSucursal((prev) => ({
      ...prev,
      [name]: value,
    }));
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

      const response = await crearCargoRequest({ nombre: nuevoCargo.trim() });

      await cargarCargos();

      if (response.cargo?.id) {
        setTarifaForm((prev) => ({
          ...prev,
          cargoId: response.cargo.id,
        }));
      }

      setNuevoCargo("");
      setModalCargoOpen(false);
      setMensaje("Cargo creado correctamente");
    } catch (err: unknown) {
      setError(obtenerMensajeError(err, "Error al crear cargo"));
    } finally {
      setLoading(false);
    }
  };

  const crearNuevaSucursal = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!empresaId) {
      setError("Debes seleccionar una empresa");
      return;
    }

    if (!formSucursal.nombre.trim()) {
      setError("Debes ingresar el nombre de la sucursal");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setMensaje("");

      const response = await crearSucursalRequest(
        Number(empresaId),
        formSucursal
      );

      await cargarSucursales(Number(empresaId));

      if (response.sucursal?.id) {
        setTarifaForm((prev) => ({
          ...prev,
          sucursalId: response.sucursal.id,
        }));
      }

      setFormSucursal(formSucursalInicial);
      setModalSucursalOpen(false);
      setMensaje("Sucursal creada correctamente");
    } catch (err: unknown) {
      setError(obtenerMensajeError(err, "Error al crear sucursal"));
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

    if (!tarifaForm.sucursalId) {
      setError("Debes seleccionar una sucursal");
      return;
    }

    if (!tarifaForm.cargoId) {
      setError("Debes seleccionar un cargo");
      return;
    }

    if (!tarifaForm.sueldoBase || Number(tarifaForm.sueldoBase) <= 0) {
      setError("Debes ingresar un sueldo base válido");
      return;
    }

    setLoading(true);
    setError("");
    setMensaje("");

    try {
      if (editando) {
        await actualizarTarifaRequest(editando.id, tarifaForm);
        setMensaje("Tarifa actualizada correctamente");
      } else {
        await crearTarifaEmpresaRequest(Number(empresaId), tarifaForm);
        setMensaje("Tarifa creada correctamente");
      }

      limpiarFormulario();
      await cargarTarifas(Number(empresaId));
    } catch (err: unknown) {
      setError(obtenerMensajeError(err, "Error al guardar tarifa"));
    } finally {
      setLoading(false);
    }
  };

  const eliminarTarifa = async (tarifa: Tarifa) => {
    const confirmar = confirm(
      `¿Eliminar la tarifa de ${tarifa.Cargo?.nombre || "este cargo"} en ${
        tarifa.Sucursal?.nombre || "esta sucursal"
      }?`
    );

    if (!confirmar || !empresaId) return;

    try {
      setError("");
      setMensaje("");

      await eliminarTarifaRequest(tarifa.id);

      setMensaje("Tarifa eliminada correctamente");
      await cargarTarifas(Number(empresaId));
    } catch (err: unknown) {
      setError(obtenerMensajeError(err, "Error al eliminar tarifa"));
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-6 flex flex-col gap-4 sm:mb-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-[#4E1743] sm:text-sm">
            Configuración operacional
          </p>

          <h2 className="text-2xl font-black text-slate-900 sm:text-3xl">
            Tarifas por sucursal
          </h2>

          <p className="mt-2 max-w-2xl text-sm text-slate-500 sm:text-base">
            Define sueldo base, bonos y valor de hora extra según empresa,
            sucursal y cargo.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setModalCargoOpen(true)}
          className="w-full rounded-2xl bg-[#4E1743] px-5 py-3 text-sm font-black text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-[#3d1235] sm:w-auto sm:px-6 sm:py-4 sm:text-base"
        >
          Crear cargo global
        </button>
      </div>

      {mensaje && (
        <div className="mb-5 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700 sm:px-5 sm:py-4">
          {mensaje}
        </div>
      )}

      {error && (
        <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 sm:px-5 sm:py-4">
          {error}
        </div>
      )}

      <div className="mb-6 grid grid-cols-1 gap-4 xl:grid-cols-[1.1fr_0.9fr] xl:gap-5">
        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-base font-black text-slate-900 sm:text-lg">
                Selección de empresa
              </h3>

              <p className="text-sm text-slate-500">
                Las tarifas se configuran por sucursal y cargo.
              </p>
            </div>

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#4E1743]/10 text-base font-black text-[#4E1743] sm:h-12 sm:w-12 sm:text-lg">
              {empresas.length}
            </div>
          </div>

          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Empresa cliente
          </label>

          <select
            value={empresaId}
            onChange={(e) => handleEmpresaChange(e.target.value)}
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-[#4E1743] focus:ring-4 focus:ring-[#4E1743]/10 sm:text-base"
          >
            <option value="">Selecciona una empresa</option>

            {empresas.map((empresa) => (
              <option key={empresa.id} value={empresa.id}>
                {empresa.nombre} {empresa.rut ? `- ${empresa.rut}` : ""}
              </option>
            ))}
          </select>

          {empresaSeleccionada && (
            <div className="mt-5 rounded-2xl bg-slate-50 p-4 sm:p-5">
              <div className="flex items-center gap-3 sm:gap-4">
                {empresaSeleccionada.logoUrl ? (
                  <img
                    src={empresaSeleccionada.logoUrl}
                    alt={empresaSeleccionada.nombre}
                    className="h-12 w-12 rounded-2xl border bg-white object-contain p-1 sm:h-14 sm:w-14"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#4E1743]/10 text-lg font-black text-[#4E1743] sm:h-14 sm:w-14 sm:text-xl">
                    {empresaSeleccionada.nombre?.charAt(0)}
                  </div>
                )}

                <div className="min-w-0">
                  <p className="truncate text-base font-black text-slate-900 sm:text-lg">
                    {empresaSeleccionada.nombre}
                  </p>

                  <p className="truncate text-xs text-slate-500 sm:text-sm">
                    {empresaSeleccionada.razonSocial || "-"} ·{" "}
                    {empresaSeleccionada.rut || "-"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:gap-5">
          <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <p className="text-sm font-bold text-slate-500">
              Tarifas configuradas
            </p>

            <p className="mt-3 text-3xl font-black text-slate-900 sm:text-4xl">
              {tarifas.length}
            </p>

            <p className="mt-2 text-sm text-slate-500">
              Por sucursal y cargo.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <p className="text-sm font-bold text-slate-500">
              Promedio total mensual
            </p>

            <p className="mt-3 break-words text-2xl font-black text-slate-900 sm:text-3xl lg:text-4xl">
              {formatearCLP(promedioTotalMensual)}
            </p>

            <p className="mt-2 text-sm text-slate-500">
              Sueldo base + bonos. Base promedio:{" "}
              {formatearCLP(promedioSueldoBase)}.
            </p>
          </div>
        </div>
      </div>

      {empresaSeleccionada && (
        <div className="mb-6 flex">
          <button
            type="button"
            onClick={abrirAsociar}
            className="w-full rounded-2xl bg-[#4E1743] px-5 py-3 text-sm font-black text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-[#3d1235] sm:ml-auto sm:w-auto sm:px-6 sm:py-4 sm:text-base"
          >
            Crear tarifa por sucursal
          </button>
        </div>
      )}

      <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="mb-5">
          <h3 className="text-base font-black text-slate-900 sm:text-lg">
            Tarifas
            {empresaSeleccionada ? ` de ${empresaSeleccionada.nombre}` : ""}
          </h3>

          <p className="text-sm text-slate-500">
            Lista de sueldos base, bonos y valores por cargo/sucursal.
          </p>
        </div>

        {!empresaSeleccionada ? (
          <div className="rounded-2xl bg-slate-50 px-4 py-12 text-center text-sm text-slate-500 sm:text-base">
            Selecciona una empresa para ver sus tarifas.
          </div>
        ) : loadingTarifas ? (
          <div className="rounded-2xl bg-slate-50 px-4 py-12 text-center text-sm text-slate-500 sm:text-base">
            Cargando tarifas...
          </div>
        ) : tarifas.length === 0 ? (
          <div className="rounded-2xl bg-slate-50 px-4 py-12 text-center text-sm text-slate-500 sm:text-base">
            Esta empresa aún no tiene tarifas asociadas.
          </div>
        ) : (
          <>
            <div className="max-h-[65vh] overflow-y-auto pr-1 lg:hidden">
              <div className="grid grid-cols-1 gap-4">
                {tarifas.map((tarifa) => {
                  const totalBonos = calcularTotalBonos(tarifa);

                  return (
                    <div
                      key={tarifa.id}
                      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                    >
                      <div className="mb-4 flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#4E1743]/10 font-black text-[#4E1743]">
                          {tarifa.Cargo?.nombre?.charAt(0) || "C"}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="break-words font-black text-slate-900">
                            {tarifa.Cargo?.nombre || "-"}
                          </p>

                          <p className="text-xs text-slate-500">
                            {tarifa.Sucursal?.nombre || "-"} · ID #{tarifa.id}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                        <div className="rounded-xl bg-slate-50 p-3">
                          <p className="text-xs font-bold text-slate-500">
                            Sueldo base
                          </p>
                          <p className="mt-1 font-black text-slate-900">
                            {formatearCLP(Number(tarifa.sueldoBase || 0))}
                          </p>
                        </div>

                        <div className="rounded-xl bg-slate-50 p-3">
                          <p className="text-xs font-bold text-slate-500">
                            Bonos
                          </p>
                          <p className="mt-1 font-black text-slate-900">
                            {formatearCLP(totalBonos)}
                          </p>
                        </div>

                        <div className="rounded-xl bg-slate-50 p-3">
                          <p className="text-xs font-bold text-slate-500">
                            HH.EE
                          </p>
                          <p className="mt-1 font-black text-slate-900">
                            {formatearCLP(Number(tarifa.valorHoraExtra || 0))}
                          </p>
                        </div>

                        <div className="rounded-xl bg-[#4E1743]/10 p-3">
                          <p className="text-xs font-bold text-[#4E1743]">
                            Total mensual
                          </p>
                          <p className="mt-1 font-black text-[#4E1743]">
                            {formatearCLP(calcularTotalMensual(tarifa))}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                        <button
                          type="button"
                          onClick={() => editarTarifa(tarifa)}
                          className="rounded-xl bg-slate-100 px-4 py-2.5 font-bold text-slate-700 transition hover:bg-slate-200"
                        >
                          Editar
                        </button>

                        <button
                          type="button"
                          onClick={() => eliminarTarifa(tarifa)}
                          className="rounded-xl bg-red-50 px-4 py-2.5 font-bold text-red-700 transition hover:bg-red-100"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="hidden lg:block">
              <div className="h-[420px] overflow-auto rounded-2xl border border-slate-200 bg-white shadow-inner">
                <table className="w-full min-w-[1100px] text-left text-sm">
                  <thead className="sticky top-0 z-10 bg-white shadow-sm">
                    <tr className="border-b text-slate-500">
                      <th className="px-4 py-4">Cargo</th>
                      <th className="px-4 py-4">Sucursal</th>
                      <th className="px-4 py-4">Sueldo base</th>
                      <th className="px-4 py-4">Bonos</th>
                      <th className="px-4 py-4">Total mensual</th>
                      <th className="px-4 py-4">HH.EE</th>
                      <th className="px-4 py-4 text-right">Acciones</th>
                    </tr>
                  </thead>

                  <tbody>
                    {tarifas.map((tarifa) => {
                      const totalBonos = calcularTotalBonos(tarifa);

                      return (
                        <tr
                          key={tarifa.id}
                          className="border-b transition hover:bg-slate-50 last:border-none"
                        >
                          <td className="px-4 py-4">
                            <p className="font-black text-slate-900">
                              {tarifa.Cargo?.nombre || "-"}
                            </p>

                            <p className="text-xs text-slate-500">
                              ID tarifa #{tarifa.id}
                            </p>
                          </td>

                          <td className="px-4 py-4 font-semibold text-slate-700">
                            {tarifa.Sucursal?.nombre || "-"}
                          </td>

                          <td className="px-4 py-4 font-black text-slate-800">
                            {formatearCLP(Number(tarifa.sueldoBase || 0))}
                          </td>

                          <td className="px-4 py-4 text-slate-700">
                            {formatearCLP(totalBonos)}
                          </td>

                          <td className="px-4 py-4">
                            <span className="rounded-full bg-slate-100 px-4 py-2 font-black text-slate-800">
                              {formatearCLP(calcularTotalMensual(tarifa))}
                            </span>
                          </td>

                          <td className="px-4 py-4 text-slate-700">
                            {formatearCLP(Number(tarifa.valorHoraExtra || 0))}
                          </td>

                          <td className="px-4 py-4">
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => editarTarifa(tarifa)}
                                className="rounded-xl bg-slate-100 px-4 py-2 font-bold text-slate-700 transition hover:bg-slate-200"
                              >
                                Editar
                              </button>

                              <button
                                type="button"
                                onClick={() => eliminarTarifa(tarifa)}
                                className="rounded-xl bg-red-50 px-4 py-2 font-bold text-red-700 transition hover:bg-red-100"
                              >
                                Eliminar
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>

      <AsociarCargoModal
        open={modalAsociarOpen}
        loading={loading}
        editando={!!editando}
        empresaNombre={empresaSeleccionada?.nombre}
        form={tarifaForm}
        opcionesSucursales={opcionesSucursales}
        opcionesCargos={opcionesCargos}
        onClose={limpiarFormulario}
        onSubmit={handleSubmit}
        onChange={handleTarifaChange}
        onCrearSucursal={() => setModalSucursalOpen(true)}
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

      <CrearSucursalModal
        open={modalSucursalOpen}
        loading={loading}
        form={formSucursal}
        onClose={() => {
          setFormSucursal(formSucursalInicial);
          setModalSucursalOpen(false);
        }}
        onChange={handleSucursalChange}
        onSubmit={crearNuevaSucursal}
      />
    </DashboardLayout>
  );
}