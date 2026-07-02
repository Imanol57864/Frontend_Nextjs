import { withApiUser } from "@/lib/api";
import { jsonError, jsonOk } from "@/lib/http";

export const POST = withApiUser(async ({ supabase }) => {

  // Remote Procedure Call, filters READ logic based on area.id
  const { data , error } = await supabase.rpc("get_labs");

  if (error) return jsonError();
  return jsonOk({ message: "", data: data ?? [] });
  
});
