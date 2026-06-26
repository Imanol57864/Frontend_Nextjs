import { requireApiUser } from "@/lib/auth";
import { FILE_BUCKET } from "@/lib/files";
import { jsonError, jsonOk } from "@/lib/http";
import { uploadAnalysisFile } from "@/lib/storageFiles";

export async function POST(request) {
  const session = await requireApiUser();
  if (!session.ok) return session.response;

  const form = await request.formData();
  const file = form.get("analisis_file");
  const labname = String(form.get("labname") || "");
  const code = String(form.get("a_code") || "");

  if (!file || !labname || !code) {
    return jsonOk({ message: "Peticion incompleta.", data: [] });
  }

  const supabase = session.supabase;
  
  const { data: analisisData, error: analisisError } = await supabase
    .from("catAnalisis")
    .select("*")
    .eq("id_catLabos", labname)
    .eq("codigo_analisis", code);

  if (analisisError) return jsonError();
  if (analisisData.length > 0) return jsonOk({ message: `El laboratorio ${labname} ya cuenta con un ID similar '' ${code} '' . Vuelve a intentarlo.`, data: [] });

  // Creación del código compuesto una sola vez, existe un trigger para updates 
  const { data: codigoLabData, error: codigoLabErr } = await supabase
    .from("catLabos")
    .select("codigo_lab")
    .eq("nombre_lab", labname);
  if (codigoLabErr) return jsonError();
  const display = `${codigoLabData?.[0]?.codigo_lab}${code}`

  const { data: insertData, error: insertError } = await supabase
    .from("catAnalisis")
    .insert([{ codigo_analisis: code, id_catLabos: labname, codigo_completo: display}])
    .select();

  if (insertError) {
    if (insertError.code === "23505") {
      return jsonOk({ message: "Se intentó crear un análisis con un ID ocupado. Vuelve a intentar.", data: [] });
    }

    return jsonError();
  }

  // Esto permite que el código de análisis pueda quedar vacio
  const idAnalisis = insertData?.[0].id_analisis;

  const { error: fileError } = await uploadAnalysisFile({
    supabase,
    bucket: FILE_BUCKET,
    idAnalisis,
    file,
    tipoArchivo: "Cotización"
  });

  if (fileError) return jsonError("Internal Server Error.", fileError.status || 500);
  return jsonOk();
}
