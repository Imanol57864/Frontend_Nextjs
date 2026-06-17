import { withApiUser } from "@/lib/api";
import { jsonError, jsonOk, readJson } from "@/lib/http";

export const POST = withApiUser(async ({ request, supabase }) => {
  const { labname = "" } = await readJson(request);
  if (!labname) return jsonOk({ message: "Peticion incompleta.", data: [] });

  const { data, error } = await supabase
    .from("catLabos")
    .select("*")
    .eq("nombre_lab", labname);

  if (error) return jsonError();
  if (!data?.length) return jsonOk({ message: "No se encontró información de este laboratorio.", data: [] });
  return jsonOk({ message: "", data });
});
