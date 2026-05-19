import { useCallback, useEffect, useMemo, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import CeldaAsistenciaModal from "../components/asistencia/CeldaAsistenciaModal";
import type { Asistencia, AsistenciaForm } from "../types/asistencia";
import type { Asignacion } from "../types/asignacion";
import type { TipoIncidencia, TipoIncidenciaModal } from "../types/incidencias";
import {
  listarAsistenciaRequest,
  registrarAsistenciaRequest,
  eliminarAsistenciaRequest,
  registrarAsistenciaMasivaRequest,
} from "../services/asistencia.service";
import { crearIncidenciaRequest } from "../services/incidencias.service";
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

interface IncidenciaFormModal {
  tipo: TipoIncidenciaModal;
  minutos: number;
  monto: number;
  observacion: string;
}

interface BulkForm {
  estado: "A" | "L" | "F";
  horasExtras: number;
  turno: "diurno" | "nocturno";
  observacion: string;
}

interface CeldaSeleccionada {
  key: string;
  trabajadorId: number;
  fecha: string;
  cargoId: number;
  sucursalId?: number | null;
}

type EstadoVisual = "A" | "L" | "F";

const ESTADO_CONFIG: Record<EstadoVisual, { bg: string; text: string; label: string }> = {
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

const incidenciaInicial: IncidenciaFormModal = {
  tipo: "NINGUNA",
  minutos: 0,
  monto: 0,
  observacion: "",
};

const bulkInicial: BulkForm = {
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

function esDomingoFecha(año: number, mes: number, dia: number): boolean {
  return new Date(Date.UTC(año, mes - 1, dia)).getUTCDay() === 0;
}

function obtenerEstadoVisible(
  registro: Asistencia | undefined,
  año: number,
  mes: number,
  dia: number
): EstadoVisual | null {
  if (registro?.estado === "A" || registro?.estado === "L" || registro?.estado === "F") {
    return registro.estado;
  }

  if (esDomingoFecha(año, mes, dia)) {
    return "L";
  }

  return null;
}

function obtenerFormInicialCelda(
  registro: Asistencia | null,
  año: number,
  mes: number,
  dia: number
): AsistenciaForm {
  if (registro) {
    return {
      estado: registro.estado,
      horasExtras: registro.horasExtras,
      turno: registro.turno,
      observacion: registro.observacion || "",
    };
  }

  return {
    ...formInicial,
    estado: esDomingoFecha(año, mes, dia) ? "L" : "A",
    horasExtras: 0,
  };
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
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [modoMultiple, setModoMultiple] = useState(false);

  const [loading, setLoading] = useState(false);
  const [cargandoGrilla, setCargandoGrilla] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  const [celdaForm, setCeldaForm] = useState<AsistenciaForm>(formInicial);
  const [incidenciaForm, setIncidenciaForm] =
    useState<IncidenciaFormModal>(incidenciaInicial);
  const [bulkForm, setBulkForm] = useState<BulkForm>(bulkInicial);

  const [seleccionadas, setSeleccionadas] = useState<
    Map<string, CeldaSeleccionada>
  >(new Map());

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

  const dias = useMemo(() => diasDelMes(año, mes), [año, mes]);

  const cargarHoldings = useCallback(async () => {
    try {
      const data = await listarHoldingsRequest();
      setHoldings(data);
    } catch {
      setError("Error al cargar holdings");
    }
  }, []);

  const cargarGrilla = useCallback(async () => {
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
      setSeleccionadas(new Map());
      setModoMultiple(false);
    } catch (err) {
      setError(obtenerMensajeError(err, "Error al cargar asistencia"));
    } finally {
      setCargandoGrilla(false);
    }
  }, [holdingId, empresaId, sucursalId, mes, año]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void cargarHoldings();
    }, 0);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [cargarHoldings]);

  useEffect(() => {
    if (!holdingId || !empresaId || !sucursalId) return;

    const timeout = window.setTimeout(() => {
      void cargarGrilla();
    }, 0);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [holdingId, empresaId, sucursalId, mes, año, cargarGrilla]);

  const handleHoldingChange = async (value: string) => {
    setHoldingId(value ? Number(value) : "");
    setEmpresaId("");
    setSucursalId("");
    setEmpresas([]);
    setSucursales([]);
    setAsignaciones([]);
    setRegistros([]);
    setSeleccionadas(new Map());
    setModoMultiple(false);
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
    setSeleccionadas(new Map());
    setModoMultiple(false);
    setError("");
    setMensaje("");

    const empresa = empresas.find((e) => e.id === Number(value));
    setSucursales(empresa?.Sucursal || []);
  };

  const handleSucursalChange = (value: string) => {
    setSucursalId(value ? Number(value) : "");
    setAsignaciones([]);
    setRegistros([]);
    setSeleccionadas(new Map());
    setModoMultiple(false);
    setError("");
    setMensaje("");
  };

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
    if (modoMultiple) {
      toggleSeleccion(asignacion, dia);
      return;
    }

    setCeldaTrabajador({
      id: asignacion.trabajadorId,
      nombre: asignacion.Trabajador.nombre,
      apellido: asignacion.Trabajador.apellido,
      cargoId: asignacion.cargoId,
      sucursalId: asignacion.sucursalId,
    });

    setCeldaFecha(toISOLocal(año, mes, dia));
    setCeldaRegistro(registroExistente);
    setIncidenciaForm(incidenciaInicial);
    setCeldaForm(obtenerFormInicialCelda(registroExistente, año, mes, dia));

    setError("");
    setMensaje("");
    setModalOpen(true);
  };

  const toggleSeleccion = (asignacion: Asignacion, dia: number) => {
    const fecha = toISOLocal(año, mes, dia);
    const key = `${asignacion.trabajadorId}-${dia}`;

    setSeleccionadas((prev) => {
      const next = new Map(prev);

      if (next.has(key)) {
        next.delete(key);
      } else {
        next.set(key, {
          key,
          trabajadorId: asignacion.trabajadorId,
          fecha,
          cargoId: asignacion.cargoId,
          sucursalId: asignacion.sucursalId,
        });
      }

      return next;
    });
  };

  const activarModoMultiple = () => {
    setModoMultiple((prev) => {
      const nuevo = !prev;

      if (!nuevo) {
        setSeleccionadas(new Map());
      }

      return nuevo;
    });

    setError("");
    setMensaje("");
  };

  const seleccionarFila = (asignacion: Asignacion) => {
    setSeleccionadas((prev) => {
      const next = new Map(prev);

      const todosSeleccionados = dias.every((d) =>
        next.has(`${asignacion.trabajadorId}-${d}`)
      );

      if (todosSeleccionados) {
        dias.forEach((d) => {
          next.delete(`${asignacion.trabajadorId}-${d}`);
        });
      } else {
        dias.forEach((d) => {
          const fecha = toISOLocal(año, mes, d);
          next.set(`${asignacion.trabajadorId}-${d}`, {
            key: `${asignacion.trabajadorId}-${d}`,
            trabajadorId: asignacion.trabajadorId,
            fecha,
            cargoId: asignacion.cargoId,
            sucursalId: asignacion.sucursalId,
          });
        });
      }

      return next;
    });
  };

  const seleccionarColumna = (dia: number) => {
    setSeleccionadas((prev) => {
      const next = new Map(prev);

      const todosSeleccionados = trabajadoresGrilla.every((asig) =>
        next.has(`${asig.trabajadorId}-${dia}`)
      );

      if (todosSeleccionados) {
        trabajadoresGrilla.forEach((asig) => {
          next.delete(`${asig.trabajadorId}-${dia}`);
        });
      } else {
        trabajadoresGrilla.forEach((asig) => {
          const fecha = toISOLocal(año, mes, dia);
          next.set(`${asig.trabajadorId}-${dia}`, {
            key: `${asig.trabajadorId}-${dia}`,
            trabajadorId: asig.trabajadorId,
            fecha,
            cargoId: asig.cargoId,
            sucursalId: asig.sucursalId,
          });
        });
      }

      return next;
    });
  };

  const handleCeldaChange = (
    field: keyof AsistenciaForm,
    value: string | number
  ) => {
    setCeldaForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleIncidenciaChange = (
    field: keyof IncidenciaFormModal,
    value: string | number
  ) => {
    setIncidenciaForm((prev) => ({
      ...prev,
      [field]: value,
    }));
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

      if (incidenciaForm.tipo !== "NINGUNA") {
        await crearIncidenciaRequest({
          trabajadorId: celdaTrabajador.id,
          empresaId: Number(empresaId),
          sucursalId: Number(sucursalId),
          cargoId: celdaTrabajador.cargoId,
          fecha: celdaFecha,
          tipo: incidenciaForm.tipo as TipoIncidencia,
          minutos: Number(incidenciaForm.minutos) || 0,
          monto: Number(incidenciaForm.monto) || 0,
          observacion: incidenciaForm.observacion || undefined,
        });
      }

      setModalOpen(false);
      setMensaje(
        incidenciaForm.tipo !== "NINGUNA"
          ? "Asistencia e incidencia guardadas correctamente"
          : "Asistencia guardada correctamente"
      );

      await cargarGrilla();
    } catch (err: unknown) {
      setError(obtenerMensajeError(err, "Error al guardar asistencia"));
    } finally {
      setLoading(false);
    }
  };

  const handleGuardarMasivo = async () => {
    if (!empresaId || !sucursalId) return;

    const celdas = Array.from(seleccionadas.values());

    if (celdas.length === 0) {
      setError("Debes seleccionar al menos una celda");
      return;
    }

    setLoading(true);
    setError("");
    setMensaje("");

    try {
      const registrosMasivos = celdas.map((c) => ({
        trabajadorId: c.trabajadorId,
        fecha: c.fecha,
        estado: bulkForm.estado,
        horasExtras: Number(bulkForm.horasExtras) || 0,
        turno: bulkForm.turno,
        cargoId: c.cargoId,
        empresaId: Number(empresaId),
        sucursalId: Number(sucursalId),
        observacion: bulkForm.observacion || undefined,
      }));

      const res = await registrarAsistenciaMasivaRequest({
        registros: registrosMasivos,
      });

      setBulkModalOpen(false);
      setModoMultiple(false);
      setSeleccionadas(new Map());
      setBulkForm(bulkInicial);

      setMensaje(
        res.errores?.length
          ? `Se procesaron ${res.procesados} registros con algunas observaciones`
          : `Se guardaron ${res.procesados} asistencias correctamente`
      );

      await cargarGrilla();
    } catch (err: unknown) {
      setError(obtenerMensajeError(err, "Error al guardar asistencia masiva"));
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

    for (const asig of trabajadoresGrilla) {
      totales.set(asig.trabajadorId, {
        asistio: 0,
        libre: 0,
        falta: 0,
        horasExtras: 0,
      });
    }

    for (const asig of trabajadoresGrilla) {
      const t = totales.get(asig.trabajadorId);
      if (!t) continue;

      for (const d of dias) {
        const registro = registroIndex.get(`${asig.trabajadorId}-${d}`);
        const estado = obtenerEstadoVisible(registro, año, mes, d);

        if (estado === "A") t.asistio++;
        if (estado === "L") t.libre++;
        if (estado === "F") t.falta++;

        if (registro && estado === "A") {
          t.horasExtras += Number(registro.horasExtras) || 0;
        }
      }
    }

    return totales;
  }, [trabajadoresGrilla, dias, registroIndex, año, mes]);

  const nombreMes = new Date(año, mes - 1).toLocaleDateString("es-CL", {
    month: "long",
    year: "numeric",
  });

  const seleccionadasCount = seleccionadas.size;

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

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled={!holdingId || !empresaId || !sucursalId}
            onClick={activarModoMultiple}
            className={`rounded-2xl px-5 py-3 text-sm font-black shadow-sm transition disabled:cursor-not-allowed disabled:opacity-50 ${
              modoMultiple
                ? "bg-red-100 text-red-700 hover:bg-red-200"
                : "bg-[#4E1743] text-white hover:bg-[#3d1235]"
            }`}
          >
            {modoMultiple ? "Cancelar selección" : "Selección múltiple"}
          </button>

          {modoMultiple && (
            <>
              <button
                type="button"
                disabled={seleccionadasCount === 0}
                onClick={() => setBulkModalOpen(true)}
                className="rounded-2xl bg-green-600 px-5 py-3 text-sm font-black text-white shadow-sm transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Aplicar a {seleccionadasCount}
              </button>

              <button
                type="button"
                disabled={seleccionadasCount === 0}
                onClick={() => setSeleccionadas(new Map())}
                className="rounded-2xl bg-slate-200 px-5 py-3 text-sm font-black text-slate-700 shadow-sm transition hover:bg-slate-300 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Limpiar
              </button>
            </>
          )}
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

      {modoMultiple && (
        <div className="mb-5 rounded-2xl border border-[#4E1743]/20 bg-[#4E1743]/5 px-5 py-4 text-sm font-semibold text-[#4E1743]">
          Modo selección múltiple activo. Haz clic en varias celdas, en el
          nombre del trabajador para seleccionar toda la fila o en el número
          del día para seleccionar toda la columna.
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
                    const esDomingo = esDomingoFecha(año, mes, d);
                    const columnaSeleccionada =
                      modoMultiple &&
                      trabajadoresGrilla.length > 0 &&
                      trabajadoresGrilla.every((asig) =>
                        seleccionadas.has(`${asig.trabajadorId}-${d}`)
                      );

                    return (
                      <th
                        key={d}
                        className={`w-9 px-0.5 py-3 text-center font-black ${
                          esDomingo ? "text-red-400" : "text-slate-500"
                        }`}
                        title={fechaISO}
                      >
                        <button
                          type="button"
                          disabled={!modoMultiple}
                          onClick={() => seleccionarColumna(d)}
                          className={`h-7 w-7 rounded-lg transition ${
                            modoMultiple
                              ? columnaSeleccionada
                                ? "bg-[#4E1743] text-white"
                                : "hover:bg-[#4E1743]/10"
                              : ""
                          }`}
                        >
                          {d}
                        </button>
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
                  const totales = totalesPorTrabajador.get(asig.trabajadorId) ?? {
                    asistio: 0,
                    libre: 0,
                    falta: 0,
                    horasExtras: 0,
                  };

                  const filaSeleccionada =
                    modoMultiple &&
                    dias.every((d) =>
                      seleccionadas.has(`${asig.trabajadorId}-${d}`)
                    );

                  return (
                    <tr
                      key={asig.trabajadorId}
                      className="border-b transition hover:bg-slate-50/50 last:border-none"
                    >
                      <td className="sticky left-0 z-10 min-w-[180px] bg-white px-4 py-2">
                        <button
                          type="button"
                          disabled={!modoMultiple}
                          onClick={() => seleccionarFila(asig)}
                          className={`w-full rounded-xl p-1 text-left transition ${
                            modoMultiple
                              ? filaSeleccionada
                                ? "bg-[#4E1743]/10"
                                : "hover:bg-slate-100"
                              : ""
                          }`}
                        >
                          <p className="font-black leading-tight text-slate-900">
                            {asig.Trabajador.apellido},{" "}
                            {asig.Trabajador.nombre}
                          </p>

                          <p className="text-[10px] text-slate-400">
                            {asig.Trabajador.rut}
                          </p>
                        </button>
                      </td>

                      <td className="sticky left-[180px] z-10 min-w-[120px] bg-white px-3 py-2 font-semibold text-slate-600">
                        {asig.Cargo.nombre}
                      </td>

                      {dias.map((d) => {
                        const registro = registroIndex.get(
                          `${asig.trabajadorId}-${d}`
                        );

                        const estadoVisible = obtenerEstadoVisible(
                          registro,
                          año,
                          mes,
                          d
                        );

                        const cfg = estadoVisible
                          ? ESTADO_CONFIG[estadoVisible]
                          : null;

                        const key = `${asig.trabajadorId}-${d}`;
                        const seleccionada = seleccionadas.has(key);

                        return (
                          <td key={d} className="px-0.5 py-1 text-center">
                            <button
                              type="button"
                              onClick={() =>
                                abrirCelda(asig, d, registro ?? null)
                              }
                              title={
                                modoMultiple
                                  ? seleccionada
                                    ? "Seleccionada"
                                    : "Clic para seleccionar"
                                  : registro
                                  ? `${registro.estado}${
                                      registro.horasExtras > 0
                                        ? ` +${registro.horasExtras}h`
                                        : ""
                                    }${
                                      registro.observacion
                                        ? ` · ${registro.observacion}`
                                        : ""
                                    }`
                                  : estadoVisible === "L"
                                  ? "Libre por defecto — clic para editar"
                                  : "Sin registro — clic para agregar"
                              }
                              className={`relative flex h-8 w-8 flex-col items-center justify-center rounded-lg transition hover:ring-2 hover:ring-[#4E1743]/30 ${
                                seleccionada
                                  ? "bg-[#4E1743] text-white ring-2 ring-[#4E1743]/40"
                                  : cfg
                                  ? `${cfg.bg} ${cfg.text}`
                                  : "bg-white text-slate-300 hover:bg-slate-100"
                              }`}
                            >
                              <span className="font-black leading-none">
                                {seleccionada ? "✓" : cfg ? cfg.label : "·"}
                              </span>

                              {!seleccionada &&
                                registro &&
                                registro.horasExtras > 0 && (
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
        incidenciaForm={incidenciaForm}
        esEdicion={!!celdaRegistro}
        onClose={() => setModalOpen(false)}
        onChange={handleCeldaChange}
        onIncidenciaChange={handleIncidenciaChange}
        onSubmit={handleGuardar}
        onEliminar={handleEliminar}
      />

      {bulkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b px-6 py-4">
              <div>
                <h3 className="font-bold text-[#4E1743]">
                  Aplicar asistencia masiva
                </h3>
                <p className="text-sm text-slate-500">
                  {seleccionadasCount} celdas seleccionadas
                </p>
              </div>

              <button
                type="button"
                onClick={() => setBulkModalOpen(false)}
                className="rounded-lg px-3 py-1 text-xl font-bold text-slate-500 hover:bg-slate-100"
              >
                ×
              </button>
            </div>

            <div className="p-6">
              <div className="mb-5">
                <p className="mb-3 text-sm font-bold uppercase tracking-wide text-[#4E1743]">
                  Estado
                </p>

                <div className="flex gap-3">
                  {(["A", "L", "F"] as const).map((estado) => (
                    <button
                      key={estado}
                      type="button"
                      onClick={() =>
                        setBulkForm((prev) => ({ ...prev, estado }))
                      }
                      className={`flex-1 rounded-xl py-3 font-black transition ${
                        bulkForm.estado === estado
                          ? estado === "A"
                            ? "scale-105 bg-green-500 text-white shadow-md"
                            : estado === "L"
                            ? "scale-105 bg-slate-400 text-white shadow-md"
                            : "scale-105 bg-red-500 text-white shadow-md"
                          : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                      }`}
                    >
                      {estado}
                      <span className="block text-xs font-semibold opacity-80">
                        {estado === "A"
                          ? "Asistió"
                          : estado === "L"
                          ? "Libre"
                          : "Falta"}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-5">
                <p className="mb-3 text-sm font-bold uppercase tracking-wide text-[#4E1743]">
                  Horas extras
                </p>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setBulkForm((prev) => ({
                        ...prev,
                        horasExtras: Math.max(0, prev.horasExtras - 0.5),
                      }))
                    }
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-xl font-black hover:bg-slate-200"
                  >
                    −
                  </button>

                  <span className="flex-1 rounded-xl border border-slate-200 py-2 text-center text-2xl font-black text-slate-900">
                    {bulkForm.horasExtras}h
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      setBulkForm((prev) => ({
                        ...prev,
                        horasExtras: Math.min(12, prev.horasExtras + 0.5),
                      }))
                    }
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-xl font-black hover:bg-slate-200"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="mb-5">
                <p className="mb-3 text-sm font-bold uppercase tracking-wide text-[#4E1743]">
                  Turno
                </p>

                <div className="flex gap-3">
                  {(["diurno", "nocturno"] as const).map((turno) => (
                    <button
                      key={turno}
                      type="button"
                      onClick={() =>
                        setBulkForm((prev) => ({ ...prev, turno }))
                      }
                      className={`flex-1 rounded-xl py-3 font-bold capitalize transition ${
                        bulkForm.turno === turno
                          ? "bg-[#4E1743] text-white shadow-md"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {turno}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-5">
                <p className="mb-2 text-sm font-bold uppercase tracking-wide text-[#4E1743]">
                  Observación{" "}
                  <span className="font-normal normal-case text-slate-400">
                    (opcional)
                  </span>
                </p>

                <input
                  type="text"
                  value={bulkForm.observacion}
                  onChange={(e) =>
                    setBulkForm((prev) => ({
                      ...prev,
                      observacion: e.target.value,
                    }))
                  }
                  placeholder="Ej: carga masiva del mes"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-[#4E1743] focus:ring-2 focus:ring-[#4E1743]/20"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setBulkModalOpen(false)}
                  className="flex-1 rounded-xl border border-slate-300 px-4 py-3 font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  onClick={handleGuardarMasivo}
                  disabled={loading}
                  className="flex-1 rounded-xl bg-[#4E1743] px-4 py-3 font-bold text-white hover:bg-[#3d1235] disabled:opacity-60"
                >
                  {loading ? "Guardando..." : "Aplicar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}