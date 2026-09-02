import { createClient } from "@/lib/supabase/server";

export async function getUserCredits(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("credits")
    .select("credits_count")
    .eq("user_id", userId)
    .single();

  if (error) return 0;
  return data?.credits_count ?? 0;
}
