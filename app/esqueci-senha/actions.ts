"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import type { Estado } from "@/lib/types";

export async function pedirRedefinicao(_: Estado, formData: FormData): Promise<Estado> {
  const lido = z.string().trim().toLowerCase().email().safeParse(formData.get("email"));
  if (!lido.success) return { erro: "Informe um e-mail válido." };

  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(lido.data);
  // Mesma resposta exista ou não a conta, para não revelar quem é integrante.
  return { ok: "Se este e-mail estiver cadastrado, você receberá um link para criar uma nova senha." };
}
