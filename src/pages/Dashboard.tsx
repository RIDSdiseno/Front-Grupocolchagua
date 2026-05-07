import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users, Building2, MapPin, Briefcase, Link, ClipboardList,
  FileText, UserCog, TrendingUp, CheckCircle, AlertCircle,
  Clock, BarChart3, ArrowRight,
} from "lucide-react";
import DashboardLayout from "../layouts/DashboardLayout";
import { listarEmpresasRequest } from "../services/empresa.service";
import { listarCargosRequest } from "../services/cargo.service";
import { listarTrabajadoresRequest } from "../services/trabajador.service";
import { listarTodasSucursalesRequest } from "../services/sucursal.service";
import { listarHoldingsRequest } from "../services/Holding.service";

interface Stat {
  label: string;
  value: number;
  sublabel?: string;
  color: string;
  bg: string;
  border: string;
  Icon: React.ElementType;
}

interface Modulo {
  label: string;
  descripcion: string;
  path: string;
  Icon: React.ElementType;
  color: string;
  bg: string;
  border: string;
}

const modulos: Modulo[] = [
  {
    label: "Trabajadores",
    descripcion: "Registra y administra el personal activo.",
    path: "/trabajadores",
    Icon: Users,
    color: "text-blue-700",
    bg: "bg-blue-50 hover:bg-blue-100",
    border: "border-blue-200",
  },
  {
    label: "Empresas",
    descripcion: "Gestiona empresas cliente y encargados.",
    path: "/empresas",
    Icon: Building2,
    color: "text-violet-700",
    bg: "bg-violet-50 hover:bg-violet-100",
    border: "border-violet-200",
  },
  {
    label: "Sucursales",
    descripcion: "Administra ubicaciones por empresa y holding.",
    path: "/sucursales",
    Icon: MapPin,
    color: "text-pink-700",
    bg: "bg-pink-50 hover:bg-pink-100",
    border: "border-pink-200",
  },
  {
    label: "Cargos y Tarifas",
    descripcion: "Define sueldos, bonos y tarifas por sucursal.",
    path: "/cargos",
    Icon: Briefcase,
    color: "text-emerald-700",
    bg: "bg-emerald-50 hover:bg-emerald-100",
    border: "border-emerald-200",
  },
  {
    label: "Asignaciones",
    descripcion: "Asigna trabajadores a empresas y cargos.",
    path: "/asignaciones",
    Icon: Link,
    color: "text-orange-700",
    bg: "bg-orange-50 hover:bg-orange-100",
    border: "border-orange-200",
  },
  {
    label: "Asistencia",
    descripcion: "Registra y controla la asistencia diaria.",
    path: "/asistencia",
    Icon: ClipboardList,
    color: "text-cyan-700",
    bg: "bg-cyan-50 hover:bg-cyan-100",
    border: "border-cyan-200",
  },
  {
    label: "Liquidaciones",
    descripcion: "Genera y gestiona liquidaciones de sueldo.",
    path: "/liquidaciones",
    Icon: FileText,
    color: "text-amber-700",
    bg: "bg-amber-50 hover:bg-amber-100",
    border: "border-amber-200",
  },
  {
    label: "Usuarios",
    descripcion: "Administra accesos y roles del sistema.",
    path: "/usuarios",
    Icon: UserCog,
    color: "text-slate-700",
    bg: "bg-slate-50 hover:bg-slate-100",
    border: "border-slate-200",
  },
];

