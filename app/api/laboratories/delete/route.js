import { withApiUser } from "@/lib/api";
import { jsonError, jsonOk, readJson } from "@/lib/http";

export const POST = withApiUser(async ({ request, supabase }) => {
  const { labName = "" } = await readJson(request);
  if (!labName) return jsonOk({ message: "Peticion incompleta.", data: [] });

  const { error } = await supabase.from("catLabos").delete().eq("nombre_lab", labName);
  if (error) return jsonError();
  return jsonOk();
});
