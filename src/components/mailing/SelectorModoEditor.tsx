import type { ModoEditor } from "../../utils/mailingHtml";

type SelectorModoEditorProps = {
  modoEditor: ModoEditor;
  onChange: (modo: ModoEditor) => void;
};

export default function SelectorModoEditor({
  modoEditor,
  onChange,
}: SelectorModoEditorProps) {
  return (
    <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-1">
      <button
        type="button"
        onClick={() => onChange("normal")}
        className={`rounded-md px-3 py-1 text-xs font-semibold ${
          modoEditor === "normal"
            ? "bg-white text-[#4E1743] shadow-sm"
            : "text-slate-500"
        }`}
      >
        Correo normal
      </button>

      <button
        type="button"
        onClick={() => onChange("html")}
        className={`rounded-md px-3 py-1 text-xs font-semibold ${
          modoEditor === "html"
            ? "bg-white text-[#4E1743] shadow-sm"
            : "text-slate-500"
        }`}
      >
        HTML avanzado
      </button>
    </div>
  );
}