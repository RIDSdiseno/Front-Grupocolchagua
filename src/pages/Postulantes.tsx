import { useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";

type Estado = "Pendiente" | "En revisión" | "Entrevista" | "Aceptado" | "Rechazado";

interface Postulante {
  id: number;
  nombre: string;
  email: string;
  telefono: string;
  cargo: string;
  empresa: string;
  fechaPostulacion: string;
  estado: Estado;
  nota?: string;
}

const estadoConfig: Record<Estado, { color: string; bg: string }> = {
  Pendiente:      { color: "text-amber-700",   bg: "bg-amber-100" },
  "En revisión":  { color: "text-blue-700",    bg: "bg-blue-100" },
  Entrevista:     { color: "text-violet-700",  bg: "bg-violet-100" },
  Aceptado:       { color: "text-emerald-700", bg: "bg-emerald-100" },
  Rechazado:      { color: "text-red-700",     bg: "bg-red-100" },
};

const estadosLista: Estado[] = ["Pendiente", "En revisión", "Entrevista", "Aceptado", "Rechazado"];

const datosIniciales: Postulante[] = [
  { id: 1, nombre: "Valentina Torres",  email: "v.torres@gmail.com",  telefono: "+56 9 1234 5678", cargo: "Analista Contable",  empresa: "Grupo Colchagua",  fechaPostulacion: "2025-05-10", estado: "Entrevista",  nota: "Experiencia sólida en contabilidad." },
  { id: 2, nombre: "Rodrigo Muñoz",     email: "r.munoz@hotmail.com", telefono: "+56 9 8765 4321", cargo: "Operario de Bodega", empresa: "Grupo Colchagua",    fechaPostulacion: "2025-05-12", estado: "Pendiente" },
  { id: 3, nombre: "Camila Reyes",      email: "creyes@gmail.com",    telefono: "+56 9 5555 1234", cargo: "Jefa de Turno",      empresa: "Grupo Santacruz",  fechaPostulacion: "2025-05-08", estado: "Aceptado",    nota: "Perfil ideal para el cargo." },
  { id: 4, nombre: "Felipe Araya",      email: "faraya@yahoo.com",    telefono: "+56 9 9999 8888", cargo: "Administrativo",     empresa: "Grupo Colchagua", fechaPostulacion: "2025-05-14", estado: "En revisión" },
  { id: 5, nombre: "Sofía Gutiérrez",   email: "sofia.g@gmail.com",   telefono: "+56 9 7777 2222", cargo: "Asistente de RRHH",  empresa: "Grupo Colchagua", fechaPostulacion: "2025-05-11", estado: "Rechazado",   nota: "No cumple requisitos mínimos." },
];

const cargosOpciones = ["Analista Contable", "Operario de Bodega", "Jefa de Turno", "Administrativo", "Asistente de RRHH", "Otro"];
const empresasOpciones = ["Grupo Colchagua", "Viña Colchagua", "Agrícola Sur"];

export default function Postulantes() {
  const [postulantes, setPostulantes] = useState<Postulante[]>(datosIniciales);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<Estado | "Todos">("Todos");
  const [modalVer, setModalVer] = useState<Postulante | null>(null);
  const [modalNuevo, setModalNuevo] = useState(false);
  const [form, setForm] = useState<Partial<Postulante>>({});

  const filtrados = postulantes.filter((p) => {
    const coincideBusqueda =
      p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.email.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.cargo.toLowerCase().includes(busqueda.toLowerCase());
    const coincideEstado = filtroEstado === "Todos" || p.estado === filtroEstado;
    return coincideBusqueda && coincideEstado;
  });

  const contadores = estadosLista.reduce((acc, e) => {
    acc[e] = postulantes.filter((p) => p.estado === e).length;
    return acc;
  }, {} as Record<Estado, number>);

  const cambiarEstado = (id: number, estado: Estado) => {
    setPostulantes((prev) => prev.map((p) => (p.id === id ? { ...p, estado } : p)));
    if (modalVer?.id === id) setModalVer((prev) => prev && { ...prev, estado });
  };

  const eliminar = (id: number) => {
    if (!confirm("¿Eliminar este postulante?")) return;
    setPostulantes((prev) => prev.filter((p) => p.id !== id));
    if (modalVer?.id === id) setModalVer(null);
  };

  const guardarNuevo = () => {
    if (!form.nombre || !form.email || !form.cargo || !form.empresa) {
      alert("Completa los campos obligatorios.");
      return;
    }
    const nuevo: Postulante = {
      id: Date.now(),
      nombre: form.nombre!,
      email: form.email!,
      telefono: form.telefono || "",
      cargo: form.cargo!,
      empresa: form.empresa!,
      fechaPostulacion: new Date().toISOString().split("T")[0],
      estado: "Pendiente",
      nota: form.nota,
    };
    setPostulantes((prev) => [nuevo, ...prev]);
    setModalNuevo(false);
    setForm({});
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Postulantes</h2>
            <p className="text-sm text-slate-500">Gestión de candidatos para Grupo Colchagua</p>
          </div>
          <button
            onClick={() => { setForm({}); setModalNuevo(true); }}
            className="rounded-xl bg-[#4E1743] px-5 py-2.5 font-semibold text-white transition hover:bg-[#3d1235]"
          >
            + Nuevo postulante
          </button>
        </div>

        {/* Contadores */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {estadosLista.map((e) => (
            <button
              key={e}
              onClick={() => setFiltroEstado(filtroEstado === e ? "Todos" : e)}
              className={`rounded-xl border-2 p-3 text-center transition ${
                filtroEstado === e
                  ? "border-[#4E1743] bg-[#4E1743] text-white"
                  : "border-slate-200 bg-white hover:border-[#4E1743]/40"
              }`}
            >
              <p className="text-2xl font-bold">{contadores[e]}</p>
              <p className="text-xs font-medium">{e}</p>
            </button>
          ))}
        </div>

        {/* Buscador y filtro */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            placeholder="Buscar por nombre, email o cargo..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm shadow-sm focus:border-[#4E1743] focus:outline-none focus:ring-2 focus:ring-[#4E1743]/20"
          />
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value as Estado | "Todos")}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm shadow-sm focus:border-[#4E1743] focus:outline-none"
          >
            <option value="Todos">Todos los estados</option>
            {estadosLista.map((e) => <option key={e} value={e}>{e}</option>)}
          </select>
        </div>

        {/* Tabla */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-4 text-left">Nombre</th>
                  <th className="px-5 py-4 text-left">Cargo postulado</th>
                  <th className="hidden px-5 py-4 text-left md:table-cell">Empresa</th>
                  <th className="hidden px-5 py-4 text-left lg:table-cell">Fecha</th>
                  <th className="px-5 py-4 text-left">Estado</th>
                  <th className="px-5 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtrados.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      No se encontraron postulantes.
                    </td>
                  </tr>
                ) : (
                  filtrados.map((p) => (
                    <tr key={p.id} className="transition hover:bg-slate-50">
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-800">{p.nombre}</p>
                        <p className="text-xs text-slate-400">{p.email}</p>
                      </td>
                      <td className="px-5 py-4 text-slate-600">{p.cargo}</td>
                      <td className="hidden px-5 py-4 text-slate-600 md:table-cell">{p.empresa}</td>
                      <td className="hidden px-5 py-4 text-slate-600 lg:table-cell">{p.fechaPostulacion}</td>
                      <td className="px-5 py-4">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${estadoConfig[p.estado].bg} ${estadoConfig[p.estado].color}`}>
                          {p.estado}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setModalVer(p)}
                            className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-[#4E1743] hover:text-white"
                          >
                            Ver
                          </button>
                          <button
                            onClick={() => eliminar(p.id)}
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
          <div className="border-t border-slate-100 px-5 py-3 text-xs text-slate-400">
            {filtrados.length} de {postulantes.length} postulante(s)
          </div>
        </div>
      </div>

      {/* Modal Ver postulante */}
      {modalVer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-start justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-800">{modalVer.nombre}</h3>
                <p className="text-sm text-slate-500">{modalVer.cargo} · {modalVer.empresa}</p>
              </div>
              <button onClick={() => setModalVer(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="mb-5 grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-semibold text-slate-500">Email</p>
                <p className="text-slate-700">{modalVer.email}</p>
              </div>
              <div>
                <p className="font-semibold text-slate-500">Teléfono</p>
                <p className="text-slate-700">{modalVer.telefono || "—"}</p>
              </div>
              <div>
                <p className="font-semibold text-slate-500">Fecha postulación</p>
                <p className="text-slate-700">{modalVer.fechaPostulacion}</p>
              </div>
              <div>
                <p className="font-semibold text-slate-500">Estado actual</p>
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${estadoConfig[modalVer.estado].bg} ${estadoConfig[modalVer.estado].color}`}>
                  {modalVer.estado}
                </span>
              </div>
            </div>

            {modalVer.nota && (
              <div className="mb-5 rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
                <p className="mb-1 font-semibold text-slate-500">Nota</p>
                {modalVer.nota}
              </div>
            )}

            <div className="mb-5">
              <p className="mb-2 text-sm font-semibold text-slate-600">Cambiar estado</p>
              <div className="flex flex-wrap gap-2">
                {estadosLista.map((e) => (
                  <button
                    key={e}
                    onClick={() => cambiarEstado(modalVer.id, e)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                      modalVer.estado === e
                        ? `${estadoConfig[e].bg} ${estadoConfig[e].color} ring-2 ring-offset-1 ring-[#4E1743]`
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => eliminar(modalVer.id)}
                className="rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
              >
                Eliminar
              </button>
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

      {/* Modal Nuevo postulante */}
      {modalNuevo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-800">Nuevo postulante</h3>
              <button onClick={() => setModalNuevo(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="space-y-4">
              {[
                { label: "Nombre completo *", key: "nombre", type: "text" },
                { label: "Email *", key: "email", type: "email" },
                { label: "Teléfono", key: "telefono", type: "tel" },
              ].map(({ label, key, type }) => (
                <div key={key}>
                  <label className="mb-1 block text-sm font-semibold text-slate-600">{label}</label>
                  <input
                    type={type}
                    value={(form as Record<string, string>)[key] || ""}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-[#4E1743] focus:outline-none focus:ring-2 focus:ring-[#4E1743]/20"
                  />
                </div>
              ))}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-600">Cargo *</label>
                  <select
                    value={form.cargo || ""}
                    onChange={(e) => setForm({ ...form, cargo: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-[#4E1743] focus:outline-none"
                  >
                    <option value="">Seleccionar...</option>
                    {cargosOpciones.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-600">Empresa *</label>
                  <select
                    value={form.empresa || ""}
                    onChange={(e) => setForm({ ...form, empresa: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-[#4E1743] focus:outline-none"
                  >
                    <option value="">Seleccionar...</option>
                    {empresasOpciones.map((e) => <option key={e} value={e}>{e}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-600">Nota interna</label>
                <textarea
                  value={form.nota || ""}
                  onChange={(e) => setForm({ ...form, nota: e.target.value })}
                  rows={3}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-[#4E1743] focus:outline-none focus:ring-2 focus:ring-[#4E1743]/20"
                  placeholder="Observaciones, comentarios..."
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setModalNuevo(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                onClick={guardarNuevo}
                className="rounded-xl bg-[#4E1743] px-5 py-2 text-sm font-semibold text-white hover:bg-[#3d1235]"
              >
                Guardar postulante
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}