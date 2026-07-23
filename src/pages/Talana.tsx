import { useEffect, useState } from "react";
import { CalendarRange, Fingerprint, Users } from "lucide-react";
import DashboardLayout from "../layouts/DashboardLayout";
import {
  buscarTrabajadorTalanaRequest,
  listarLiquidacionesRequest,
  listarPersonasTalanaRequest,
  listarTrabajadoresConMarcacionesRequest,
  obtenerComprobanteLiquidacionRequest,
  obtenerLiquidacionRequest,
} from "../services/talana.service";
import {
  EMPRESAS_TALANA,
  TIPOS_LIQUIDACION_TALANA,
  type ResultadoTrabajadoresConMarcacionesTalana,
  type TalanaCoincidenciaTrabajador,
  type TalanaLiquidacion,
  type TalanaPersona,
  type TipoLiquidacionTalana,
} from "../types/talana";

type Tab = "trabajador" | "marcaciones" | "liquidaciones";

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

const extraerLista = <T,>(datos: unknown): T[] => {
  if (Array.isArray(datos)) return datos;

  if (
    datos &&
    typeof datos === "object" &&
    Array.isArray((datos as { results?: T[] }).results)
  ) {
    return (datos as { results: T[] }).results;
  }

  return [];
};

const extraerCursor = (url: unknown): string | null => {
  if (typeof url !== "string" || !url) return null;

  try {
    return new URL(url).searchParams.get("cursor");
  } catch {
    return null;
  }
};

const extraerPaginacion = (
  datos: unknown
): { next: unknown; previous: unknown } => {
  if (datos && typeof datos === "object" && !Array.isArray(datos)) {
    const objeto = datos as { next?: unknown; previous?: unknown };
    return { next: objeto.next ?? null, previous: objeto.previous ?? null };
  }

  return { next: null, previous: null };
};

const tabs: { id: Tab; label: string }[] = [
  { id: "trabajador", label: "Buscar trabajador" },
  { id: "marcaciones", label: "Marcaciones" },
  { id: "liquidaciones", label: "Liquidaciones" },
];

const empresaOptions = [
  { value: String(EMPRESAS_TALANA.GRUPO_COLCHAGUA), label: "Grupo Colchagua" },
  { value: String(EMPRESAS_TALANA.GRUPO_SANTA_CRUZ), label: "Grupo Santa Cruz" },
];

