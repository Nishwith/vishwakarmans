import { createClient } from '@supabase/supabase-js'
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Global Auth State & Token Recovery listener (Task 1 & Task 4)
if (typeof window !== "undefined" && typeof supabase?.auth?.onAuthStateChange === "function") {
  supabase.auth.onAuthStateChange(async (event, session) => {
    // Task 4: Diagnostics
    console.log("Auth State:", { event, session });

    const isExpired = session?.expires_at ? session.expires_at < Date.now() / 1000 : false;
    const isInvalid = !session || isExpired;

    if (
      event === "SIGNED_OUT" ||
      (event === "TOKEN_REFRESHED" && isInvalid) ||
      (event === "USER_UPDATED" && isInvalid)
    ) {
      try {
        await supabase.auth.signOut();
      } catch {
        // ignore
      }
      localStorage.clear();
      sessionStorage.clear();
    }
  });
}
