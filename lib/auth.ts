import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Perfil } from "@/lib/types";

/** Sessão atual (validada no servidor Supabase) + perfil. Cacheada por requisição. */
export const getSessao = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: perfil } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  if (!perfil) return null;
  return { user, perfil: perfil as Perfil };
});

/** Exige login e conta ativa. Chame em toda página e em toda ação protegida. */
export async function exigirUsuario() {
  const sessao = await getSessao();
  if (!sessao) redirect("/login");
  if (!sessao.perfil.ativo) redirect("/auth/sair?motivo=desativado");
  return sessao;
}

/** Exige papel de administrador, verificado no banco a cada chamada. */
export async function exigirAdmin() {
  const sessao = await exigirUsuario();
  if (sessao.perfil.papel !== "admin") redirect("/");
  return sessao;
}
