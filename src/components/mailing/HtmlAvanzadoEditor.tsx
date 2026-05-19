import { useRef } from "react";

type HtmlAvanzadoEditorProps = {
  value: string;
  onChange: (value: string) => void;
  archivos: File[];
  onArchivosChange: (archivos: File[]) => void;
};

export default function HtmlAvanzadoEditor({
  value,
  onChange,
  archivos,
  onArchivosChange,
}: HtmlAvanzadoEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const insertarHtml = (antes: string, despues = "") => {
    const textarea = textareaRef.current;

    if (!textarea) {
      onChange(`${value}${antes}${despues}`);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = value.substring(start, end);

    const nuevoContenido =
      value.substring(0, start) +
      antes +
      selected +
      despues +
      value.substring(end);

    onChange(nuevoContenido);

    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = start + antes.length;
      textarea.selectionEnd = start + antes.length + selected.length;
    }, 0);
  };

  const agregarAdjuntos = (files: FileList | null) => {
    if (!files) return;
    onArchivosChange([...archivos, ...Array.from(files)]);
  };

  const insertarImagenHtml = (files: FileList | null) => {
    if (!files?.[0]) return;

    const archivo = files[0];
    const urlTemporal = URL.createObjectURL(archivo);

    insertarHtml(
      `<img src="${urlTemporal}" alt="${archivo.name}" style="max-width:100%;height:auto;border-radius:12px;margin:16px 0;display:block;" />`
    );
  };

  const quitarArchivo = (index: number) => {
    onArchivosChange(archivos.filter((_, i) => i !== index));
  };

  return (
    <div>
      <div className="mb-2 flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2">
        <button type="button" onClick={() => insertarHtml("<strong>", "</strong>")} className="rounded-lg bg-white px-3 py-1.5 text-xs font-bold shadow-sm hover:bg-slate-100">
          Negrita
        </button>

        <button type="button" onClick={() => insertarHtml("<em>", "</em>")} className="rounded-lg bg-white px-3 py-1.5 text-xs italic shadow-sm hover:bg-slate-100">
          Cursiva
        </button>

        <button type="button" onClick={() => insertarHtml("<u>", "</u>")} className="rounded-lg bg-white px-3 py-1.5 text-xs underline shadow-sm hover:bg-slate-100">
          Subrayado
        </button>

        <button type="button" onClick={() => insertarHtml('<p style="text-align:left;">', "</p>")} className="rounded-lg bg-white px-3 py-1.5 text-xs shadow-sm hover:bg-slate-100">
          Izq
        </button>

        <button type="button" onClick={() => insertarHtml('<p style="text-align:center;">', "</p>")} className="rounded-lg bg-white px-3 py-1.5 text-xs shadow-sm hover:bg-slate-100">
          Centro
        </button>

        <button type="button" onClick={() => insertarHtml('<p style="text-align:right;">', "</p>")} className="rounded-lg bg-white px-3 py-1.5 text-xs shadow-sm hover:bg-slate-100">
          Der
        </button>

        <button type="button" onClick={() => insertarHtml('<ul style="padding-left:20px;margin:12px 0;"><li>', "</li></ul>")} className="rounded-lg bg-white px-3 py-1.5 text-xs shadow-sm hover:bg-slate-100">
          Lista
        </button>

        <button
          type="button"
          onClick={() =>
            insertarHtml(
              '<a href="https://grupocolchagua.cl" style="color:#4E1743;font-weight:bold;">',
              "</a>"
            )
          }
          className="rounded-lg bg-white px-3 py-1.5 text-xs shadow-sm hover:bg-slate-100"
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
          className="rounded-lg bg-white px-3 py-1.5 text-xs shadow-sm hover:bg-slate-100"
        >
          Botón
        </button>

        <label className="cursor-pointer rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-[#4E1743] shadow-sm hover:bg-slate-100">
          Imagen HTML
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => insertarImagenHtml(e.target.files)}
          />
        </label>

        <label className="cursor-pointer rounded-lg bg-[#4E1743] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#3d1235]">
          Adjuntar
          <input
            type="file"
            multiple
            className="hidden"
            onChange={(e) => agregarAdjuntos(e.target.files)}
          />
        </label>
      </div>

      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={14}
        placeholder="Pega o escribe el HTML completo del correo..."
        className="w-full rounded-xl border border-slate-200 px-4 py-3 font-mono text-sm focus:border-[#4E1743] focus:outline-none focus:ring-2 focus:ring-[#4E1743]/20"
      />

      {archivos.length > 0 && (
        <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
          <p className="mb-2 text-xs font-semibold text-slate-500">
            Archivos adjuntos
          </p>

          <div className="space-y-2">
            {archivos.map((archivo, index) => (
              <div
                key={`${archivo.name}-${index}`}
                className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs"
              >
                <span className="truncate text-slate-700">
                  {archivo.name} · {(archivo.size / 1024 / 1024).toFixed(2)} MB
                </span>

                <button
                  type="button"
                  onClick={() => quitarArchivo(index)}
                  className="ml-3 font-semibold text-red-500 hover:text-red-700"
                >
                  Quitar
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}