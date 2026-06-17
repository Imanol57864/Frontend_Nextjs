import { withApiUser } from "@/lib/api";
import { jsonError, jsonOk } from "@/lib/http";

export const POST = withApiUser(async ({ supabase }) => {
  const num = Math.floor(Math.random() * 999) + 1;
  const newName = `${num}_NUEVO_LABORATORIO`;
  const { error } = await supabase.from("catLabos").insert([{ nombre_lab: newName }]);

  if (error) return jsonError();
  return jsonOk({ message: "", data: [], nuevo: newName });
});
