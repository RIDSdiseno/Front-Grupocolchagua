import { useCallback, useEffect, useMemo, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import {
  crearCampanaRequest,
  eliminarCampanaRequest,
  enviarCampanaRequest,
  listarCampanasRequest,
} from "../services/mailing.service";
import type { MailingCampana } from "../types/mailing";

type Tab = "campanas" | "nueva";
type ModoEditor = "normal" | "html";

const gruposDestinatarios = [
  "Todos los trabajadores",
  "Postulantes activos",
  "Supervisores y jefatura",
  "Administración",
  "Personalizado",
];

const estadoCampanaConfig: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  BORRADOR: {
    label: "Borrador",
    color: "text-slate-600",
    bg: "bg-slate-100",
  },
  PROGRAMADA: {
    label: "Programada",
    color: "text-blue-700",
    bg: "bg-blue-100",
  },
  ENVIADA: {
    label: "Enviada",
    color: "text-emerald-700",
    bg: "bg-emerald-100",
  },
  ENVIADA_CON_ERRORES: {
    label: "Enviada con errores",
    color: "text-amber-700",
    bg: "bg-amber-100",
  },
};

const plantillas = [
  {
    nombre: "Bienvenida",
    asunto: "¡Bienvenido/a a Grupo Colchagua!",
    html: `
      <h2 style="margin:0 0 12px;color:#4E1743;">Bienvenido/a a Grupo Colchagua</h2>
      <p>Estimado/a <strong>[NOMBRE]</strong>,</p>
      <p>Nos complace darte la bienvenida al equipo de <strong>Grupo Colchagua</strong>. Estamos seguros de que tu incorporación será un gran aporte.</p>
      <p>Saludos cordiales,<br/><strong>Equipo de RRHH</strong></p>
    `,
  },
  {
    nombre: "Entrevista",
    asunto: "Invitación a entrevista – [CARGO]",
    html: `
      <h2 style="margin:0 0 12px;color:#4E1743;">Invitación a entrevista</h2>
      <p>Estimado/a <strong>[NOMBRE]</strong>,</p>
      <p>Te informamos que has sido seleccionado/a para participar en una entrevista para el cargo de <strong>[CARGO]</strong>.</p>
      <p>Por favor confirma tu disponibilidad respondiendo este correo.</p>
      <p>Saludos,<br/><strong>Equipo de Selección</strong></p>
    `,
  },
  {
    nombre: "Liquidación",
    asunto: "Tu liquidación de sueldo está disponible",
    html: `
      <h2 style="margin:0 0 12px;color:#4E1743;">Liquidación disponible</h2>
      <p>Estimado/a <strong>[NOMBRE]</strong>,</p>
      <p>Te informamos que tu liquidación de sueldo correspondiente al mes de <strong>[MES]</strong> ya se encuentra disponible.</p>
      <p>Saludos,<br/><strong>RRHH Grupo Colchagua</strong></p>
    `,
  },
];

const escaparHtml = (texto: string) =>
  texto
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "<br />");

