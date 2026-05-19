export type ModoEditor = "normal" | "html";

export const escaparHtml = (texto: string) =>
  texto
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "<br />");

export const envolverHtmlCorreo = (contenido: string) => {
  const contenidoLimpio = contenido.trim();

  const yaEsHtmlCompleto =
    contenidoLimpio.includes("<table") ||
    contenidoLimpio.includes("<html") ||
    contenidoLimpio.includes("<body");

  if (yaEsHtmlCompleto) return contenidoLimpio;

  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f8;padding:24px;font-family:Arial,Helvetica,sans-serif;">
      <tr>
        <td align="center">
          <table width="100%" cellpadding="0" cellspacing="0" style="max-width:680px;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #e5e7eb;">
            <tr>
              <td style="background:#4E1743;padding:24px;color:#ffffff;">
                <h1 style="margin:0;font-size:22px;">Grupo Colchagua</h1>
                <p style="margin:6px 0 0;font-size:13px;">Comunicaciones internas</p>
              </td>
            </tr>

            <tr>
              <td style="padding:28px;color:#334155;font-size:15px;line-height:1.65;">
                ${contenidoLimpio}
              </td>
            </tr>

            <tr>
              <td style="background:#f8fafc;padding:16px 28px;color:#64748b;font-size:12px;text-align:center;">
                Este correo fue enviado desde administrador@grupocolchagua.cl
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `;
};

export const limpiarHtml = (html: string) => html.trim();

export const generarHtmlFinal = (
  contenido: string,
  modoEditor: ModoEditor
) => {
  if (modoEditor === "normal") {
    return envolverHtmlCorreo(contenido);
  }

  return envolverHtmlCorreo(contenido);
};