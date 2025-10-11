import { GetServerSidePropsContext } from "next";
import { supabase } from "./supabaseClient";

export async function requireAuth(ctx: GetServerSidePropsContext) {
  const { req } = ctx;
  const access_token = req.cookies["sb-access-token"];

  if (!access_token) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  const { data: { user }, error } = await supabase.auth.getUser(access_token);

  if (error || !user) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  return { props: { user } };
}
