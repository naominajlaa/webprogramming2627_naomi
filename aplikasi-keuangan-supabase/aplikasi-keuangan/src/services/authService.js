import { supabase } from "../lib/supabaseClient";

export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
  });
  if (error) {
    console.error("Error saat login:", error.message);
    throw error;
  }
  return data;
};

export const logOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) console.error("Error saat logout:", error.message);
};
