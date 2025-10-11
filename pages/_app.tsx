import { useEffect } from "react";
import { restoreSession } from "../lib/sessionHelper";
import { supabase } from "../lib/supabaseClient";
import "../styles/globals.css";

function MyApp({ Component, pageProps }: any) {
  useEffect(() => {
    restoreSession();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session) {
          localStorage.setItem("sb-session", JSON.stringify(session));
        } else {
          localStorage.removeItem("sb-session");
        }
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return <Component {...pageProps} />;
}

export default MyApp;
