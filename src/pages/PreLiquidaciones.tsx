import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import {
  listarHoldingsRequest,
  obtenerHoldingRequest,
  type Holding,
} from "../services/Holding.service";
import {
  aprobarPreLiquidacionRequest,
  generarPreLiquidacionesRequest,
  listarPreLiquidacionesRequest,
} from "../services/preliquidaciones.service";
import type { PreLiquidacion } from "../types/preliquidaciones";

interface SucursalOption {
  id: number;
  nombre: string;
  empresaId: number;
  holdingId: number;
  comuna?: string | null;
  ciudad?: string | null;
}

interface EmpresaOption {
  id: number;
  nombre: string;
  rut?: string | null;
  Sucursal: SucursalOption[];
}

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

const formatoCLP = (valor: number) =>
  new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(valor || 0);

export default function PreLiquidaciones() {
  const hoy = new Date();

  const [mes, setMes] = useState(hoy.getMonth() + 1);
  const [anio, setAnio] = useState(hoy.getFullYear());

  const [holdingId, setHoldingId] = useState<number | "">("");
  const [empresaId, setEmpresaId] = useState<number | "">("");
  const [sucursalId, setSucursalId] = useState<number | "">("");

  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [empresas, setEmpresas] = useState<EmpresaOption[]>([]);
  const [sucursales, setSucursales] = useState<SucursalOption[]>([]);

  const [preliquidaciones, setPreliquidaciones] = useState<PreLiquidacion[]>(
    []
  );

  const [loading, setLoading] = useState(false);
  const [generando, setGenerando] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  const nombreMes = new Date(anio, mes - 1).toLocaleDateString("es-CL", {
    month: "long",
    year: "numeric",
  });

  const cargarPreLiquidaciones = async () => {
    if (!empresaId) return [];

    const data = await listarPreLiquidacionesRequest({
      empresaId: Number(empresaId),
      sucursalId: sucursalId ? Number(sucursalId) : undefined,
      mes,
      anio,
    });

    setPreliquidaciones(data);
    return data;
  };

  useEffect(() => {
    let activo = true;

    listarHoldingsRequest()
      .then((data) => {
        if (activo) setHoldings(data);
      })
      .catch(() => {
        if (activo) setError("Error al cargar holdings");
      });

    return () => {
      activo = false;
    };
  }, []);

  useEffect(() => {
    if (!empresaId) {
      setPreliquidaciones([]);
      return;
    }

    let activo = true;

    const cargarOGenerar = async () => {
      setLoading(true);
      setError("");
      setMensaje("");

      try {
        const existentes = await listarPreLiquidacionesRequest({
          empresaId: Number(empresaId),
          sucursalId: sucursalId ? Number(sucursalId) : undefined,
          mes,
          anio,
        });

        if (!activo) return;

        if (existentes.length > 0) {
          setPreliquidaciones(existentes);
          return;
        }

        const generadas = await generarPreLiquidacionesRequest({
          empresaId: Number(empresaId),
          sucursalId: sucursalId ? Number(sucursalId) : undefined,
          mes,
          anio,
        });

        if (!activo) return;

        setPreliquidaciones(generadas.preliquidaciones || []);
      } catch (err) {
        if (!activo) return;

        setPreliquidaciones([]);
        setError(
          obtenerMensajeError(
            err,
            "No hay datos suficientes para generar preliquidaciones"
          )
        );
      } finally {
        if (activo) setLoading(false);
      }
    };

    void cargarOGenerar();

    return () => {
      activo = false;
    };
  }, [empresaId, sucursalId, mes, anio]);

  const handleHoldingChange = async (value: string) => {
    setHoldingId(value ? Number(value) : "");
    setEmpresaId("");
    setSucursalId("");
    setEmpresas([]);
    setSucursales([]);
    setPreliquidaciones([]);
    setError("");
    setMensaje("");

    if (!value) return;

    try {
      const holding = await obtenerHoldingRequest(Number(value));

      const empresasDelHolding = holding.empresas.map((item) => ({
        id: item.Empresa.id,
        nombre: item.Empresa.nombre,
        rut: item.Empresa.rut,
        Sucursal: (item.Empresa.Sucursal || []).filter(
          (s) => s.holdingId === Number(value)
        ),
      }));

      setEmpresas(empresasDelHolding);
    } catch (err) {
      setError(obtenerMensajeError(err, "Error al cargar empresas"));
    }
  };

  const handleEmpresaChange = (value: string) => {
    setEmpresaId(value ? Number(value) : "");
    setSucursalId("");
    setPreliquidaciones([]);
    setError("");
    setMensaje("");

    const empresa = empresas.find((e) => e.id === Number(value));
    setSucursales(empresa?.Sucursal || []);
  };

  const handleSucursalChange = (value: string) => {
    setSucursalId(value ? Number(value) : "");
    setPreliquidaciones([]);
    setError("");
    setMensaje("");
  };

  const navegarMes = (delta: number) => {
    let nuevoMes = mes + delta;
    let nuevoAnio = anio;

    if (nuevoMes > 12) {
      nuevoMes = 1;
      nuevoAnio++;
    }

    if (nuevoMes < 1) {
      nuevoMes = 12;
      nuevoAnio--;
    }

    setMes(nuevoMes);
    setAnio(nuevoAnio);
  };

  const handleGenerar = async () => {
    if (!empresaId) {
      setError("Debes seleccionar una empresa");
      return;
    }

    setGenerando(true);
    setError("");
    setMensaje("");

    try {
      await generarPreLiquidacionesRequest({
        empresaId: Number(empresaId),
        sucursalId: sucursalId ? Number(sucursalId) : undefined,
        mes,
        anio,
      });

      await cargarPreLiquidaciones();

      setMensaje("Preliquidaciones recalculadas correctamente");
    } catch (err) {
      setError(obtenerMensajeError(err, "Error al recalcular"));
    } finally {
      setGenerando(false);
    }
  };

  const handleAprobar = async (id: number) => {
    const ok = confirm("¿Aprobar esta preliquidación?");
    if (!ok) return;

    setLoading(true);
    setError("");
    setMensaje("");

    try {
      await aprobarPreLiquidacionRequest(id);
      await cargarPreLiquidaciones();
      setMensaje("Preliquidación aprobada correctamente");
    } catch (err) {
      setError(obtenerMensajeError(err, "Error al aprobar preliquidación"));
    } finally {
      setLoading(false);
    }
  };

  const resumen = useMemo(() => {
    return preliquidaciones.reduce(
      (acc, item) => {
        acc.totalTrabajadores += 1;
        acc.totalHaberes += Number(item.totalHaberes) || 0;
        acc.totalDescuentos += Number(item.totalDescuentos) || 0;
        acc.totalInformar += Number(item.montoInformar) || 0;

        if (item.estado === "APROBADA") acc.aprobadas += 1;
        if (item.estado === "BORRADOR") acc.borradores += 1;

        return acc;
      },
      {
        totalTrabajadores: 0,
        totalHaberes: 0,
        totalDescuentos: 0,
        totalInformar: 0,
        aprobadas: 0,
        borradores: 0,
      }
    );
  }, [preliquidaciones]);

  return (
    <DashboardLayout>
      <div className="mb-8 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="mb-2 text-sm font-bold uppercase tracking-wide text-[#4E1743]">
            Remuneraciones
          </p>

          <h2 className="text-3xl font-black text-slate-900">
            Preliquidaciones
          </h2>

          <p className="mt-2 max-w-2xl text-slate-500">
            Genera y revisa preliquidaciones mensuales desde asistencia,
            horas extras, bonos, anticipos e incidencias.
          </p>
        </div>

        <button
          type="button"
          disabled={!empresaId || generando}
          onClick={handleGenerar}
          className="rounded-2xl bg-[#4E1743] px-5 py-3 text-sm font-black text-white shadow-sm transition hover:bg-[#3d1235] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {generando ? "Recalculando..." : "Recalcular preliquidaciones"}
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

      <div className="mb-6 flex flex-wrap items-end gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid min-w-[520px] flex-1 grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">
              Holding
            </label>

            <select
              value={holdingId}
              onChange={(e) => handleHoldingChange(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 font-semibold text-slate-700 outline-none focus:border-[#4E1743] focus:ring-2 focus:ring-[#4E1743]/20"
            >
              <option value="">Selecciona un holding</option>

              {holdings.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">
              Empresa
            </label>

            <select
              value={empresaId}
              disabled={!holdingId}
              onChange={(e) => handleEmpresaChange(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 font-semibold text-slate-700 outline-none disabled:bg-slate-100 disabled:text-slate-400 focus:border-[#4E1743] focus:ring-2 focus:ring-[#4E1743]/20"
            >
              <option value="">Selecciona una empresa</option>

              {empresas.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">
              Sucursal
            </label>

            <select
              value={sucursalId}
              disabled={!empresaId}
              onChange={(e) => handleSucursalChange(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 font-semibold text-slate-700 outline-none disabled:bg-slate-100 disabled:text-slate-400 focus:border-[#4E1743] focus:ring-2 focus:ring-[#4E1743]/20"
            >
              <option value="">Todas las sucursales</option>

              {sucursales.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nombre}
                  {s.comuna ? ` - ${s.comuna}` : ""}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">
            Período
          </label>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navegarMes(-1)}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 font-black text-slate-600 hover:bg-slate-200"
            >
              ‹
            </button>

            <span className="min-w-[160px] text-center text-sm font-black capitalize text-slate-900">
              {nombreMes}
            </span>

            <button
              type="button"
              onClick={() => navegarMes(1)}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 font-black text-slate-600 hover:bg-slate-200"
            >
              ›
            </button>
          </div>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-black uppercase text-slate-400">
            Trabajadores
          </p>
          <p className="mt-2 text-2xl font-black text-slate-900">
            {resumen.totalTrabajadores}
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-black uppercase text-slate-400">
            Haberes
          </p>
          <p className="mt-2 text-2xl font-black text-green-700">
            {formatoCLP(resumen.totalHaberes)}
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-black uppercase text-slate-400">
            Descuentos
          </p>
          <p className="mt-2 text-2xl font-black text-red-600">
            {formatoCLP(resumen.totalDescuentos)}
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-black uppercase text-slate-400">
            Total a informar
          </p>
          <p className="mt-2 text-2xl font-black text-[#4E1743]">
            {formatoCLP(resumen.totalInformar)}
          </p>
        </div>
      </div>

      {!empresaId ? (
        <div className="rounded-3xl border border-slate-200 bg-white py-16 text-center text-slate-400 shadow-sm">
          Selecciona holding y empresa para ver preliquidaciones.
        </div>
      ) : loading ? (
        <div className="rounded-3xl border border-slate-200 bg-white py-16 text-center text-slate-400 shadow-sm">
          Cargando preliquidaciones...
        </div>
      ) : preliquidaciones.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white py-16 text-center text-slate-400 shadow-sm">
          No hay preliquidaciones generadas para este período.
        </div>
      ) : (
        <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <th className="min-w-[210px] px-4 py-3 text-left font-black">
                    Trabajador
                  </th>
                  <th className="min-w-[150px] px-4 py-3 text-left font-black">
                    Cargo
                  </th>
                  <th className="px-4 py-3 text-center font-black">Días</th>
                  <th className="px-4 py-3 text-center font-black">HH.EE</th>
                  <th className="px-4 py-3 text-right font-black">
                    Sueldo base
                  </th>
                  <th className="px-4 py-3 text-right font-black">Haberes</th>
                  <th className="px-4 py-3 text-right font-black">
                    Descuentos
                  </th>
                  <th className="px-4 py-3 text-right font-black">
                    A informar
                  </th>
                  <th className="px-4 py-3 text-center font-black">Estado</th>
                  <th className="px-4 py-3 text-center font-black">Acción</th>
                </tr>
              </thead>

              <tbody>
                {preliquidaciones.map((item) => {
                  const trabajador = item.Trabajador;
                  const cargo = item.Cargo;

                  return (
                    <tr
                      key={item.id}
                      className="border-b last:border-none hover:bg-slate-50/60"
                    >
                      <td className="px-4 py-3">
                        <p className="font-black text-slate-900">
                          {trabajador
                            ? `${trabajador.apellido}, ${trabajador.nombre}`
                            : `Trabajador #${item.trabajadorId}`}
                        </p>
                        <p className="text-xs text-slate-400">
                          {trabajador?.rut || "Sin RUT"}
                        </p>
                      </td>

                      <td className="px-4 py-3 font-semibold text-slate-600">
                        {cargo?.nombre || "Sin cargo"}
                      </td>

                      <td className="px-4 py-3 text-center font-black text-slate-800">
                        {item.diasTrabajados}
                        {item.diasFalta > 0 && (
                          <span className="ml-1 text-xs text-red-500">
                            -{item.diasFalta}F
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3 text-center font-bold text-slate-700">
                        {item.cantidadHorasExtras > 0
                          ? `${item.cantidadHorasExtras}h`
                          : "—"}
                      </td>

                      <td className="px-4 py-3 text-right font-semibold text-slate-700">
                        {formatoCLP(item.sueldoBase)}
                      </td>

                      <td className="px-4 py-3 text-right font-bold text-green-700">
                        {formatoCLP(item.totalHaberes)}
                      </td>

                      <td className="px-4 py-3 text-right font-bold text-red-600">
                        {formatoCLP(item.totalDescuentos)}
                      </td>

                      <td className="px-4 py-3 text-right font-black text-[#4E1743]">
                        {formatoCLP(item.montoInformar)}
                      </td>

                      <td className="px-4 py-3 text-center">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-black ${
                            item.estado === "APROBADA"
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {item.estado}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-center">
                        {item.estado === "APROBADA" ? (
                          <span className="text-xs font-bold text-slate-400">
                            Aprobada
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleAprobar(item.id)}
                            className="rounded-xl bg-[#4E1743] px-4 py-2 text-xs font-black text-white hover:bg-[#3d1235]"
                          >
                            Aprobar
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}