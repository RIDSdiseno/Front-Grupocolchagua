import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import EmpresaModal from "../components/empresas/EmpresaModal";
import CrearSucursalModal from "../components/sucursal/CrearSucursalModal";
import type { Empresa, EmpresaForm } from "../types/empresa";
import type { SucursalForm } from "../types/sucursal";
import {
  actualizarEmpresaRequest,
  crearEmpresaRequest,
  eliminarEmpresaRequest,
  listarEmpresasRequest,
} from "../services/empresa.service";
import { crearSucursalRequest } from "../services/sucursal.service";

const initialForm: EmpresaForm = {
  razonSocial: "",
  alias: "",
  rut: "",
  foto: null,
  encargadoNombre: "",
  encargadoCorreo: "",
  encargadoTelefono: "",
};

const initialSucursalForm: SucursalForm = {
  nombre: "",
  direccion: "",
  comuna: "",
  ciudad: "",
};

export default function Empresas() {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [form, setForm] = useState<EmpresaForm>(initialForm);
  const [editando, setEditando] = useState<Empresa | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const [empresaSucursal, setEmpresaSucursal] = useState<Empresa | null>(null);
  const [modalSucursalOpen, setModalSucursalOpen] = useState(false);
  const [sucursalForm, setSucursalForm] =
    useState<SucursalForm>(initialSucursalForm);

  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  const empresasConContacto = useMemo(() => {
    return empresas.filter(
      (empresa) =>
        empresa.encargadoNombre ||
        empresa.encargadoCorreo ||
        empresa.encargadoTelefono
    ).length;
  }, [empresas]);

  const cargarEmpresas = async () => {
    try {
      const data = await listarEmpresasRequest();
      setEmpresas(data);
    } catch {
      setError("Error al cargar empresas");
    }
  };

  useEffect(() => {
    cargarEmpresas();
  }, []);

  const abrirCrear = () => {
    setForm(initialForm);
    setEditando(null);
    setMensaje("");
    setError("");
    setModalOpen(true);
  };

  const cerrarModal = () => {
    setForm(initialForm);
    setEditando(null);
    setModalOpen(false);
  };

  const abrirSucursalModal = (empresa: Empresa) => {
    setEmpresaSucursal(empresa);
    setSucursalForm(initialSucursalForm);
    setMensaje("");
    setError("");
    setModalSucursalOpen(true);
  };

  const cerrarSucursalModal = () => {
    setEmpresaSucursal(null);
    setSucursalForm(initialSucursalForm);
    setModalSucursalOpen(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, files } = e.target;

    if (name === "foto") {
      setForm((prev) => ({ ...prev, foto: files?.[0] || null }));
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSucursalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setSucursalForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const editarEmpresa = (empresa: Empresa) => {
    setEditando(empresa);

    setForm({
      razonSocial: empresa.razonSocial || "",
      alias: empresa.nombre || "",
      rut: empresa.rut || "",
      foto: null,
      encargadoNombre: empresa.encargadoNombre || "",
      encargadoCorreo: empresa.encargadoCorreo || "",
      encargadoTelefono: empresa.encargadoTelefono || "",
    });

    setMensaje("");
    setError("");
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMensaje("");

    try {
      if (editando) {
        await actualizarEmpresaRequest(editando.id, form);
        setMensaje("Empresa actualizada correctamente");
      } else {
        await crearEmpresaRequest(form);
        setMensaje("Empresa creada correctamente");
      }

      cerrarModal();
      await cargarEmpresas();
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al guardar empresa");
    } finally {
      setLoading(false);
    }
  };

  const handleSucursalSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!empresaSucursal) {
      setError("Debes seleccionar una empresa");
      return;
    }

    if (!sucursalForm.nombre.trim()) {
      setError("Debes ingresar el nombre de la sucursal");
      return;
    }

    setLoading(true);
    setError("");
    setMensaje("");

    try {
      await crearSucursalRequest(empresaSucursal.id, sucursalForm);
      setMensaje("Sucursal creada correctamente");
      cerrarSucursalModal();
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al crear sucursal");
    } finally {
      setLoading(false);
    }
  };

  const eliminarEmpresa = async (empresa: Empresa) => {
    const confirmar = confirm(`¿Eliminar la empresa ${empresa.nombre}?`);
    if (!confirmar) return;

    try {
      await eliminarEmpresaRequest(empresa.id);
      setMensaje("Empresa eliminada correctamente");
      await cargarEmpresas();
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al eliminar empresa");
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-8 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="mb-2 text-sm font-bold uppercase tracking-wide text-[#4E1743]">
            Gestión de clientes
          </p>
          <h2 className="text-3xl font-black text-slate-900">Empresas</h2>
          <p className="mt-2 max-w-2xl text-slate-500">
            Administra empresas cliente, encargados y sucursales asociadas.
          </p>
        </div>

        <button
          onClick={abrirCrear}
          className="rounded-2xl bg-[#4E1743] px-6 py-4 font-black text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-[#3d1235]"
        >
          Nueva empresa
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

      <div className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-bold text-slate-500">
            Empresas registradas
          </p>
          <p className="mt-3 text-4xl font-black text-slate-900">
            {empresas.length}
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Clientes activos en el sistema.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-bold text-slate-500">
            Con contacto registrado
          </p>
          <p className="mt-3 text-4xl font-black text-slate-900">
            {empresasConContacto}
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Empresas con encargado asociado.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-[#4E1743] p-6 text-white shadow-sm">
          <p className="text-sm font-bold text-white/70">Sucursales</p>
          <p className="mt-3 text-4xl font-black">Por empresa</p>
          <p className="mt-2 text-sm text-white/70">
            Cada tarifa dependerá de la sucursal seleccionada.
          </p>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h3 className="text-lg font-black text-slate-900">
            Empresas registradas
          </h3>
          <p className="text-sm text-slate-500">
            Desde aquí puedes editar la empresa o crear sus sucursales.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1250px] text-left text-sm">
            <thead>
              <tr className="border-b text-slate-500">
                <th className="py-4">Empresa</th>
                <th className="py-4">Razón social</th>
                <th className="py-4">RUT</th>
                <th className="py-4">Encargado</th>
                <th className="py-4">Correo</th>
                <th className="py-4">Teléfono</th>
                <th className="py-4 text-right">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {empresas.map((empresa) => (
                <tr
                  key={empresa.id}
                  className="border-b transition hover:bg-slate-50 last:border-none"
                >
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      {empresa.logoUrl ? (
                        <img
                          src={empresa.logoUrl}
                          alt={empresa.nombre}
                          className="h-12 w-12 rounded-2xl border bg-white object-contain p-1"
                        />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#4E1743]/10 font-black text-[#4E1743]">
                          {empresa.nombre?.charAt(0)}
                        </div>
                      )}

                      <div>
                        <p className="font-black text-slate-900">
                          {empresa.nombre}
                        </p>
                        <p className="text-xs text-slate-500">
                          ID #{empresa.id}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="py-4 text-slate-600">
                    {empresa.razonSocial || "-"}
                  </td>

                  <td className="py-4">
                    <span className="rounded-full bg-slate-100 px-4 py-2 font-bold text-slate-700">
                      {empresa.rut || "-"}
                    </span>
                  </td>

                  <td className="py-4 text-slate-600">
                    {empresa.encargadoNombre || "-"}
                  </td>

                  <td className="py-4 text-slate-600">
                    {empresa.encargadoCorreo || "-"}
                  </td>

                  <td className="py-4 text-slate-600">
                    {empresa.encargadoTelefono || "-"}
                  </td>

                  <td className="py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => abrirSucursalModal(empresa)}
                        className="rounded-xl bg-[#4E1743]/10 px-4 py-2 font-bold text-[#4E1743] transition hover:bg-[#4E1743]/20"
                      >
                        Sucursal
                      </button>

                      <button
                        onClick={() => editarEmpresa(empresa)}
                        className="rounded-xl bg-slate-100 px-4 py-2 font-bold text-slate-700 transition hover:bg-slate-200"
                      >
                        Editar
                      </button>

                      <button
                        onClick={() => eliminarEmpresa(empresa)}
                        className="rounded-xl bg-red-50 px-4 py-2 font-bold text-red-700 transition hover:bg-red-100"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {empresas.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No hay empresas registradas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <EmpresaModal
        open={modalOpen}
        loading={loading}
        editando={editando}
        form={form}
        onClose={cerrarModal}
        onChange={handleChange}
        onSubmit={handleSubmit}
      />

      <CrearSucursalModal
        open={modalSucursalOpen}
        loading={loading}
        empresaNombre={empresaSucursal?.nombre}
        form={sucursalForm}
        onClose={cerrarSucursalModal}
        onChange={handleSucursalChange}
        onSubmit={handleSucursalSubmit}
      />
    </DashboardLayout>
  );
}