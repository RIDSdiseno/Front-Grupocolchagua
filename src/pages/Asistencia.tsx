import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import CeldaAsistenciaModal from "../components/asistencia/CeldaAsistenciaModal";
import type { Asistencia, AsistenciaForm } from "../types/asistencia";
import type { Asignacion } from "../types/asignacion";
import {
  listarAsistenciaRequest,
  registrarAsistenciaRequest,
  eliminarAsistenciaRequest,
} from "../services/asistencia.service";
import { listarAsignacionesRequest } from "../services/asignacion.service";
import {
  listarHoldingsRequest,
  obtenerHoldingRequest,
  type Holding,
} from "../services/Holding.service";

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

const ESTADO_CONFIG: Record<string, { bg: string; text: string; label: string }> =
  {
    A: { bg: "bg-green-100", text: "text-green-800", label: "A" },
    L: { bg: "bg-slate-100", text: "text-slate-500", label: "L" },
    F: { bg: "bg-red-100", text: "text-red-700", label: "F" },
  };

const formInicial: AsistenciaForm = {
  estado: "A",
  horasExtras: 0,
  turno: "diurno",
  observacion: "",
};

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

function diasDelMes(año: number, mes: number): number[] {
  const total = new Date(año, mes, 0).getDate();
  return Array.from({ length: total }, (_, i) => i + 1);
}

function toISOLocal(año: number, mes: number, dia: number): string {
  return `${año}-${String(mes).padStart(2, "0")}-${String(dia).padStart(
    2,
    "0"
  )}`;
}

function diaDeISO(fechaStr: string): number {
  return new Date(fechaStr).getUTCDate();
}

