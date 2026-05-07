import { useLocation, useNavigate } from "react-router-dom";

interface Props {
  children: React.ReactNode;
}

const logo =
  "https://res.cloudinary.com/dvqpmttci/image/upload/v1777584212/logocolchagua2_bbk1sv.png";

const menuItems = [
  { label: "Dashboard", path: "/dashboard" },
  { label: "Trabajadores", path: "/trabajadores" },
  { label: "Empresas", path: "/empresas" },
  { label: "Sucursales", path: "/sucursales" },
  { label: "Cargos", path: "/cargos" },
  { label: "Asignaciones", path: "/asignaciones" },
  { label: "Asistencia", path: "/asistencia" },
  { label: "Liquidaciones", path: "/liquidaciones" },
  { label: "Usuarios", path: "/usuarios" },
];

export default function DashboardLayout({ children }: Props) {
  const navigate = useNavigate();
  const location = useLocation();

  const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    navigate("/login");
  };

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-slate-100 lg:flex">
      <aside className="hidden shrink-0 bg-[#4E1743] text-white shadow-2xl lg:flex lg:w-72 lg:flex-col">
        <div className="border-b border-white/10 p-6">
          <img
            src={logo}
            alt="Grupo Colchagua"
            className="w-52 transition duration-300 hover:scale-105"
          />
        </div>

        <nav className="flex-1 space-y-2 p-4">
          {menuItems.map((item) => {
            const activo = location.pathname === item.path;

            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full rounded-xl px-4 py-3 text-left font-semibold transition-all duration-200 ${
                  activo
                    ? "bg-white text-[#4E1743] shadow-md"
                    : "text-white/90 hover:translate-x-1 hover:bg-white/10"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-4">
          <div className="mb-4 rounded-xl bg-white/10 p-4">
            <p className="text-xs text-white/60">Sesión iniciada</p>
            <p className="font-bold">{usuario.nombre || "Usuario"}</p>
            <p className="text-xs text-white/60">
              {usuario.rol || "Administrador"}
            </p>
          </div>

          <button
            onClick={logout}
            className="w-full rounded-xl bg-white px-4 py-3 font-bold text-[#4E1743] transition hover:scale-[1.02] hover:bg-slate-100"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="min-w-0 flex-1 overflow-x-hidden">
        <header className="flex h-20 min-w-0 items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm sm:px-8">
          <div className="min-w-0">
            <h1 className="truncate text-xl font-bold text-slate-800 sm:text-2xl">
              Panel de control
            </h1>

            <p className="truncate text-sm text-slate-500">
              Bienvenido, {usuario.nombre || "Usuario"}
            </p>
          </div>

          <button
            onClick={logout}
            className="ml-3 shrink-0 rounded-xl bg-[#4E1743] px-4 py-2 font-semibold text-white transition hover:bg-[#3d1235] lg:hidden"
          >
            Salir
          </button>
        </header>

        <section className="min-w-0 max-w-full overflow-x-hidden p-4 sm:p-6 lg:p-8">
          <div className="min-w-0 max-w-full overflow-hidden">
            {children}
          </div>
        </section>
      </main>
    </div>
  );
}