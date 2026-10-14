"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import type { Estado } from "@/lib/types";

const esquema = z
  .object({
    senha: z.string().min(8, "A senha precisa ter pelo menos 8 caracteres.").max(72, "Senha muito longa."),
    confirmacao: z.string(),
  })
  .refine((d) => d.senha === d.confirmacao, { message: "As senhas não são iguais.", path: ["confirmacao"] });

export async function definirSenha(_: Estado, formData: FormData): Promise<Estado> {
  const lido = esquema.safeParse({ senha: formData.get("senha"), confirmacao: formData.get("confirmacao") });
  if (!lido.success) return { erro: lido.error.issues[0].message };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase.auth.updateUser({ password: lido.data.senha });
  if (error) return { erro: "Não foi possível salvar a senha. Tente novamente ou peça um novo link." };

  await supabase
    .from("profiles")
    .update({ primeiro_acesso_em: new Date().toISOString() })
    .eq("id", user.id)
    .is("primeiro_acesso_em", null);

  redirect("/");
}
