export async function getUserAreaId(supabase, userId) {
  if (!supabase || !userId) return null;

  const { data, error } = await supabase
    .from("Area_Usuario")
    .select("area_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.warn("User area unavailable", { message: error.message });
    return null;
  }

  return data?.area_id ?? null;
}