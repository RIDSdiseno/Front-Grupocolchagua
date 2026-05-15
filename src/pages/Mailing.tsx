import { useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";

type EstadoCampana = "Borrador" | "Enviada" | "Programada";

interface Campana {
  id: number;
  asunto: string;
  cuerpo: string;
  destinatarios: string[];
  grupo: string;
  fecha: string;
  estado: EstadoCampana;
  enviados?: number;
}

const estadoCampanaConfig: Record<EstadoCampana, { color: string; bg: string }> = {
  Borrador:   { color: "text-slate-600",   bg: "bg-slate-100" },
  Enviada:    { color: "text-emerald-700", bg: "bg-emerald-100" },
  Programada: { color: "text-blue-700",    bg: "bg-blue-100" },
};

const gruposDestinatarios: Record<string, string[]> = {
  "Todos los trabajadores":  ["trabajadores@colchagua.cl"],
  "Postulantes activos":     ["postulantes@colchagua.cl"],
  "Supervisores y jefatura": ["supervisores@colchagua.cl"],
  "Administración":          ["admin@colchagua.cl"],
  "Personalizado":           [],
};

const campanasIniciales: Campana[] = [
  {
    id: 1,
    asunto: "Recordatorio: Entrega de documentos pendientes",
    cuerpo: "Estimados trabajadores, les recordamos que deben entregar los documentos pendientes antes del viernes.",
    destinatarios: ["trabajadores@colchagua.cl"],
    grupo: "Todos los trabajadores",
    fecha: "2025-05-10",
    estado: "Enviada",
    enviados: 142,
  },
  {
    id: 2,
    asunto: "Proceso de selección – Apertura de nuevas vacantes",
    cuerpo: "Nos complace informar que hemos abierto nuevos procesos de selección para distintos cargos.",
    destinatarios: ["postulantes@colchagua.cl"],
    grupo: "Postulantes activos",
    fecha: "2025-05-15",
    estado: "Programada",
    enviados: 0,
  },
  {
    id: 3,
    asunto: "Bienvenida nuevos ingresos – Mayo 2025",
    cuerpo: "Bienvenidos a Grupo Colchagua. Estamos muy contentos de tenerlos en nuestro equipo.",
    destinatarios: [],
    grupo: "Personalizado",
    fecha: "2025-05-08",
    estado: "Borrador",
  },
];

const plantillas = [
  {
    nombre: "Bienvenida nuevo trabajador",
    asunto: "¡Bienvenido/a a Grupo Colchagua!",
    cuerpo: "Estimado/a [NOMBRE],\n\nNos complace darte la bienvenida al equipo de Grupo Colchagua. Estamos seguros de que tu incorporación será un gran aporte.\n\nSaludos,\nEquipo de RRHH",
  },
  {
    nombre: "Convocatoria a entrevista",
    asunto: "Invitación a entrevista – [CARGO]",
    cuerpo: "Estimado/a [NOMBRE],\n\nTe informamos que has sido seleccionado/a para participar en una entrevista para el cargo de [CARGO]. Por favor confirma tu disponibilidad.\n\nSaludos,\nEquipo de Selección",
  },
  {
    nombre: "Liquidación disponible",
    asunto: "Tu liquidación de sueldo está disponible",
    cuerpo: "Estimado/a [NOMBRE],\n\nTe informamos que tu liquidación de sueldo correspondiente al mes de [MES] ya está disponible en el sistema.\n\nSaludos,\nRRHH Grupo Colchagua",
  },
];

export default function Mailing() {
  const [campanas, setCampanas] = useState<Campana[]>(campanasIniciales);
  const [tab, setTab] = useState<"campanas" | "nueva">("campanas");
  const [modalVer, setModalVer] = useState<Campana | null>(null);
  const [confirmarEnvio, setConfirmarEnvio] = useState<Campana | null>(null);

  const [asunto, setAsunto] = useState("");
  const [cuerpo, setCuerpo] = useState("");
  const [grupo, setGrupo] = useState("Todos los trabajadores");
  const [emailsPersonalizados, setEmailsPersonalizados] = useState("");
  const [programar, setProgramar] = useState(false);
  const [fechaProgramada, setFechaProgramada] = useState("");

  const resetForm = () => {
    setAsunto(""); setCuerpo(""); setGrupo("Todos los trabajadores");
    setEmailsPersonalizados(""); setProgramar(false); setFechaProgramada("");
  };

  const cargarPlantilla = (p: typeof plantillas[0]) => {
    setAsunto(p.asunto);
    setCuerpo(p.cuerpo);
  };

  const guardarCampana = (estado: EstadoCampana) => {
    if (!asunto.trim() || !cuerpo.trim()) {
      alert("Completa el asunto y el cuerpo del mensaje.");
      return;
    }
    const destinatarios =
      grupo === "Personalizado"
        ? emailsPersonalizados.split(",").map((e) => e.trim()).filter(Boolean)
        : gruposDestinatarios[grupo];

    const nueva: Campana = {
      id: Date.now(),
      asunto,
      cuerpo,
      destinatarios,
      grupo,
      fecha: fechaProgramada || new Date().toISOString().split("T")[0],
      estado,
    };
    setCampanas((prev) => [nueva, ...prev]);
    resetForm();
    setTab("campanas");
  };

  const enviarCampana = (c: Campana) => {
    setCampanas((prev) =>
      prev.map((p) => p.id === c.id ? { ...p, estado: "Enviada", enviados: 10 + Math.floor(Math.random() * 200) } : p)
    );
    setConfirmarEnvio(null);
    setModalVer(null);
  };

  const eliminar = (id: number) => {
    if (!confirm("¿Eliminar esta campaña?")) return;
    setCampanas((prev) => prev.filter((p) => p.id !== id));
    if (modalVer?.id === id) setModalVer(null);
  };

  const contadores = {
    total: campanas.length,
    enviadas: campanas.filter((c) => c.estado === "Enviada").length,
    programadas: campanas.filter((c) => c.estado === "Programada").length,
    totalEnviados: campanas.reduce((acc, c) => acc + (c.enviados || 0), 0),
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Mailing</h2>
            <p className="text-sm text-slate-500">Envíos masivos de correo a trabajadores y postulantes</p>
          </div>
          <button
            onClick={() => { setTab("nueva"); resetForm(); }}
            className="rounded-xl bg-[#4E1743] px-5 py-2.5 font-semibold text-white transition hover:bg-[#3d1235]"
          >
            + Nueva campaña
          </button>
        </div>

        {/* Métricas */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Total campañas",    value: contadores.total,         icon: "" },
            { label: "Enviadas",          value: contadores.enviadas,      icon: "" },
            { label: "Programadas",       value: contadores.programadas,   icon: "" },
            { label: "Correos enviados",  value: contadores.totalEnviados, icon: "" },
          ].map((m) => (
            <div key={m.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-1 text-2xl">{m.icon}</div>
              <p className="text-2xl font-bold text-slate-800">{m.value}</p>
              <p className="text-xs text-slate-500">{m.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-sm w-fit">
          {(["campanas", "nueva"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-lg px-5 py-2 text-sm font-semibold transition ${
                tab === t ? "bg-[#4E1743] text-white shadow" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              {t === "campanas" ? "Campañas" : "Nueva campaña"}
            </button>
          ))}
        </div>

        {/* Vista: Campañas */}
        {tab === "campanas" && (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-4 text-left">Asunto</th>
                    <th className="hidden px-5 py-4 text-left sm:table-cell">Grupo</th>
                    <th className="hidden px-5 py-4 text-left md:table-cell">Fecha</th>
                    <th className="hidden px-5 py-4 text-right lg:table-cell">Enviados</th>
                    <th className="px-5 py-4 text-left">Estado</th>
                    <th className="px-5 py-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {campanas.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">No hay campañas aún.</td>
                    </tr>
                  ) : (
                    campanas.map((c) => (
                      <tr key={c.id} className="transition hover:bg-slate-50">
                        <td className="px-5 py-4">
                          <p className="font-semibold text-slate-800 line-clamp-1">{c.asunto}</p>
                          <p className="text-xs text-slate-400 line-clamp-1 sm:hidden">{c.grupo}</p>
                        </td>
                        <td className="hidden px-5 py-4 text-slate-600 sm:table-cell">{c.grupo}</td>
                        <td className="hidden px-5 py-4 text-slate-600 md:table-cell">{c.fecha}</td>
                        <td className="hidden px-5 py-4 text-right font-semibold text-slate-700 lg:table-cell">
                          {c.enviados ?? "—"}
                        </td>
                        <td className="px-5 py-4">
                          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${estadoCampanaConfig[c.estado].bg} ${estadoCampanaConfig[c.estado].color}`}>
                            {c.estado}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => setModalVer(c)}
                              className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-[#4E1743] hover:text-white"
                            >
                              Ver
                            </button>
                            {c.estado !== "Enviada" && (
                              <button
                                onClick={() => setConfirmarEnvio(c)}
                                className="rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 transition hover:bg-emerald-600 hover:text-white"
                              >
                                Enviar
                              </button>
                            )}
                            <button
                              onClick={() => eliminar(c.id)}
                              className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-600 hover:text-white"
                            >
                              Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Vista: Nueva campaña */}
        {tab === "nueva" && (
          <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            {/* Plantillas */}
            <div>
              <p className="mb-2 text-sm font-semibold text-slate-600">Plantillas rápidas</p>
              <div className="flex flex-wrap gap-2">
                {plantillas.map((p) => (
                  <button
                    key={p.nombre}
                    onClick={() => cargarPlantilla(p)}
                    className="rounded-full border border-[#4E1743]/30 px-3 py-1.5 text-xs font-medium text-[#4E1743] transition hover:bg-[#4E1743] hover:text-white"
                  >
                    {p.nombre}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-px bg-slate-100" />

            {/* Destinatarios */}
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-600">Destinatarios *</label>
              <select
                value={grupo}
                onChange={(e) => setGrupo(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-[#4E1743] focus:outline-none focus:ring-2 focus:ring-[#4E1743]/20"
              >
                {Object.keys(gruposDestinatarios).map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            {grupo === "Personalizado" && (
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-600">
                  Correos personalizados <span className="text-slate-400 font-normal">(separados por coma)</span>
                </label>
                <input
                  type="text"
                  value={emailsPersonalizados}
                  onChange={(e) => setEmailsPersonalizados(e.target.value)}
                  placeholder="correo1@ejemplo.cl, correo2@ejemplo.cl"
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-[#4E1743] focus:outline-none focus:ring-2 focus:ring-[#4E1743]/20"
                />
              </div>
            )}

            {/* Asunto */}
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-600">Asunto *</label>
              <input
                type="text"
                value={asunto}
                onChange={(e) => setAsunto(e.target.value)}
                placeholder="Escribe el asunto del correo..."
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-[#4E1743] focus:outline-none focus:ring-2 focus:ring-[#4E1743]/20"
              />
            </div>

            {/* Cuerpo */}
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-600">Mensaje *</label>
              <textarea
                value={cuerpo}
                onChange={(e) => setCuerpo(e.target.value)}
                rows={8}
                placeholder="Redacta el contenido del correo..."
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-[#4E1743] focus:outline-none focus:ring-2 focus:ring-[#4E1743]/20"
              />
              <p className="mt-1 text-right text-xs text-slate-400">{cuerpo.length} caracteres</p>
            </div>

            {/* Programar */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="programar"
                checked={programar}
                onChange={(e) => setProgramar(e.target.checked)}
                className="h-4 w-4 accent-[#4E1743]"
              />
              <label htmlFor="programar" className="text-sm font-medium text-slate-600">
                Programar envío para una fecha específica
              </label>
            </div>

            {programar && (
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-600">Fecha de envío</label>
                <input
                  type="datetime-local"
                  value={fechaProgramada}
                  onChange={(e) => setFechaProgramada(e.target.value)}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-[#4E1743] focus:outline-none"
                />
              </div>
            )}

            {/* Preview */}
            {(asunto || cuerpo) && (
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Vista previa</p>
                <p className="font-bold text-slate-700">{asunto || "(Sin asunto)"}</p>
                <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">{cuerpo}</p>
              </div>
            )}

            {/* Acciones */}
            <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
              <button
                onClick={() => guardarCampana("Borrador")}
                className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Guardar como borrador
              </button>
              <button
                onClick={() => guardarCampana(programar ? "Programada" : "Enviada")}
                className="rounded-xl bg-[#4E1743] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#3d1235]"
              >
                {programar ? "Programar envío" : "Enviar ahora"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal ver campaña */}
      {modalVer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-1 flex items-start justify-between">
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${estadoCampanaConfig[modalVer.estado].bg} ${estadoCampanaConfig[modalVer.estado].color}`}>
                {modalVer.estado}
              </span>
              <button onClick={() => setModalVer(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <h3 className="mt-3 text-xl font-bold text-slate-800">{modalVer.asunto}</h3>
            <p className="mb-4 text-sm text-slate-500">{modalVer.grupo} · {modalVer.fecha}</p>
            <div className="mb-4 rounded-xl bg-slate-50 p-4 text-sm whitespace-pre-wrap text-slate-600">
              {modalVer.cuerpo}
            </div>
            {modalVer.enviados !== undefined && modalVer.estado === "Enviada" && (
              <p className="mb-4 text-sm text-slate-500">
                 Enviado a <strong>{modalVer.enviados}</strong> destinatarios
              </p>
            )}
            <div className="flex justify-end gap-3">
              {modalVer.estado !== "Enviada" && (
                <button
                  onClick={() => setConfirmarEnvio(modalVer)}
                  className="rounded-xl bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                >
                  Enviar ahora
                </button>
              )}
              <button
                onClick={() => setModalVer(null)}
                className="rounded-xl bg-[#4E1743] px-5 py-2 text-sm font-semibold text-white hover:bg-[#3d1235]"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal confirmar envío */}
      {confirmarEnvio && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl text-center">
            <div className="mb-3 text-4xl">📧</div>
            <h3 className="text-lg font-bold text-slate-800">¿Confirmar envío?</h3>
            <p className="mt-2 text-sm text-slate-500">
              Se enviará <strong>"{confirmarEnvio.asunto}"</strong> a{" "}
              <strong>{confirmarEnvio.grupo}</strong>.
            </p>
            <div className="mt-5 flex gap-3">
              <button
                onClick={() => setConfirmarEnvio(null)}
                className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                onClick={() => enviarCampana(confirmarEnvio)}
                className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                Enviar
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}