export default function Asistencia() {
  const hoy = new Date();

  const [mes, setMes] = useState(hoy.getMonth() + 1);
  const [año, setAño] = useState(hoy.getFullYear());

  const [holdingId, setHoldingId] = useState<number | "">("");
  const [empresaId, setEmpresaId] = useState<number | "">("");
  const [sucursalId, setSucursalId] = useState<number | "">("");

  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [empresas, setEmpresas] = useState<EmpresaOption[]>([]);
  const [sucursales, setSucursales] = useState<SucursalOption[]>([]);

  const [asignaciones, setAsignaciones] = useState<Asignacion[]>([]);
  const [registros, setRegistros] = useState<Asistencia[]>([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cargandoGrilla, setCargandoGrilla] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  const [celdaForm, setCeldaForm] = useState<AsistenciaForm>(formInicial);
  const [celdaTrabajador, setCeldaTrabajador] = useState<{
    id: number;
    nombre: string;
    apellido: string;
    cargoId: number;
    sucursalId?: number | null;
  } | null>(null);

  const [celdaFecha, setCeldaFecha] = useState("");
  const [celdaRegistro, setCeldaRegistro] = useState<Asistencia | null>(null);

  const asignacionesVisibles = useMemo(() => {
    if (!holdingId || !empresaId || !sucursalId) return [];
    return asignaciones;
  }, [holdingId, empresaId, sucursalId, asignaciones]);

  const registrosVisibles = useMemo(() => {
    if (!holdingId || !empresaId || !sucursalId) return [];
    return registros;
  }, [holdingId, empresaId, sucursalId, registros]);

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

  const cargarGrilla = async () => {
    if (!holdingId || !empresaId || !sucursalId) return;

    setCargandoGrilla(true);
    setError("");

    try {
      const [asig, regs] = await Promise.all([
        listarAsignacionesRequest({
          empresaId: Number(empresaId),
          sucursalId: Number(sucursalId),
        }),
        listarAsistenciaRequest({
          holdingId: Number(holdingId),
          empresaId: Number(empresaId),
          sucursalId: Number(sucursalId),
          mes,
          año,
        }),
      ]);

      const inicioMes = new Date(Date.UTC(año, mes - 1, 1));
      const finMes = new Date(Date.UTC(año, mes, 0));

      const activas = asig.filter((a: Asignacion) => {
        const inicio = new Date(a.fechaInicio);
        const fin = a.fechaFin ? new Date(a.fechaFin) : null;
        return inicio <= finMes && (!fin || fin >= inicioMes);
      });

      setAsignaciones(activas);
      setRegistros(regs);
    } catch (err) {
      setError(obtenerMensajeError(err, "Error al cargar asistencia"));
    } finally {
      setCargandoGrilla(false);
    }
  };

  useEffect(() => {
    if (!holdingId || !empresaId || !sucursalId) return;

    let activo = true;

    void (async () => {
      setCargandoGrilla(true);
      setError("");

      try {
        const [asig, regs] = await Promise.all([
          listarAsignacionesRequest({
            empresaId: Number(empresaId),
            sucursalId: Number(sucursalId),
          }),
          listarAsistenciaRequest({
            holdingId: Number(holdingId),
            empresaId: Number(empresaId),
            sucursalId: Number(sucursalId),
            mes,
            año,
          }),
        ]);

        if (!activo) return;

        const inicioMes = new Date(Date.UTC(año, mes - 1, 1));
        const finMes = new Date(Date.UTC(año, mes, 0));

        const activas = asig.filter((a: Asignacion) => {
          const inicio = new Date(a.fechaInicio);
          const fin = a.fechaFin ? new Date(a.fechaFin) : null;
          return inicio <= finMes && (!fin || fin >= inicioMes);
        });

        setAsignaciones(activas);
        setRegistros(regs);
      } catch (err) {
        if (activo) {
          setError(obtenerMensajeError(err, "Error al cargar asistencia"));
        }
      } finally {
        if (activo) {
          setCargandoGrilla(false);
        }
      }
    })();

    return () => {
      activo = false;
    };
  }, [holdingId, empresaId, sucursalId, mes, año]);

  const handleHoldingChange = async (value: string) => {
    setHoldingId(value ? Number(value) : "");
    setEmpresaId("");
    setSucursalId("");
    setEmpresas([]);
    setSucursales([]);
    setAsignaciones([]);
    setRegistros([]);
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
    setAsignaciones([]);
    setRegistros([]);
    setError("");
    setMensaje("");

    const empresa = empresas.find((e) => e.id === Number(value));
    setSucursales(empresa?.Sucursal || []);
  };

  const handleSucursalChange = (value: string) => {
    setSucursalId(value ? Number(value) : "");
    setAsignaciones([]);
    setRegistros([]);
    setError("");
    setMensaje("");
  };

  const dias = useMemo(() => diasDelMes(año, mes), [año, mes]);

  const registroIndex = useMemo(() => {
    const idx = new Map<string, Asistencia>();

    for (const r of registrosVisibles) {
      const dia = diaDeISO(r.fecha);
      idx.set(`${r.trabajadorId}-${dia}`, r);
    }

    return idx;
  }, [registrosVisibles]);

  const trabajadoresGrilla = useMemo(() => {
    const seen = new Set<number>();

    return asignacionesVisibles.filter((a) => {
      if (seen.has(a.trabajadorId)) return false;
      seen.add(a.trabajadorId);
      return true;
    });
  }, [asignacionesVisibles]);

  const navegarMes = (delta: number) => {
    let nuevoMes = mes + delta;
    let nuevoAño = año;

    if (nuevoMes > 12) {
      nuevoMes = 1;
      nuevoAño++;
    }

    if (nuevoMes < 1) {
      nuevoMes = 12;
      nuevoAño--;
    }

    setMes(nuevoMes);
    setAño(nuevoAño);
  };

  const abrirCelda = (
    asignacion: Asignacion,
    dia: number,
    registroExistente: Asistencia | null
  ) => {
    setCeldaTrabajador({
      id: asignacion.trabajadorId,
      nombre: asignacion.Trabajador.nombre,
      apellido: asignacion.Trabajador.apellido,
      cargoId: asignacion.cargoId,
      sucursalId: asignacion.sucursalId,
    });

    setCeldaFecha(toISOLocal(año, mes, dia));
    setCeldaRegistro(registroExistente);

    setCeldaForm(
      registroExistente
        ? {
            estado: registroExistente.estado,
            horasExtras: registroExistente.horasExtras,
            turno: registroExistente.turno,
            observacion: registroExistente.observacion || "",
          }
        : { ...formInicial }
    );

    setError("");
    setMensaje("");
    setModalOpen(true);
  };

  const handleCeldaChange = (
    field: keyof AsistenciaForm,
    value: string | number
  ) => {
    setCeldaForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleGuardar = async () => {
    if (!celdaTrabajador || !empresaId || !sucursalId) return;

    setLoading(true);
    setError("");

    try {
      await registrarAsistenciaRequest({
        trabajadorId: celdaTrabajador.id,
        fecha: celdaFecha,
        estado: celdaForm.estado,
        horasExtras: celdaForm.horasExtras,
        turno: celdaForm.turno,
        cargoId: celdaTrabajador.cargoId,
        empresaId: Number(empresaId),
        sucursalId: Number(sucursalId),
        observacion: celdaForm.observacion || undefined,
      });

      setModalOpen(false);
      setMensaje("Asistencia guardada correctamente");

      await cargarGrilla();
    } catch (err: unknown) {
      setError(obtenerMensajeError(err, "Error al guardar asistencia"));
    } finally {
      setLoading(false);
    }
  };

  const handleEliminar = async () => {
    if (!celdaRegistro) return;

    const ok = confirm("¿Eliminar este registro de asistencia?");
    if (!ok) return;

    setLoading(true);
    setError("");

    try {
      await eliminarAsistenciaRequest(celdaRegistro.id);

      setModalOpen(false);
      setMensaje("Asistencia eliminada correctamente");

      await cargarGrilla();
    } catch (err: unknown) {
      setError(obtenerMensajeError(err, "Error al eliminar"));
    } finally {
      setLoading(false);
    }
  };

  const totalesPorTrabajador = useMemo(() => {
    const totales = new Map<
      number,
      { asistio: number; libre: number; falta: number; horasExtras: number }
    >();

    for (const r of registrosVisibles) {
      if (!totales.has(r.trabajadorId)) {
        totales.set(r.trabajadorId, {
          asistio: 0,
          libre: 0,
          falta: 0,
          horasExtras: 0,
        });
      }

      const t = totales.get(r.trabajadorId);
      if (!t) continue;

      if (r.estado === "A") t.asistio++;
      if (r.estado === "L") t.libre++;
      if (r.estado === "F") t.falta++;
      t.horasExtras += r.horasExtras;
    }

    return totales;
  }, [registrosVisibles]);

  const nombreMes = new Date(año, mes - 1).toLocaleDateString("es-CL", {
    month: "long",
    year: "numeric",
  });

  return (
    <DashboardLayout>
      <div className="mb-8 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="mb-2 text-sm font-bold uppercase tracking-wide text-[#4E1743]">
            Control diario
          </p>

          <h2 className="text-3xl font-black text-slate-900">Asistencia</h2>

          <p className="mt-2 max-w-2xl text-slate-500">
            Registra la asistencia diaria de cada trabajador por holding,
            empresa, sucursal y mes.
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
              <option value="">Selecciona una sucursal</option>

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

        <div className="ml-auto flex items-center gap-3 text-xs font-bold">
          <span className="flex items-center gap-1">
            <span className="rounded-md bg-green-100 px-2 py-1 text-green-800">
              A
            </span>
            Asistió
          </span>

          <span className="flex items-center gap-1">
            <span className="rounded-md bg-slate-100 px-2 py-1 text-slate-500">
              L
            </span>
            Libre
          </span>

          <span className="flex items-center gap-1">
            <span className="rounded-md bg-red-100 px-2 py-1 text-red-700">
              F
            </span>
            Falta
          </span>
        </div>
      </div>

      {!holdingId || !empresaId || !sucursalId ? (
        <div className="rounded-3xl border border-slate-200 bg-white py-16 text-center text-slate-400 shadow-sm">
          Selecciona un holding, empresa y sucursal para ver la grilla de
          asistencia.
        </div>
      ) : cargandoGrilla ? (
        <div className="rounded-3xl border border-slate-200 bg-white py-16 text-center text-slate-400 shadow-sm">
          Cargando...
        </div>
      ) : trabajadoresGrilla.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white py-16 text-center text-slate-400 shadow-sm">
          No hay trabajadores asignados a esta sucursal en este período.
        </div>
      ) : (
        <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b bg-slate-50">
                  <th className="sticky left-0 z-10 min-w-[180px] bg-slate-50 px-4 py-3 text-left font-black text-slate-700">
                    Trabajador
                  </th>

                  <th className="sticky left-[180px] z-10 min-w-[120px] bg-slate-50 px-3 py-3 text-left font-black text-slate-700">
                    Cargo
                  </th>

                  {dias.map((d) => {
                    const fechaISO = toISOLocal(año, mes, d);
                    const diaSemana = new Date(
                      Date.UTC(año, mes - 1, d)
                    ).getUTCDay();
                    const esDomingo = diaSemana === 0;

                    return (
                      <th
                        key={d}
                        className={`w-9 px-0.5 py-3 text-center font-black ${
                          esDomingo ? "text-red-400" : "text-slate-500"
                        }`}
                        title={fechaISO}
                      >
                        {d}
                      </th>
                    );
                  })}

                  <th className="px-3 py-3 text-center font-black text-slate-700">
                    Días
                  </th>

                  <th className="px-3 py-3 text-center font-black text-slate-700">
                    HH.EE
                  </th>
                </tr>
              </thead>

              <tbody>
                {trabajadoresGrilla.map((asig) => {
                  const totales = totalesPorTrabajador.get(
                    asig.trabajadorId
                  ) ?? {
                    asistio: 0,
                    libre: 0,
                    falta: 0,
                    horasExtras: 0,
                  };

                  return (
                    <tr
                      key={asig.trabajadorId}
                      className="border-b transition hover:bg-slate-50/50 last:border-none"
                    >
                      <td className="sticky left-0 z-10 min-w-[180px] bg-white px-4 py-2">
                        <p className="font-black leading-tight text-slate-900">
                          {asig.Trabajador.apellido},{" "}
                          {asig.Trabajador.nombre}
                        </p>

                        <p className="text-[10px] text-slate-400">
                          {asig.Trabajador.rut}
                        </p>
                      </td>

                      <td className="sticky left-[180px] z-10 min-w-[120px] bg-white px-3 py-2 font-semibold text-slate-600">
                        {asig.Cargo.nombre}
                      </td>

                      {dias.map((d) => {
                        const registro = registroIndex.get(
                          `${asig.trabajadorId}-${d}`
                        );

                        const cfg = registro
                          ? ESTADO_CONFIG[registro.estado]
                          : null;

                        return (
                          <td key={d} className="px-0.5 py-1 text-center">
                            <button
                              type="button"
                              onClick={() =>
                                abrirCelda(asig, d, registro ?? null)
                              }
                              title={
                                registro
                                  ? `${registro.estado}${
                                      registro.horasExtras > 0
                                        ? ` +${registro.horasExtras}h`
                                        : ""
                                    }${
                                      registro.observacion
                                        ? ` · ${registro.observacion}`
                                        : ""
                                    }`
                                  : "Sin registro — clic para agregar"
                              }
                              className={`flex h-8 w-8 flex-col items-center justify-center rounded-lg transition hover:ring-2 hover:ring-[#4E1743]/30 ${
                                cfg
                                  ? `${cfg.bg} ${cfg.text}`
                                  : "bg-white text-slate-300 hover:bg-slate-100"
                              }`}
                            >
                              <span className="font-black leading-none">
                                {cfg ? cfg.label : "·"}
                              </span>

                              {registro && registro.horasExtras > 0 && (
                                <span className="text-[8px] font-bold leading-none opacity-70">
                                  +{registro.horasExtras}
                                </span>
                              )}
                            </button>
                          </td>
                        );
                      })}

                      <td className="px-3 py-2 text-center font-black text-slate-900">
                        {totales.asistio}

                        {totales.falta > 0 && (
                          <span className="ml-1 text-[10px] text-red-500">
                            -{totales.falta}F
                          </span>
                        )}
                      </td>

                      <td className="px-3 py-2 text-center font-black text-slate-700">
                        {totales.horasExtras > 0
                          ? `${totales.horasExtras}h`
                          : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <CeldaAsistenciaModal
        open={modalOpen}
        loading={loading}
        trabajadorNombre={
          celdaTrabajador
            ? `${celdaTrabajador.apellido}, ${celdaTrabajador.nombre}`
            : ""
        }
        fecha={celdaFecha}
        form={celdaForm}
        esEdicion={!!celdaRegistro}
        onClose={() => setModalOpen(false)}
        onChange={handleCeldaChange}
        onSubmit={handleGuardar}
        onEliminar={handleEliminar}
      />
    </DashboardLayout>
  );
}