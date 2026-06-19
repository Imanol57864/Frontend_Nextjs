import { withApiUser } from "@/lib/api";
import { jsonError, jsonOk, readJson } from "@/lib/http";

export const POST = withApiUser(async ({ request, supabase }) => {
  await readJson(request);

  const { data, error } = await supabase
    .from("catAnalisis")
    .select("*")
    .order("id_analisis", { ascending: true });

  if (error) return jsonError();
  return jsonOk({ message: "", data: data ?? [] });
});