function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (value === 0) return;
    let start = 0;
    const step = Math.max(1, Math.ceil(value / 40));
    const timer = setInterval(() => {
      start += step;
      if (start >= value) {
        setDisplay(value);
        clearInterval(timer);
      } else {
        setDisplay(start);
      }
    }, 25);
    return () => clearInterval(timer);
  }, [value]);

  return <span>{display.toLocaleString("es-CL")}</span>;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");

  const [visible, setVisible] = useState(false);
  const [statsMain, setStatsMain] = useState<Stat[]>([
    { label: "Trabajadores activos", value: 0, sublabel: "Personal en sistema", color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-100", Icon: Users },
    { label: "Empresas cliente", value: 0, sublabel: "Clientes registrados", color: "text-violet-700", bg: "bg-violet-50", border: "border-violet-100", Icon: Building2 },
    { label: "Sucursales activas", value: 0, sublabel: "Ubicaciones habilitadas", color: "text-pink-700", bg: "bg-pink-50", border: "border-pink-100", Icon: MapPin },
    { label: "Cargos registrados", value: 0, sublabel: "Roles disponibles", color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-100", Icon: Briefcase },
  ]);

  const [statsSecondary, setStatsSecondary] = useState<Stat[]>([
    { label: "Holdings", value: 0, sublabel: "Grupos empresariales", color: "text-indigo-700", bg: "bg-indigo-50", border: "border-indigo-100", Icon: BarChart3 },
    { label: "Trabajadores inactivos", value: 0, sublabel: "Fuera de sistema", color: "text-red-600", bg: "bg-red-50", border: "border-red-100", Icon: AlertCircle },
    { label: "Total sucursales", value: 0, sublabel: "Activas e inactivas", color: "text-slate-700", bg: "bg-slate-50", border: "border-slate-100", Icon: Clock },
    { label: "Asistencias del mes", value: 0, sublabel: "Registros este mes", color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-100", Icon: CheckCircle },
  ]);

  useEffect(() => {
    setTimeout(() => setVisible(true), 80);

    void (async () => {
      try {
        const [trabajadores, empresas, sucursales, cargos, holdings] = await Promise.all([
          listarTrabajadoresRequest(),
          listarEmpresasRequest(),
          listarTodasSucursalesRequest(),
          listarCargosRequest(),
          listarHoldingsRequest(),
        ]);

        const activos = trabajadores.filter((t: { activo: boolean }) => t.activo).length;
        const inactivos = trabajadores.length - activos;
        const sucActivas = sucursales.filter((s: { activo: boolean }) => s.activo).length;

        setStatsMain([
          { label: "Trabajadores activos", value: activos, sublabel: "Personal en sistema", color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-100", Icon: Users },
          { label: "Empresas cliente", value: empresas.length, sublabel: "Clientes registrados", color: "text-violet-700", bg: "bg-violet-50", border: "border-violet-100", Icon: Building2 },
          { label: "Sucursales activas", value: sucActivas, sublabel: "Ubicaciones habilitadas", color: "text-pink-700", bg: "bg-pink-50", border: "border-pink-100", Icon: MapPin },
          { label: "Cargos registrados", value: cargos.length, sublabel: "Roles disponibles", color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-100", Icon: Briefcase },
        ]);

        setStatsSecondary([
          { label: "Holdings", value: holdings.length, sublabel: "Grupos empresariales", color: "text-indigo-700", bg: "bg-indigo-50", border: "border-indigo-100", Icon: BarChart3 },
          { label: "Trabajadores inactivos", value: inactivos, sublabel: "Fuera del sistema", color: "text-red-600", bg: "bg-red-50", border: "border-red-100", Icon: AlertCircle },
          { label: "Total sucursales", value: sucursales.length, sublabel: "Activas e inactivas", color: "text-slate-700", bg: "bg-slate-50", border: "border-slate-100", Icon: Clock },
          { label: "Asistencias del mes", value: 0, sublabel: "Registros este mes", color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-100", Icon: CheckCircle },
        ]);
      } catch {
        // silencioso
      }
    })();
  }, []);

  const hora = new Date().getHours();
  const saludo = hora < 12 ? "Buenos días" : hora < 19 ? "Buenas tardes" : "Buenas noches";

  return (
    <DashboardLayout>
      {/* Header */}
      <div className={`mb-8 transition-all duration-700 ${visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}>
        <p className="text-xs font-bold uppercase tracking-widest text-[#4E1743]">Panel de control</p>
        <h2 className="mt-1 text-3xl font-black text-slate-900">
          {saludo}, {usuario.nombre?.split(" ")[0] || "Administrador"} 👋
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          {new Date().toLocaleDateString("es-CL", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      {/* Stats principales */}
      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statsMain.map((stat, i) => (
          <div
            key={stat.label}
            className={`rounded-3xl border ${stat.border} bg-white p-6 shadow-sm transition-all duration-700 hover:-translate-y-1 hover:shadow-md ${visible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"}`}
            style={{ transitionDelay: `${i * 70}ms` }}
          >
            <div className="flex items-start justify-between">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-500">{stat.label}</p>
                <p className={`mt-2 text-4xl font-black ${stat.color}`}>
                  <AnimatedNumber value={stat.value} />
                </p>
                <p className="mt-1 text-xs text-slate-400">{stat.sublabel}</p>
              </div>
              <div className={`shrink-0 rounded-2xl ${stat.bg} p-3`}>
                <stat.Icon size={22} className={stat.color} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Stats secundarias */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statsSecondary.map((stat, i) => (
          <div
            key={stat.label}
            className={`rounded-3xl border ${stat.border} ${stat.bg} p-5 transition-all duration-700 hover:-translate-y-1 hover:shadow-md ${visible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"}`}
            style={{ transitionDelay: `${i * 70 + 280}ms` }}
          >
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-white/70 p-2.5 shadow-sm">
                <stat.Icon size={18} className={stat.color} />
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-slate-500">{stat.label}</p>
                <p className={`text-2xl font-black ${stat.color}`}>
                  <AnimatedNumber value={stat.value} />
                </p>
              </div>
            </div>
            <p className="mt-2 text-xs text-slate-400">{stat.sublabel}</p>
          </div>
        ))}
      </div>

      {/* Módulos */}
      <div className={`transition-all duration-700 delay-500 ${visible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"}`}>
        <div className="mb-5">
          <div className="flex items-center gap-2">
            <TrendingUp size={18} className="text-[#4E1743]" />
            <h3 className="text-xl font-black text-slate-900">Módulos del sistema</h3>
          </div>
          <p className="mt-1 text-sm text-slate-500">Accede rápidamente a cada sección.</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {modulos.map((mod, i) => (
            <button
              key={mod.path}
              type="button"
              onClick={() => navigate(mod.path)}
              className={`group rounded-3xl border ${mod.border} ${mod.bg} p-5 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-lg`}
              style={{ transitionDelay: `${i * 40 + 500}ms` }}
            >
              <div className={`mb-3 inline-flex rounded-2xl bg-white/70 p-2.5 shadow-sm`}>
                <mod.Icon size={20} className={mod.color} />
              </div>
              <h4 className={`font-black ${mod.color}`}>{mod.label}</h4>
              <p className="mt-1 text-sm text-slate-500">{mod.descripcion}</p>
              <div className={`mt-4 flex items-center gap-1 text-xs font-bold ${mod.color} opacity-0 transition-all duration-200 group-hover:opacity-100`}>
                Ir al módulo
                <ArrowRight size={12} className="transition-transform group-hover:translate-x-1" />
              </div>
            </button>
          ))}
        </div>
      </div>

    </DashboardLayout>
  );
}