export default function Talana() {
  const [tab, setTab] = useState<Tab>("trabajador");

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Talana</h2>
        <p className="text-sm text-slate-500">
          Consulta de trabajadores, marcaciones y liquidaciones directamente
          desde la API de Talana.
        </p>
      </div>

      <div className="mb-6 flex gap-2 border-b border-slate-200">
        {tabs.map((item) => (
          <button
            key={item.id}
            onClick={() => setTab(item.id)}
            className={`rounded-t-xl px-4 py-3 font-semibold transition ${
              tab === item.id
                ? "border-b-2 border-[#4E1743] text-[#4E1743]"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === "trabajador" && <BuscarTrabajadorTab />}
      {tab === "marcaciones" && <MarcacionesTab />}
      {tab === "liquidaciones" && <LiquidacionesTab />}
    </DashboardLayout>
  );
}

const PAGE_SIZE_PERSONAS = 25;

function BuscarTrabajadorTab() {
  const [rut, setRut] = useState("");
  const [empresa, setEmpresa] = useState<string>(
    String(EMPRESAS_TALANA.GRUPO_COLCHAGUA)
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [persona, setPersona] = useState<TalanaPersona | null>(null);
  const [coincidencias, setCoincidencias] = useState<
    TalanaCoincidenciaTrabajador[]
  >([]);

  const [personas, setPersonas] = useState<TalanaPersona[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [detalle, setDetalle] = useState<TalanaPersona | null>(null);
  const [modalAbierto, setModalAbierto] = useState(false);

  const limpiarResultados = () => {
    setPersona(null);
    setCoincidencias([]);
    setPersonas([]);
    setTotal(0);
  };

  const listarTodos = async (paginaSolicitada: number) => {
    if (empresa === "ambas") {
      setError(
        "Selecciona una empresa específica (no \"ambas\") para listar todos los trabajadores"
      );
      return;
    }

    setLoading(true);
    setError("");
    limpiarResultados();

    try {
      const resultado = await listarPersonasTalanaRequest(
        Number(empresa),
        paginaSolicitada,
        PAGE_SIZE_PERSONAS
      );

      setPersonas(resultado.results ?? []);
      setTotal(resultado.count ?? 0);
      setPage(paginaSolicitada);
    } catch (err) {
      setError(
        obtenerMensajeError(err, "No se pudo listar a los trabajadores")
      );
    } finally {
      setLoading(false);
    }
  };

  const buscarPorRut = async () => {
    setLoading(true);
    setError("");
    limpiarResultados();

    try {
      const empresaParam = empresa === "ambas" ? "ambas" : Number(empresa);

      const respuesta = await buscarTrabajadorTalanaRequest(
        rut.trim(),
        empresaParam
      );

      if (respuesta.coincidencias) {
        setCoincidencias(respuesta.coincidencias);
      } else if (respuesta.data) {
        setPersona(respuesta.data);
      }
    } catch (err) {
      setError(
        obtenerMensajeError(err, "No se pudo consultar el trabajador")
      );
    } finally {
      setLoading(false);
    }
  };

  const consultar = () => {
    if (rut.trim()) {
      buscarPorRut();
    } else {
      listarTodos(1);
    }
  };

  useEffect(() => {
    listarTodos(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-600">
            RUT (opcional)
          </label>
          <input
            value={rut}
            onChange={(e) => setRut(e.target.value)}
            placeholder="21437577-8"
            className="rounded-xl border border-slate-300 px-4 py-2 focus:border-[#4E1743] focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-600">
            Empresa
          </label>
          <select
            value={empresa}
            onChange={(e) => setEmpresa(e.target.value)}
            className="rounded-xl border border-slate-300 px-4 py-2 focus:border-[#4E1743] focus:outline-none"
          >
            {empresaOptions.map((opcion) => (
              <option key={opcion.value} value={opcion.value}>
                {opcion.label}
              </option>
            ))}
            <option value="ambas">Ambas (solo búsqueda por RUT)</option>
          </select>
        </div>

        <button
          onClick={consultar}
          disabled={loading}
          className="rounded-xl bg-[#4E1743] px-6 py-2 font-semibold text-white transition hover:bg-[#3d1235] disabled:opacity-60"
        >
          {loading ? "Buscando..." : "Buscar"}
        </button>
      </div>

      <p className="mt-2 text-xs text-slate-400">
        Sin RUT, se listan todos los trabajadores de la empresa seleccionada.
        Haz clic en una fila para ver el detalle completo.
      </p>

      {error && <p className="mt-4 text-sm font-semibold text-red-600">{error}</p>}

      {persona && (
        <div className="mt-6 rounded-xl border border-slate-200 p-4">
          <PersonaDetalle persona={persona} />
        </div>
      )}

      {coincidencias.length > 0 && (
        <div className="mt-6 space-y-4">
          {coincidencias.map((coincidencia) => (
            <div
              key={coincidencia.empresaId}
              className="rounded-xl border border-slate-200 p-4"
            >
              <p className="mb-2 text-xs font-bold uppercase text-slate-400">
                Empresa Talana ID {coincidencia.empresaId}
              </p>
              <PersonaDetalle persona={coincidencia.persona} />
            </div>
          ))}
        </div>
      )}

      {personas.length > 0 && (
        <>
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[600px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase text-slate-400">
                  <th className="py-2">RUT</th>
                  <th className="py-2">Nombre</th>
                  <th className="py-2">Email</th>
                  <th className="py-2">ID Talana</th>
                </tr>
              </thead>
              <tbody>
                {personas.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => {
                      setDetalle(item);
                      setModalAbierto(true);
                    }}
                    className="cursor-pointer border-b border-slate-100 hover:bg-slate-50"
                  >
                    <td className="py-2">{item.rut}</td>
                    <td className="py-2">
                      {[item.nombre, item.apellidoPaterno, item.apellidoMaterno]
                        .filter(Boolean)
                        .join(" ")}
                    </td>
                    <td className="py-2">{item.email || "-"}</td>
                    <td className="py-2">{item.id}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <button
              onClick={() => listarTodos(page - 1)}
              disabled={loading || page <= 1}
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
            >
              ← Anterior
            </button>

            <p className="text-xs text-slate-400">
              Página {page} · {total} trabajadores en total
            </p>

            <button
              onClick={() => listarTodos(page + 1)}
              disabled={loading || page * PAGE_SIZE_PERSONAS >= total}
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
            >
              Siguiente →
            </button>
          </div>
        </>
      )}

      {modalAbierto && (
        <TalanaDetalleModal
          titulo="Detalle del trabajador"
          datos={detalle}
          cargando={false}
          onClose={() => {
            setModalAbierto(false);
            setDetalle(null);
          }}
        />
      )}
    </div>
  );
}

function PersonaDetalle({ persona }: { persona: TalanaPersona }) {
  return (
    <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
      <p>
        <span className="font-semibold text-slate-600">Nombre: </span>
        {[persona.nombre, persona.apellidoPaterno, persona.apellidoMaterno]
          .filter(Boolean)
          .join(" ")}
      </p>
      <p>
        <span className="font-semibold text-slate-600">RUT: </span>
        {persona.rut}
      </p>
      <p>
        <span className="font-semibold text-slate-600">Email: </span>
        {persona.email || "-"}
      </p>
      <p>
        <span className="font-semibold text-slate-600">ID Talana: </span>
        {persona.id}
      </p>
    </div>
  );
}

const formatearFechaHoraCorta = (iso: string): string => {
  const fecha = new Date(iso);

  if (Number.isNaN(fecha.getTime())) return "—";

  return new Intl.DateTimeFormat("es-CL", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(fecha);
};

const formatearFechaCorta = (iso: string): string => {
  const fecha = new Date(`${iso}T00:00:00`);

  if (Number.isNaN(fecha.getTime())) return iso;

  return new Intl.DateTimeFormat("es-CL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(fecha);
};

const obtenerIniciales = (nombreCompleto: string): string => {
  const partes = nombreCompleto.trim().split(/\s+/).filter(Boolean);

  if (partes.length === 0) return "?";

  const primera = partes[0][0] ?? "";
  const segunda = partes.length > 1 ? partes[1][0] ?? "" : "";

  return (primera + segunda).toUpperCase();
};

function StatTile({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Users;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200 p-4">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#4E1743]/10 text-[#4E1743]">
        <Icon size={20} />
      </span>

      <div className="min-w-0">
        <p className="truncate text-xs font-semibold uppercase tracking-wide text-slate-500">
          {label}
        </p>
        <p className="truncate text-2xl font-bold text-slate-800">{value}</p>
      </div>
    </div>
  );
}

function MarcacionesTab() {
  const hoy = new Date().toISOString().slice(0, 10);

  const [desde, setDesde] = useState(hoy);
  const [hasta, setHasta] = useState(hoy);
  const [empresa, setEmpresa] = useState(
    String(EMPRESAS_TALANA.GRUPO_COLCHAGUA)
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [buscado, setBuscado] = useState(false);
  const [resultado, setResultado] =
    useState<ResultadoTrabajadoresConMarcacionesTalana | null>(null);

  const buscar = async () => {
    setLoading(true);
    setError("");
    setBuscado(true);

    try {
      const datos = await listarTrabajadoresConMarcacionesRequest(
        desde,
        hasta,
        Number(empresa)
      );

      setResultado(datos);
    } catch (err) {
      setError(
        obtenerMensajeError(err, "No se pudieron obtener las marcaciones")
      );
      setResultado(null);
    } finally {
      setLoading(false);
    }
  };

  const trabajadores = resultado?.trabajadores ?? [];
  const nombreEmpresa =
    empresaOptions.find((opcion) => opcion.value === empresa)?.label ?? "";

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <p className="mb-4 text-xs font-bold uppercase tracking-wide text-slate-400">
          Filtros de búsqueda
        </p>

        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-600">
              Desde
            </label>
            <input
              type="date"
              value={desde}
              onChange={(e) => setDesde(e.target.value)}
              className="rounded-xl border border-slate-300 px-4 py-2 focus:border-[#4E1743] focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-600">
              Hasta
            </label>
            <input
              type="date"
              value={hasta}
              onChange={(e) => setHasta(e.target.value)}
              className="rounded-xl border border-slate-300 px-4 py-2 focus:border-[#4E1743] focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-600">
              Empresa
            </label>
            <select
              value={empresa}
              onChange={(e) => setEmpresa(e.target.value)}
              className="rounded-xl border border-slate-300 px-4 py-2 focus:border-[#4E1743] focus:outline-none"
            >
              {empresaOptions.map((opcion) => (
                <option key={opcion.value} value={opcion.value}>
                  {opcion.label}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={buscar}
            disabled={loading}
            className="rounded-xl bg-[#4E1743] px-6 py-2 font-semibold text-white transition hover:bg-[#3d1235] disabled:opacity-60"
          >
            {loading ? "Consultando..." : "Consultar"}
          </button>
        </div>

        <p className="mt-3 text-xs text-slate-400">
          El período máximo permitido por Talana es de 31 días.
        </p>

        {error && (
          <p className="mt-4 text-sm font-semibold text-red-600">{error}</p>
        )}
      </div>

      {loading && (
        <p className="text-center text-sm text-slate-400">
          Consultando marcaciones en Talana...
        </p>
      )}

      {!loading && resultado && trabajadores.length > 0 && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatTile
              icon={Users}
              label="Trabajadores con marca"
              value={String(resultado.trabajadoresUnicos)}
            />
            <StatTile
              icon={Fingerprint}
              label="Total marcaciones"
              value={String(resultado.totalMarcaciones)}
            />
            <StatTile
              icon={CalendarRange}
              label={nombreEmpresa}
              value={
                desde === hasta
                  ? formatearFechaCorta(desde)
                  : `${formatearFechaCorta(desde)} – ${formatearFechaCorta(hasta)}`
              }
            />
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead>
                  <tr className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <th className="px-4 py-3 font-bold">Trabajador</th>
                    <th className="px-4 py-3 font-bold">RUT</th>
                    <th className="px-4 py-3 font-bold">Marcaciones</th>
                    <th className="px-4 py-3 font-bold">Primera</th>
                    <th className="px-4 py-3 font-bold">Última</th>
                  </tr>
                </thead>
                <tbody>
                  {trabajadores.map((trabajador) => (
                    <tr
                      key={trabajador.talanaPersonaId}
                      className="border-t border-slate-100 transition hover:bg-slate-50"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#4E1743]/10 text-xs font-bold text-[#4E1743]">
                            {obtenerIniciales(trabajador.nombreCompleto)}
                          </span>
                          <span className="font-medium text-slate-700">
                            {trabajador.nombreCompleto}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {trabajador.rut}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center justify-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold tabular-nums text-emerald-700">
                          {trabajador.cantidadMarcaciones}
                        </span>
                      </td>
                      <td className="px-4 py-3 tabular-nums text-slate-500">
                        {formatearFechaHoraCorta(trabajador.primeraMarcacion)}
                      </td>
                      <td className="px-4 py-3 tabular-nums text-slate-500">
                        {formatearFechaHoraCorta(trabajador.ultimaMarcacion)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {!loading && buscado && trabajadores.length === 0 && !error && (
        <p className="rounded-2xl border border-dashed border-slate-300 bg-white py-10 text-center text-sm text-slate-400">
          No se encontraron marcaciones en el período y empresa seleccionados.
        </p>
      )}
    </div>
  );
}

function LiquidacionesTab() {
  const ahora = new Date();

  const [rut, setRut] = useState("");
  const [periodoAno, setPeriodoAno] = useState<string>(
    String(ahora.getFullYear())
  );
  const [periodoMes, setPeriodoMes] = useState<string>(
    String(ahora.getMonth() + 1)
  );
  const [tipoLiquidacion, setTipoLiquidacion] = useState<
    TipoLiquidacionTalana | ""
  >("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [liquidaciones, setLiquidaciones] = useState<TalanaLiquidacion[]>([]);
  const [comprobantesEnCurso, setComprobantesEnCurso] = useState<
    Record<string, boolean>
  >({});

  const [cursorSiguiente, setCursorSiguiente] = useState<string | null>(null);
  const [cursorAnterior, setCursorAnterior] = useState<string | null>(null);

  const [detalle, setDetalle] = useState<TalanaLiquidacion | null>(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);

  const buscar = async (cursor?: string) => {
    setLoading(true);
    setError("");

    try {
      const anoEfectivo = periodoAno || String(ahora.getFullYear());
      const mesEfectivo = periodoMes || String(ahora.getMonth() + 1);

      const datos = await listarLiquidacionesRequest({
        rut: rut.trim() || undefined,
        periodoAno: rut.trim() ? undefined : Number(anoEfectivo),
        periodoMes: rut.trim() ? undefined : Number(mesEfectivo),
        tipoLiquidacion: tipoLiquidacion || undefined,
        cursor,
        pageSize: 25,
      });

      const { next, previous } = extraerPaginacion(datos);

      setLiquidaciones(extraerLista<TalanaLiquidacion>(datos));
      setCursorSiguiente(extraerCursor(next));
      setCursorAnterior(extraerCursor(previous));
    } catch (err) {
      setError(
        obtenerMensajeError(err, "No se pudieron obtener las liquidaciones")
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    buscar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const nuevaBusqueda = () => {
    buscar();
  };

  const verComprobante = async (
    event: React.MouseEvent,
    id: string
  ) => {
    event.stopPropagation();
    setComprobantesEnCurso((prev) => ({ ...prev, [id]: true }));

    try {
      const comprobante = await obtenerComprobanteLiquidacionRequest(id);

      if (comprobante.url) {
        window.open(comprobante.url, "_blank", "noopener,noreferrer");
      } else {
        setError("El comprobante no tiene una URL disponible");
      }
    } catch (err) {
      setError(obtenerMensajeError(err, "No se pudo obtener el comprobante"));
    } finally {
      setComprobantesEnCurso((prev) => ({ ...prev, [id]: false }));
    }
  };

  const abrirDetalle = async (id: string) => {
    if (!id) return;

    setModalAbierto(true);
    setCargandoDetalle(true);
    setDetalle(null);

    try {
      const data = await obtenerLiquidacionRequest(id);
      setDetalle(data);
    } catch (err) {
      setError(
        obtenerMensajeError(err, "No se pudo obtener el detalle de la liquidación")
      );
      setModalAbierto(false);
    } finally {
      setCargandoDetalle(false);
    }
  };

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-600">
            RUT (opcional)
          </label>
          <input
            value={rut}
            onChange={(e) => setRut(e.target.value)}
            placeholder="21437577-8"
            className="rounded-xl border border-slate-300 px-4 py-2 focus:border-[#4E1743] focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-600">
            Año
          </label>
          <input
            type="number"
            value={periodoAno}
            onChange={(e) => setPeriodoAno(e.target.value)}
            placeholder="2026"
            className="w-24 rounded-xl border border-slate-300 px-4 py-2 focus:border-[#4E1743] focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-600">
            Mes
          </label>
          <input
            type="number"
            min={1}
            max={12}
            value={periodoMes}
            onChange={(e) => setPeriodoMes(e.target.value)}
            placeholder="7"
            className="w-20 rounded-xl border border-slate-300 px-4 py-2 focus:border-[#4E1743] focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-600">
            Tipo
          </label>
          <select
            value={tipoLiquidacion}
            onChange={(e) =>
              setTipoLiquidacion(e.target.value as TipoLiquidacionTalana | "")
            }
            className="rounded-xl border border-slate-300 px-4 py-2 focus:border-[#4E1743] focus:outline-none"
          >
            <option value="">Todos</option>
            {TIPOS_LIQUIDACION_TALANA.map((tipo) => (
              <option key={tipo} value={tipo}>
                {tipo}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={nuevaBusqueda}
          disabled={loading}
          className="rounded-xl bg-[#4E1743] px-6 py-2 font-semibold text-white transition hover:bg-[#3d1235] disabled:opacity-60"
        >
          {loading ? "Consultando..." : "Consultar"}
        </button>
      </div>

      <p className="mt-2 text-xs text-slate-400">
        Sin RUT, se listan todas las liquidaciones del período indicado. Haz
        clic en una fila para ver el detalle completo.
      </p>

      {error && <p className="mt-4 text-sm font-semibold text-red-600">{error}</p>}

      {liquidaciones.length > 0 && (
        <>
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase text-slate-400">
                  <th className="py-2">RUT</th>
                  <th className="py-2">Tipo</th>
                  <th className="py-2">Total haberes</th>
                  <th className="py-2">Total descuentos</th>
                  <th className="py-2">Líquido</th>
                  <th className="py-2">Comprobante</th>
                </tr>
              </thead>
              <tbody>
                {liquidaciones.map((liquidacion) => {
                  const id = String(liquidacion.id ?? "");

                  return (
                    <tr
                      key={id}
                      onClick={() => abrirDetalle(id)}
                      className="cursor-pointer border-b border-slate-100 hover:bg-slate-50"
                    >
                      <td className="py-2">{liquidacion.rut}</td>
                      <td className="py-2">{liquidacion.tipoLiquidacion}</td>
                      <td className="py-2">
                        {liquidacion.totalHaberes ?? "-"}
                      </td>
                      <td className="py-2">
                        {liquidacion.totalDescuentos ?? "-"}
                      </td>
                      <td className="py-2">{liquidacion.liquido ?? "-"}</td>
                      <td className="py-2">
                        <button
                          onClick={(event) => verComprobante(event, id)}
                          disabled={!id || comprobantesEnCurso[id]}
                          className="font-semibold text-[#4E1743] underline disabled:opacity-50"
                        >
                          {comprobantesEnCurso[id] ? "Abriendo..." : "Ver PDF"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <button
              onClick={() => buscar(cursorAnterior ?? undefined)}
              disabled={loading || !cursorAnterior}
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
            >
              ← Anterior
            </button>

            <button
              onClick={() => buscar(cursorSiguiente ?? undefined)}
              disabled={loading || !cursorSiguiente}
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
            >
              Siguiente →
            </button>
          </div>
        </>
      )}

      {modalAbierto && (
        <TalanaDetalleModal
          titulo="Detalle de liquidación"
          datos={detalle}
          cargando={cargandoDetalle}
          onClose={() => {
            setModalAbierto(false);
            setDetalle(null);
          }}
        />
      )}
    </div>
  );
}

const humanizarClave = (clave: string): string => {
  const conEspacios = clave
    .replace(/_/g, " ")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .toLowerCase();

  return conEspacios.charAt(0).toUpperCase() + conEspacios.slice(1);
};

const esValorSimple = (valor: unknown): boolean =>
  valor === null ||
  valor === undefined ||
  typeof valor === "string" ||
  typeof valor === "number" ||
  typeof valor === "boolean";

function ValorSimple({ valor }: { valor: unknown }) {
  if (valor === null || valor === undefined || valor === "") {
    return <span className="text-slate-400">—</span>;
  }

  if (typeof valor === "boolean") {
    return <span>{valor ? "Sí" : "No"}</span>;
  }

  return <span>{String(valor)}</span>;
}

function ObjetoAnidado({ datos }: { datos: Record<string, unknown> }) {
  const entradas = Object.entries(datos).filter(
    ([, valor]) => valor !== undefined
  );

  if (entradas.length === 0) {
    return <p className="text-sm text-slate-400">—</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
      {entradas.map(([clave, valor]) => (
        <CampoDetalle key={clave} clave={clave} valor={valor} anidado />
      ))}
    </div>
  );
}

function ListaValores({ lista }: { lista: unknown[] }) {
  if (lista.length === 0) {
    return <p className="text-sm text-slate-400">Sin registros</p>;
  }

  if (lista.every(esValorSimple)) {
    return (
      <div className="flex flex-wrap gap-1.5">
        {lista.map((item, indice) => (
          <span
            key={indice}
            className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600"
          >
            <ValorSimple valor={item} />
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {lista.map((item, indice) => (
        <div
          key={indice}
          className="rounded-lg border border-slate-200 bg-slate-50/60 p-3"
        >
          <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-slate-400">
            #{indice + 1}
          </p>
          {item && typeof item === "object" ? (
            <ObjetoAnidado datos={item as Record<string, unknown>} />
          ) : (
            <p className="text-sm text-slate-700">
              <ValorSimple valor={item} />
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

function CampoDetalle({
  clave,
  valor,
  anidado = false,
}: {
  clave: string;
  valor: unknown;
  anidado?: boolean;
}) {
  const esObjeto =
    valor !== null && typeof valor === "object" && !Array.isArray(valor);
  const esLista = Array.isArray(valor);

  if (esObjeto) {
    return (
      <div className={anidado ? "" : "sm:col-span-2"}>
        <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-slate-400">
          {humanizarClave(clave)}
        </p>
        <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
          <ObjetoAnidado datos={valor as Record<string, unknown>} />
        </div>
      </div>
    );
  }

  if (esLista) {
    return (
      <div className={anidado ? "" : "sm:col-span-2"}>
        <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-slate-400">
          {humanizarClave(clave)}
        </p>
        <ListaValores lista={valor} />
      </div>
    );
  }

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {humanizarClave(clave)}
      </p>
      <p className="text-sm font-medium text-slate-700">
        <ValorSimple valor={valor} />
      </p>
    </div>
  );
}

function TalanaDetalleModal({
  titulo,
  datos,
  cargando,
  onClose,
}: {
  titulo: string;
  datos: Record<string, unknown> | null;
  cargando: boolean;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-start justify-between border-b border-slate-100 pb-4">
          <h3 className="text-xl font-bold text-slate-800">{titulo}</h3>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            ✕
          </button>
        </div>

        {cargando && (
          <p className="text-sm text-slate-500">Cargando detalle...</p>
        )}

        {!cargando && datos && (
          <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
            {Object.entries(datos)
              .filter(([, valor]) => valor !== undefined)
              .map(([clave, valor]) => (
                <CampoDetalle key={clave} clave={clave} valor={valor} />
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
