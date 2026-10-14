"use server";

import { revalidatePath } from "next/cache";
import { exigirUsuario } from "@/lib/auth";
import { gravarPerfil } from "@/lib/perfil";
import { createClient } from "@/lib/supabase/server";
import type { Estado } from "@/lib/types";

export async function salvarMeuPerfil(_: Estado, formData: FormData): Promise<Estado> {
  const { perfil } = await exigirUsuario();
  const supabase = await createClient();
  const resultado = await gravarPerfil(supabase, perfil.id, formData, { permitirTom: true });
  revalidatePath("/", "layout");
  return resultado;
}