const envolverHtmlCorreo = (contenido: string) => {
  const contenidoLimpio = contenido.trim();

  const yaEsHtmlCompleto =
    contenidoLimpio.includes("<table") ||
    contenidoLimpio.includes("<html") ||
    contenidoLimpio.includes("<body");

  if (yaEsHtmlCompleto) return contenidoLimpio;

  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f8;padding:24px;font-family:Arial,Helvetica,sans-serif;">
      <tr>
        <td align="center">
          <table width="100%" cellpadding="0" cellspacing="0" style="max-width:680px;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #e5e7eb;">
            <tr>
              <td style="background:#4E1743;padding:24px;color:#ffffff;">
                <h1 style="margin:0;font-size:22px;">Grupo Colchagua</h1>
                <p style="margin:6px 0 0;font-size:13px;">Comunicaciones internas</p>
              </td>
            </tr>

            <tr>
              <td style="padding:28px;color:#334155;font-size:15px;line-height:1.65;">
                ${contenidoLimpio}
              </td>
            </tr>

            <tr>
              <td style="background:#f8fafc;padding:16px 28px;color:#64748b;font-size:12px;text-align:center;">
                Este correo fue enviado desde administrador@grupocolchagua.cl
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `;
};

const limpiarHtml = (html: string) => html.trim();

export default function Mailing() {
  const [campanas, setCampanas] = useState<MailingCampana[]>([]);
  const [tab, setTab] = useState<Tab>("campanas");
  const [modalVer, setModalVer] = useState<MailingCampana | null>(null);
  const [confirmarEnvio, setConfirmarEnvio] =
    useState<MailingCampana | null>(null);

  const [asunto, setAsunto] = useState("");
  const [cuerpoHtml, setCuerpoHtml] = useState("");
  const [grupo, setGrupo] = useState("Todos los trabajadores");
  const [emailsPersonalizados, setEmailsPersonalizados] = useState("");
  const [programar, setProgramar] = useState(false);
  const [fechaProgramada, setFechaProgramada] = useState("");
  const [modoEditor, setModoEditor] = useState<ModoEditor>("normal");

  const [loading, setLoading] = useState(false);
  const [enviandoId, setEnviandoId] = useState<number | null>(null);
  const [error, setError] = useState("");

  const htmlFinal = useMemo(() => {
    if (modoEditor === "normal") {
      return envolverHtmlCorreo(escaparHtml(cuerpoHtml));
    }

    return envolverHtmlCorreo(cuerpoHtml);
  }, [cuerpoHtml, modoEditor]);

  const cargarCampanas = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const data = await listarCampanasRequest();
      setCampanas(data);
    } catch (err: any) {
      setError(
        err?.response?.data?.message || "No se pudieron cargar las campañas."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void cargarCampanas();
  }, [cargarCampanas]);

  const resetForm = () => {
    setAsunto("");
    setCuerpoHtml("");
    setGrupo("Todos los trabajadores");
    setEmailsPersonalizados("");
    setProgramar(false);
    setFechaProgramada("");
    setModoEditor("normal");
  };

  const cargarPlantilla = (plantilla: (typeof plantillas)[0]) => {
    setAsunto(plantilla.asunto);
    setCuerpoHtml(limpiarHtml(plantilla.html));
    setModoEditor("html");
  };

  const insertarHtml = (antes: string, despues = "") => {
    const textarea = document.getElementById(
      "mail-editor-html"
    ) as HTMLTextAreaElement | null;

    if (!textarea) {
      setCuerpoHtml((prev) => `${prev}${antes}${despues}`);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = cuerpoHtml.substring(start, end);

    setCuerpoHtml(
      cuerpoHtml.substring(0, start) +
        antes +
        selected +
        despues +
        cuerpoHtml.substring(end)
    );
  };

  const guardarCampana = async (enviarAhora: boolean) => {
    try {
      if (!asunto.trim() || !cuerpoHtml.trim()) {
        alert("Completa el asunto y el contenido del correo.");
        return;
      }

      if (grupo === "Personalizado" && !emailsPersonalizados.trim()) {
        alert("Ingresa al menos un correo personalizado.");
        return;
      }

      setLoading(true);
      setError("");

      const response = await crearCampanaRequest({
        asunto: asunto.trim(),
        cuerpo: htmlFinal,
        grupo,
        emailsPersonalizados:
          grupo === "Personalizado" ? emailsPersonalizados : undefined,
        fechaProgramada: programar ? fechaProgramada : null,
      });

      if (enviarAhora && response.campana?.id) {
        await enviarCampanaRequest(response.campana.id);
      }

      resetForm();
      setTab("campanas");
      await cargarCampanas();
    } catch (err: any) {
      setError(
        err?.response?.data?.message || "No se pudo guardar la campaña."
      );
    } finally {
      setLoading(false);
    }
  };

  const enviarCampana = async (campana: MailingCampana) => {
    try {
      setEnviandoId(campana.id);
      setError("");

      await enviarCampanaRequest(campana.id);

      setConfirmarEnvio(null);
      setModalVer(null);
      await cargarCampanas();
    } catch (err: any) {
      setError(err?.response?.data?.message || "No se pudo enviar la campaña.");
    } finally {
      setEnviandoId(null);
    }
  };

  const eliminar = async (id: number) => {
    if (!confirm("¿Eliminar esta campaña?")) return;

    try {
      setLoading(true);
      setError("");

      await eliminarCampanaRequest(id);

      if (modalVer?.id === id) setModalVer(null);
      await cargarCampanas();
    } catch (err: any) {
      setError(
        err?.response?.data?.message || "No se pudo eliminar la campaña."
      );
    } finally {
      setLoading(false);
    }
  };

  const contadores = {
    total: campanas.length,
    enviadas: campanas.filter((c) => c.estado === "ENVIADA").length,
    programadas: campanas.filter((c) => c.estado === "PROGRAMADA").length,
    totalEnviados: campanas.reduce((acc, c) => acc + (c.enviados || 0), 0),
  };

  const formatearFecha = (fecha?: string | null) => {
    if (!fecha) return "—";

    const parsed = new Date(fecha);

    if (Number.isNaN(parsed.getTime())) return "—";

    return parsed.toLocaleString("es-CL");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Mailing</h2>
            <p className="text-sm text-slate-500">
              Diseña y envía correos desde administrador@grupocolchagua.cl
            </p>
          </div>

          <button
            onClick={() => {
              resetForm();
              setTab("nueva");
            }}
            className="rounded-xl bg-[#4E1743] px-5 py-2.5 font-semibold text-white transition hover:bg-[#3d1235]"
          >
            + Nueva campaña
          </button>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Total campañas", value: contadores.total },
            { label: "Enviadas", value: contadores.enviadas },
            { label: "Programadas", value: contadores.programadas },
            { label: "Correos enviados", value: contadores.totalEnviados },
          ].map((m) => (
            <div
              key={m.label}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <p className="text-2xl font-bold text-slate-800">{m.value}</p>
              <p className="text-xs text-slate-500">{m.label}</p>
            </div>
          ))}
        </div>

        <div className="flex w-fit gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
          {(["campanas", "nueva"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-lg px-5 py-2 text-sm font-semibold transition ${
                tab === t
                  ? "bg-[#4E1743] text-white shadow"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              {t === "campanas" ? "Campañas" : "Nueva campaña"}
            </button>
          ))}
        </div>

        {tab === "campanas" && (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-4 text-left">Asunto</th>
                    <th className="hidden px-5 py-4 text-left sm:table-cell">
                      Grupo
                    </th>
                    <th className="hidden px-5 py-4 text-left md:table-cell">
                      Fecha
                    </th>
                    <th className="hidden px-5 py-4 text-right lg:table-cell">
                      Destinatarios
                    </th>
                    <th className="hidden px-5 py-4 text-right lg:table-cell">
                      Enviados
                    </th>
                    <th className="px-5 py-4 text-left">Estado</th>
                    <th className="px-5 py-4 text-right">Acciones</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="py-12 text-center text-slate-400"
                      >
                        Cargando campañas...
                      </td>
                    </tr>
                  ) : campanas.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="py-12 text-center text-slate-400"
                      >
                        No hay campañas aún.
                      </td>
                    </tr>
                  ) : (
                    campanas.map((c) => {
                      const config =
                        estadoCampanaConfig[c.estado] ||
                        estadoCampanaConfig.BORRADOR;

                      return (
                        <tr key={c.id} className="transition hover:bg-slate-50">
                          <td className="px-5 py-4">
                            <p className="line-clamp-1 font-semibold text-slate-800">
                              {c.asunto}
                            </p>
                            <p className="line-clamp-1 text-xs text-slate-400 sm:hidden">
                              {c.grupo}
                            </p>
                          </td>

                          <td className="hidden px-5 py-4 text-slate-600 sm:table-cell">
                            {c.grupo}
                          </td>

                          <td className="hidden px-5 py-4 text-slate-600 md:table-cell">
                            {formatearFecha(c.fechaProgramada || c.createdAt)}
                          </td>

                          <td className="hidden px-5 py-4 text-right font-semibold text-slate-700 lg:table-cell">
                            {c._count?.destinatarios ?? "—"}
                          </td>

                          <td className="hidden px-5 py-4 text-right font-semibold text-slate-700 lg:table-cell">
                            {c.enviados ?? 0}
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${config.bg} ${config.color}`}
                            >
                              {config.label}
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

                              {c.estado !== "ENVIADA" && (
                                <button
                                  onClick={() => setConfirmarEnvio(c)}
                                  disabled={enviandoId === c.id}
                                  className="rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 transition hover:bg-emerald-600 hover:text-white disabled:opacity-60"
                                >
                                  {enviandoId === c.id
                                    ? "Enviando..."
                                    : "Enviar"}
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
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === "nueva" && (
          <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
            <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div>
                <p className="mb-2 text-sm font-semibold text-slate-600">
                  Plantillas rápidas
                </p>

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

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-600">
                  Destinatarios *
                </label>

                <select
                  value={grupo}
                  onChange={(e) => setGrupo(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-[#4E1743] focus:outline-none focus:ring-2 focus:ring-[#4E1743]/20"
                >
                  {gruposDestinatarios.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>

              {grupo === "Personalizado" && (
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-600">
                    Correos personalizados{" "}
                    <span className="font-normal text-slate-400">
                      separados por coma
                    </span>
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

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-600">
                  Asunto *
                </label>

                <input
                  type="text"
                  value={asunto}
                  onChange={(e) => setAsunto(e.target.value)}
                  placeholder="Escribe el asunto del correo..."
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-[#4E1743] focus:outline-none focus:ring-2 focus:ring-[#4E1743]/20"
                />
              </div>

              <div>
                <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <label className="block text-sm font-semibold text-slate-600">
                    Contenido del correo *
                  </label>

                  <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-1">
                    <button
                      type="button"
                      onClick={() => setModoEditor("normal")}
                      className={`rounded-md px-3 py-1 text-xs font-semibold ${
                        modoEditor === "normal"
                          ? "bg-white text-[#4E1743] shadow-sm"
                          : "text-slate-500"
                      }`}
                    >
                      Correo normal
                    </button>

                    <button
                      type="button"
                      onClick={() => setModoEditor("html")}
                      className={`rounded-md px-3 py-1 text-xs font-semibold ${
                        modoEditor === "html"
                          ? "bg-white text-[#4E1743] shadow-sm"
                          : "text-slate-500"
                      }`}
                    >
                      HTML avanzado
                    </button>
                  </div>
                </div>

                {modoEditor === "normal" ? (
                  <textarea
                    value={cuerpoHtml}
                    onChange={(e) => setCuerpoHtml(e.target.value)}
                    rows={12}
                    placeholder="Escribe el mensaje del correo..."
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-[#4E1743] focus:outline-none focus:ring-2 focus:ring-[#4E1743]/20"
                  />
                ) : (
                  <>
                    <div className="mb-2 flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2">
                      <button
                        type="button"
                        onClick={() => insertarHtml("<strong>", "</strong>")}
                        className="rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-100"
                      >
                        Negrita
                      </button>

                      <button
                        type="button"
                        onClick={() => insertarHtml("<em>", "</em>")}
                        className="rounded-lg bg-white px-3 py-1.5 text-xs font-medium italic text-slate-700 shadow-sm hover:bg-slate-100"
                      >
                        Cursiva
                      </button>

                      <button
                        type="button"
                        onClick={() => insertarHtml("<u>", "</u>")}
                        className="rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-slate-700 underline shadow-sm hover:bg-slate-100"
                      >
                        Subrayado
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          insertarHtml(
                            '<a href="https://grupocolchagua.cl" style="color:#4E1743;font-weight:bold;">',
                            "</a>"
                          )
                        }
                        className="rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-100"
                      >
                        Link
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          insertarHtml(
                            '<a href="https://grupocolchagua.cl" style="display:inline-block;background:#4E1743;color:white;text-decoration:none;padding:12px 18px;border-radius:10px;font-weight:bold;">',
                            "</a>"
                          )
                        }
                        className="rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-100"
                      >
                        Botón
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          insertarHtml(
                            '<ul style="padding-left:20px;margin:12px 0;"><li>',
                            "</li></ul>"
                          )
                        }
                        className="rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-100"
                      >
                        Lista
                      </button>
                    </div>

                    <textarea
                      id="mail-editor-html"
                      value={cuerpoHtml}
                      onChange={(e) => setCuerpoHtml(e.target.value)}
                      rows={14}
                      placeholder="Pega o escribe el HTML completo del correo..."
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 font-mono text-sm focus:border-[#4E1743] focus:outline-none focus:ring-2 focus:ring-[#4E1743]/20"
                    />
                  </>
                )}

                <p className="mt-1 text-right text-xs text-slate-400">
                  {cuerpoHtml.length} caracteres
                </p>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="programar"
                  checked={programar}
                  onChange={(e) => setProgramar(e.target.checked)}
                  className="h-4 w-4 accent-[#4E1743]"
                />

                <label
                  htmlFor="programar"
                  className="text-sm font-medium text-slate-600"
                >
                  Programar envío para una fecha específica
                </label>
              </div>

              {programar && (
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-600">
                    Fecha de envío
                  </label>

                  <input
                    type="datetime-local"
                    value={fechaProgramada}
                    onChange={(e) => setFechaProgramada(e.target.value)}
                    className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-[#4E1743] focus:outline-none"
                  />
                </div>
              )}

              <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
                <button
                  onClick={() => guardarCampana(false)}
                  disabled={loading}
                  className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-60"
                >
                  Guardar campaña
                </button>

                <button
                  onClick={() => guardarCampana(!programar)}
                  disabled={loading}
                  className="rounded-xl bg-[#4E1743] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#3d1235] disabled:opacity-60"
                >
                  {loading
                    ? "Procesando..."
                    : programar
                    ? "Programar envío"
                    : "Enviar ahora"}
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-3">
                <p className="text-sm font-bold text-slate-700">
                  Vista previa tipo Outlook
                </p>
                <p className="text-xs text-slate-400">
                  Así se verá el contenido base del correo.
                </p>
              </div>

              <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                <div className="border-b border-slate-200 bg-white px-4 py-3">
                  <p className="text-xs text-slate-400">De</p>
                  <p className="text-sm font-semibold text-slate-700">
                    Grupo Colchagua &lt;administrador@grupocolchagua.cl&gt;
                  </p>

                  <p className="mt-2 text-xs text-slate-400">Para</p>
                  <p className="text-sm text-slate-700">{grupo}</p>

                  <p className="mt-2 text-xs text-slate-400">Asunto</p>
                  <p className="text-sm font-semibold text-slate-800">
                    {asunto || "(Sin asunto)"}
                  </p>
                </div>

                <iframe
                  title="preview-correo"
                  srcDoc={htmlFinal}
                  className="h-[720px] w-full bg-white"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {modalVer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-1 flex items-start justify-between">
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                  estadoCampanaConfig[modalVer.estado]?.bg || "bg-slate-100"
                } ${
                  estadoCampanaConfig[modalVer.estado]?.color ||
                  "text-slate-600"
                }`}
              >
                {estadoCampanaConfig[modalVer.estado]?.label ||
                  modalVer.estado}
              </span>

              <button
                onClick={() => setModalVer(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <h3 className="mt-3 text-xl font-bold text-slate-800">
              {modalVer.asunto}
            </h3>

            <p className="mb-4 text-sm text-slate-500">
              {modalVer.grupo} · {formatearFecha(modalVer.createdAt)}
            </p>

            <iframe
              title="modal-preview-correo"
              srcDoc={modalVer.cuerpo}
              className="mb-4 h-[680px] w-full rounded-xl border border-slate-200 bg-white"
            />

            <p className="mb-4 text-sm text-slate-500">
              Enviados: <strong>{modalVer.enviados}</strong> · Errores:{" "}
              <strong>{modalVer.errores}</strong>
            </p>

            <div className="flex justify-end gap-3">
              {modalVer.estado !== "ENVIADA" && (
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

      {confirmarEnvio && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl">
            <h3 className="text-lg font-bold text-slate-800">
              ¿Confirmar envío?
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Se enviará <strong>{confirmarEnvio.asunto}</strong> a{" "}
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
                disabled={enviandoId === confirmarEnvio.id}
                className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
              >
                {enviandoId === confirmarEnvio.id ? "Enviando..." : "Enviar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}