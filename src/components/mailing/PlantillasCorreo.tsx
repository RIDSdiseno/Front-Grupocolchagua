export type PlantillaCorreo = {
  nombre: string;
  asunto: string;
  html: string;
};

type PlantillasCorreoProps = {
  plantillas: PlantillaCorreo[];
  onSeleccionar: (plantilla: PlantillaCorreo) => void;
};

export default function PlantillasCorreo({
  plantillas,
  onSeleccionar,
}: PlantillasCorreoProps) {
  return (
    <div>
      <p className="mb-2 text-sm font-semibold text-slate-600">
        Plantillas rápidas
      </p>

      <div className="flex flex-wrap gap-2">
        {plantillas.map((p) => (
          <button
            key={p.nombre}
            type="button"
            onClick={() => onSeleccionar(p)}
            className="rounded-full border border-[#4E1743]/30 px-3 py-1.5 text-xs font-medium text-[#4E1743] transition hover:bg-[#4E1743] hover:text-white"
          >
            {p.nombre}
          </button>
        ))}
      </div>
    </div>
  );
}