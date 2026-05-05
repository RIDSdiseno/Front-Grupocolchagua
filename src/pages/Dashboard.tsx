import DashboardLayout from "../layouts/DashboardLayout";

export default function Dashboard() {
  const cards = [
    { title: "Trabajadores activos", value: "0" },
    { title: "Empresas cliente", value: "0" },
    { title: "Cargos registrados", value: "0" },
    { title: "Asistencias del mes", value: "0" },
  ];

  const modules = [
    "Trabajadores",
    "Empresas",
    "Cargos",
    "Tarifas por empresa",
    "Asistencia",
    "Liquidaciones",
  ];

  return (
    <DashboardLayout>
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <div key={card.title} className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">{card.title}</p>
            <h2 className="mt-3 text-3xl font-bold text-[#4E1743]">
              {card.value}
            </h2>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-800">
          Módulos del sistema
        </h2>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {modules.map((module) => (
            <div
              key={module}
              className="rounded-xl border border-slate-200 p-5 hover:border-[#4E1743] hover:shadow-md transition"
            >
              <h3 className="font-bold text-slate-800">{module}</h3>
              <p className="mt-2 text-sm text-slate-500">
                Gestión y administración de {module.toLowerCase()}.
              </p>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}