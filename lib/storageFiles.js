export function sanitizeFileName(name = "file") {
  const normalized = String(name)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\\/:*?"<>|]/g, "-")
    .replace(/\s+/g, " ")
    .trim();

  return normalized || "file";
}

export async function uploadAnalysisFile({ supabase, bucket, idAnalisis, file, tipoArchivo = null }) {
  const buffer = Buffer.from(await file.arrayBuffer());
  const filename = sanitizeFileName(file.name);
  const path = `${idAnalisis}/${filename}`;

  const { data: fileData, error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(path, buffer, {
      contentType: file.type || "application/octet-stream",
      upsert: false
    });

  if (uploadError) return { error: uploadError };

  const relation = { id_analisis: idAnalisis, uuid_archivo: fileData.id };
  if (tipoArchivo) relation.tipo_archivo = tipoArchivo;

  const { error: relationError } = await supabase
    .from("Archivo_Analisis")
    .insert([relation]);

  if (relationError) return { error: relationError };
  return { data: fileData };
}
