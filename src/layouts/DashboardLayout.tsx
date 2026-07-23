import { useLocation, useNavigate } from "react-router-dom";
import { useMsal } from "@azure/msal-react";
import {
  LayoutDashboard,
  Users,
  Building2,
  MapPin,
  Briefcase,
  Link,
  ClipboardList,
  FileText,
  UserSearch,
  Mail,
  UserCog,
  ChevronRight,
  Database,
} from "lucide-react";

interface Props {
  children: React.ReactNode;
}

const logo =
  "https://res.cloudinary.com/dvqpmttci/image/upload/v1777584212/logocolchagua2_bbk1sv.png";

const menuSections = [
  {
    title: "General",
    items: [{ label: "Dashboard", path: "/dashboard", Icon: LayoutDashboard }],
  },
  {
    title: "Gestión operacional",
    items: [
      { label: "Trabajadores", path: "/trabajadores", Icon: Users },
      { label: "Empresas", path: "/empresas", Icon: Building2 },
      { label: "Sucursales", path: "/sucursales", Icon: MapPin },
      { label: "Cargos", path: "/cargos", Icon: Briefcase },
      { label: "Asignaciones", path: "/asignaciones", Icon: Link },
      { label: "Asistencia", path: "/asistencia", Icon: ClipboardList },
      { label: "Preliquidaciones", path: "/preliquidaciones", Icon: FileText },
    ],
  },
  {
    title: "Reclutamiento",
    items: [
      { label: "Postulantes", path: "/postulantes", Icon: UserSearch },
      { label: "Empleos", path: "/empleos", Icon: Briefcase },
    ],
  },
  {
    title: "Comunicaciones",
    items: [{ label: "Mailing", path: "/mailing", Icon: Mail }],
  },
  {
    title: "Integraciones",
    items: [{ label: "Talana", path: "/talana", Icon: Database }],
  },
  {
    title: "Administración",
    items: [{ label: "Usuarios", path: "/usuarios", Icon: UserCog }],
  },
];

export default function DashboardLayout({ children }: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const { instance } = useMsal();

  const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");

  const logout = async () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");

    const accounts = instance.getAllAccounts();

    for (const account of accounts) {
      await instance.clearCache({ account });
    }

    navigate("/login", { replace: true });
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

        <nav className="flex-1 space-y-5 overflow-y-auto p-4">
          {menuSections.map((section) => (
            <div key={section.title}>
              <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-wider text-white/45">
                {section.title}
              </p>

              <div className="space-y-1">
                {section.items.map((item) => {
                  const activo = location.pathname === item.path;

                  return (
                    <button
                      key={item.path}
                      onClick={() => navigate(item.path)}
                      className={`group flex w-full items-center justify-between rounded-xl px-4 py-3 text-left font-semibold transition-all duration-200 ${
                        activo
                          ? "bg-white text-[#4E1743] shadow-md"
                          : "text-white/90 hover:translate-x-1 hover:bg-white/10"
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <item.Icon
                          size={18}
                          className={
                            activo ? "text-[#4E1743]" : "text-white/70"
                          }
                        />
                        {item.label}
                      </span>

                      {activo && <ChevronRight size={16} />}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-white/10 p-4">
          <div className="mb-4 rounded-xl bg-white/10 p-4">
            <p className="text-xs text-white/60">Sesión iniciada</p>
            <p className="truncate font-bold">{usuario.nombre || "Usuario"}</p>
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
          <div className="min-w-0 max-w-full overflow-hidden">{children}</div>
        </section>
      </main>
    </div>
  );
}