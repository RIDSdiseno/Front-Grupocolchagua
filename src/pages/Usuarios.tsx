import { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import type { Usuario, UsuarioForm } from "../services/Usuario.service";
import {
  listarUsuariosRequest,
  crearUsuarioRequest,
  actualizarUsuarioRequest,
  eliminarUsuarioRequest,
} from "../services/Usuario.service";

const initialForm: UsuarioForm = {
  nombre: "",
  email: "",
  password: "",
  rol: "ADMIN",
};

const obtenerMensajeError = (err: unknown, fallback: string) => {
  if (
    typeof err === "object" &&
    err !== null &&
    "response" in err &&
    typeof (err as { response?: { data?: { message?: unknown } } }).response
      ?.data?.message === "string"
  ) {
    return (err as { response: { data: { message: string } } }).response.data.message;
  }
  return fallback;
};

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [form, setForm] = useState<UsuarioForm>(initialForm);
  const [editando, setEditando] = useState<Usuario | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let activo = true;
    void (async () => {
      try {
        const data = await listarUsuariosRequest();
        if (activo) setUsuarios(data);
      } catch {
        if (activo) setError("Error al cargar usuarios");
      }
    })();
    return () => { activo = false; };
  }, []);

  const cargarUsuarios = async () => {
    const data = await listarUsuariosRequest();
    setUsuarios(data);
  };

  const abrirCrear = () => {
    setForm(initialForm);
    setEditando(null);
    setMensaje("");
    setError("");
    setModalOpen(true);
  };

  const abrirEditar = (usuario: Usuario) => {
    setEditando(usuario);
    setForm({
      nombre: usuario.nombre,
      email: usuario.email,
      password: "",
      rol: usuario.rol,
    });
    setMensaje("");
    setError("");
    setModalOpen(true);
  };

  const cerrarModal = () => {
    setForm(initialForm);
    setEditando(null);
    setModalOpen(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMensaje("");

    try {
      if (editando) {
        const payload: Partial<UsuarioForm> = {
          nombre: form.nombre,
          email: form.email,
          rol: form.rol,
        };
        if (form.password.trim()) payload.password = form.password;
        await actualizarUsuarioRequest(editando.id, payload);
        setMensaje("Usuario actualizado correctamente");
      } else {
        await crearUsuarioRequest(form);
        setMensaje("Usuario creado correctamente");
      }
      cerrarModal();
      await cargarUsuarios();
    } catch (err) {
      setError(obtenerMensajeError(err, "Error al guardar usuario"));
    } finally {
      setLoading(false);
    }
  };

  const eliminarUsuario = async (usuario: Usuario) => {
    const confirmar = confirm(`¿Eliminar al usuario ${usuario.nombre}?`);
    if (!confirmar) return;

    try {
      setError("");
      setMensaje("");
      await eliminarUsuarioRequest(usuario.id);
      setMensaje("Usuario eliminado correctamente");
      await cargarUsuarios();
    } catch (err) {
      setError(obtenerMensajeError(err, "Error al eliminar usuario"));
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-8 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="mb-2 text-sm font-bold uppercase tracking-wide text-[#4E1743]">
            Administración del sistema
          </p>
          <h2 className="text-3xl font-black text-slate-900">Usuarios</h2>
          <p className="mt-2 max-w-2xl text-slate-500">
            Gestiona los usuarios con acceso al sistema.
          </p>
        </div>
        <button
          type="button"
          onClick={abrirCrear}
          className="rounded-2xl bg-[#4E1743] px-6 py-4 font-black text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-[#3d1235]"
        >
          Nuevo usuario
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

      {/* Stats */}
      <div className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-bold text-slate-500">Total usuarios</p>
          <p className="mt-3 text-4xl font-black text-slate-900">{usuarios.length}</p>
          <p className="mt-2 text-sm text-slate-500">Con acceso al sistema.</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-bold text-slate-500">Administradores</p>
          <p className="mt-3 text-4xl font-black text-slate-900">
            {usuarios.filter((u) => u.rol === "ADMIN").length}
          </p>
          <p className="mt-2 text-sm text-slate-500">Con acceso total.</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-[#4E1743] p-6 text-white shadow-sm">
          <p className="text-sm font-bold text-white/70">Roles</p>
          <p className="mt-3 text-4xl font-black">ADMIN</p>
          <p className="mt-2 text-sm text-white/70">Acceso completo al sistema.</p>
        </div>
      </div>

      {/* Tabla */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h3 className="text-lg font-black text-slate-900">Usuarios registrados</h3>
          <p className="text-sm text-slate-500">
            Administra el acceso de cada usuario al sistema.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-left text-sm">
            <thead>
              <tr className="border-b text-slate-500">
                <th className="py-4">Usuario</th>
                <th className="py-4">Email</th>
                <th className="py-4">Rol</th>
                <th className="py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((usuario) => (
                <tr
                  key={usuario.id}
                  className="border-b transition hover:bg-slate-50 last:border-none"
                >
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#4E1743]/10 font-black text-[#4E1743]">
                        {usuario.nombre.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-black text-slate-900">{usuario.nombre}</p>
                        <p className="text-xs text-slate-500">ID #{usuario.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 text-slate-600">{usuario.email}</td>
                  <td className="py-4">
                    <span className="rounded-full bg-[#4E1743]/10 px-3 py-1 text-xs font-bold text-[#4E1743]">
                      {usuario.rol}
                    </span>
                  </td>
                  <td className="py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => abrirEditar(usuario)}
                        className="rounded-xl bg-slate-100 px-4 py-2 font-bold text-slate-700 transition hover:bg-slate-200"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => eliminarUsuario(usuario)}
                        className="rounded-xl bg-red-50 px-4 py-2 font-bold text-red-700 transition hover:bg-red-100"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {usuarios.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-500">
                    No hay usuarios registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b px-6 py-4">
              <h3 className="text-lg font-bold text-[#4E1743]">
                {editando ? "Editar usuario" : "Nuevo usuario"}
              </h3>
              <button
                type="button"
                onClick={cerrarModal}
                className="rounded-lg px-3 py-1 text-xl font-bold text-slate-500 hover:bg-slate-100"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="mb-4">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Nombre
                </label>
                <input
                  name="nombre"
                  value={form.nombre}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#4E1743] focus:ring-2 focus:ring-[#4E1743]/20"
                  placeholder="Ej: Juan Pérez"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Email
                </label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#4E1743] focus:ring-2 focus:ring-[#4E1743]/20"
                  placeholder="Ej: juan@empresa.cl"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  {editando ? "Nueva contraseña (dejar en blanco para no cambiar)" : "Contraseña"}
                </label>
                <input
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#4E1743] focus:ring-2 focus:ring-[#4E1743]/20"
                  placeholder="••••••••"
                  required={!editando}
                />
              </div>

              <div className="mb-6">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Rol
                </label>
                <select
                  name="rol"
                  value={form.rol}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#4E1743] focus:ring-2 focus:ring-[#4E1743]/20"
                >
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>

              <div className="flex gap-3 border-t pt-4">
                <button
                  type="button"
                  onClick={cerrarModal}
                  className="flex-1 rounded-xl border px-4 py-3 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 rounded-xl bg-[#4E1743] px-4 py-3 font-bold text-white disabled:opacity-60"
                >
                  {loading ? "Guardando..." : editando ? "Actualizar" : "Crear"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}