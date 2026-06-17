import { withApiUser } from "@/lib/api";
import { jsonError, jsonOk, readJson } from "@/lib/http";

export const POST = withApiUser(async ({ request, supabase }) => {
  const { labname = "" } = await readJson(request);
  if (!labname) return jsonOk({ message: "Peticion incompleta.", data: [] });

  const { data, error } = await supabase
    .from("catAnalisis")
    .select("*")
    .eq("id_catLabos", labname)
    .order("id_analisis", { ascending: true });

  if (error) return jsonError();
  return jsonOk({ message: "", data: data ?? [] });
});
