type MailingPreviewProps = {
  htmlFinal: string;
  asunto: string;
  grupo: string;
};

export default function MailingPreview({
  htmlFinal,
  asunto,
  grupo,
}: MailingPreviewProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3">
        <p className="text-sm font-bold text-slate-700">
          Vista previa tipo Outlook
        </p>
        <p className="text-xs text-slate-400">
          Así se verá el contenido base del correo.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
        <div className="border-b border-slate-200 bg-white px-4 py-3">
          <p className="text-xs text-slate-400">De</p>
          <p className="text-sm font-semibold text-slate-700">
            Grupo Colchagua &lt;administrador@grupocolchagua.cl&gt;
          </p>

          <p className="mt-2 text-xs text-slate-400">Para</p>
          <p className="text-sm text-slate-700">{grupo}</p>

          <p className="mt-2 text-xs text-slate-400">Asunto</p>
          <p className="text-sm font-semibold text-slate-800">
            {asunto || "(Sin asunto)"}
          </p>
        </div>

        <iframe
          title="preview-correo"
          srcDoc={htmlFinal}
          className="h-[720px] w-full bg-white"
        />
      </div>
    </div>
  );
}