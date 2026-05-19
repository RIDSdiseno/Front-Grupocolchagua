import { useEffect, useRef } from "react";

type CorreoNormalEditorProps = {
  value: string;
  onChange: (value: string) => void;
  archivos: File[];
  onArchivosChange: (archivos: File[]) => void;
};

const fuentes = ["Arial", "Calibri", "Georgia", "Times New Roman", "Verdana"];
const tamanos = ["12px", "14px", "16px", "18px", "20px", "24px", "28px"];

export default function CorreoNormalEditor({
  value,
  onChange,
  archivos,
  onArchivosChange,
}: CorreoNormalEditorProps) {
  const editorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || "";
    }
  }, [value]);

  const actualizarContenido = () => {
    if (!editorRef.current) return;
    onChange(editorRef.current.innerHTML);
  };

  const ejecutarComando = (comando: string, valor?: string) => {
    editorRef.current?.focus();

    setTimeout(() => {
      document.execCommand(comando, false, valor);
      actualizarContenido();
      editorRef.current?.focus();
    }, 0);
  };

  const insertarLink = () => {
    const url = prompt("Ingresa la URL del enlace:");
    if (!url) return;

    ejecutarComando("createLink", url);
  };

  const agregarArchivos = (files: FileList | null) => {
    if (!files) return;
    onArchivosChange([...archivos, ...Array.from(files)]);
  };

  const quitarArchivo = (index: number) => {
    onArchivosChange(archivos.filter((_, i) => i !== index));
  };

  const limpiarFormato = () => {
    ejecutarComando("removeFormat");
  };

  const botonClase =
    "rounded-lg bg-white px-3 py-1.5 text-xs text-slate-700 shadow-sm hover:bg-slate-100";

  const evitarPerderSeleccion = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="flex flex-wrap gap-2 border-b border-slate-200 bg-slate-50 p-2">
        <select
          defaultValue=""
          onMouseDown={(e) => e.stopPropagation()}
          onChange={(e) => ejecutarComando("fontName", e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-700"
        >
          <option value="" disabled>
            Fuente
          </option>

          {fuentes.map((fuente) => (
            <option key={fuente} value={fuente}>
              {fuente}
            </option>
          ))}
        </select>

        <select
          defaultValue=""
          onMouseDown={(e) => e.stopPropagation()}
          onChange={(e) => ejecutarComando("fontSize", e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-700"
        >
          <option value="" disabled>
            Tamaño
          </option>

          {tamanos.map((tamano, index) => (
            <option key={tamano} value={String(index + 2)}>
              {tamano}
            </option>
          ))}
        </select>

        <button
          type="button"
          onMouseDown={evitarPerderSeleccion}
          onClick={() => ejecutarComando("bold")}
          className={`${botonClase} font-bold`}
        >
          B
        </button>

        <button
          type="button"
          onMouseDown={evitarPerderSeleccion}
          onClick={() => ejecutarComando("italic")}
          className={`${botonClase} italic`}
        >
          I
        </button>

        <button
          type="button"
          onMouseDown={evitarPerderSeleccion}
          onClick={() => ejecutarComando("underline")}
          className={`${botonClase} underline`}
        >
          U
        </button>

        <button
          type="button"
          onMouseDown={evitarPerderSeleccion}
          onClick={() => ejecutarComando("strikeThrough")}
          className={`${botonClase} line-through`}
        >
          S
        </button>

        <button
          type="button"
          onMouseDown={evitarPerderSeleccion}
          onClick={() => ejecutarComando("insertUnorderedList")}
          className={botonClase}
        >
          • Lista
        </button>

        <button
          type="button"
          onMouseDown={evitarPerderSeleccion}
          onClick={() => ejecutarComando("insertOrderedList")}
          className={botonClase}
        >
          1. Lista
        </button>

        <button
          type="button"
          onMouseDown={evitarPerderSeleccion}
          onClick={() => ejecutarComando("justifyLeft")}
          className={botonClase}
        >
          Izq
        </button>

        <button
          type="button"
          onMouseDown={evitarPerderSeleccion}
          onClick={() => ejecutarComando("justifyCenter")}
          className={botonClase}
        >
          Centro
        </button>

        <button
          type="button"
          onMouseDown={evitarPerderSeleccion}
          onClick={() => ejecutarComando("justifyRight")}
          className={botonClase}
        >
          Der
        </button>

        <button
          type="button"
          onMouseDown={evitarPerderSeleccion}
          onClick={insertarLink}
          className={`${botonClase} text-[#4E1743]`}
        >
          Link
        </button>

        <button
          type="button"
          onMouseDown={evitarPerderSeleccion}
          onClick={limpiarFormato}
          className={botonClase}
        >
          Limpiar
        </button>

        <label className="cursor-pointer rounded-lg bg-[#4E1743] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#3d1235]">
          Adjuntar
          <input
            type="file"
            multiple
            className="hidden"
            onChange={(e) => agregarArchivos(e.target.files)}
          />
        </label>
      </div>

      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={actualizarContenido}
        onBlur={actualizarContenido}
        data-placeholder="Escribe el mensaje del correo..."
        className="min-h-[300px] px-5 py-4 text-sm leading-relaxed text-slate-700 outline-none empty:before:text-slate-400 empty:before:content-[attr(data-placeholder)] [&_ol]:list-decimal [&_ol]:pl-6 [&_ul]:list-disc [&_ul]:pl-6 [&_li]:my-1 [&_p]:my-2"
      />

      {archivos.length > 0 && (
        <div className="border-t border-slate-200 bg-slate-50 p-3">
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