"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import type { Estado } from "@/lib/types";

const esquema = z.object({
  email: z.string().trim().toLowerCase().email("Informe um e-mail válido."),
  senha: z.string().min(1, "Informe a senha."),
});

export async function entrar(_: Estado, formData: FormData): Promise<Estado> {
  const lido = esquema.safeParse({ email: formData.get("email"), senha: formData.get("senha") });
  if (!lido.success) return { erro: lido.error.issues[0].message };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: lido.data.email,
    password: lido.data.senha,
  });
  if (error || !data.user) return { erro: "E-mail ou senha incorretos." };

  const { data: perfil } = await supabase
    .from("profiles")
    .select("ativo, primeiro_acesso_em")
    .eq("id", data.user.id)
    .single();

  if (!perfil?.ativo) {
    await supabase.auth.signOut();
    return { erro: "Sua conta está desativada. Fale com um administrador." };
  }
  if (!perfil.primeiro_acesso_em) {
    await supabase
      .from("profiles")
      .update({ primeiro_acesso_em: new Date().toISOString() })
      .eq("id", data.user.id);
  }
  redirect("/");
}
