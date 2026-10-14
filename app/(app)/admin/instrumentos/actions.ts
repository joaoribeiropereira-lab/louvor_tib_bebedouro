"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { exigirAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { Estado } from "@/lib/types";

export async function criarInstrumento(_: Estado, formData: FormData): Promise<Estado> {
  await exigirAdmin();
  const lido = z.string().trim().min(2, "Informe o nome (mínimo 2 letras).").max(60, "Nome muito longo.").safeParse(formData.get("nome"));
  if (!lido.success) return { erro: lido.error.issues[0].message };

  const supabase = await createClient();
  const { data, error } = await supabase.from("instrumentos").insert({ nome: lido.data }).select("id").single();
  if (error) {
    return { erro: error.code === "23505" ? "Já existe um instrumento ou função com este nome." : "Não foi possível criar." };
  }
  await supabase.rpc("registrar_auditoria", {
    p_acao: "instrumento_criado",
    p_entidade: "instrumentos",
    p_entidade_id: data.id,
    p_detalhes: { nome: lido.data },
  });
  revalidatePath("/admin/instrumentos");
  return { ok: `“${lido.data}” adicionado.` };
}

export async function alternarInstrumento(id: string, ativo: boolean): Promise<Estado> {
  await exigirAdmin();
  if (!z.string().uuid().safeParse(id).success) return { erro: "Instrumento inválido." };

  const supabase = await createClient();
  const { error } = await supabase.from("instrumentos").update({ ativo }).eq("id", id);
  if (error) return { erro: "Não foi possível alterar." };
  await supabase.rpc("registrar_auditoria", {
    p_acao: ativo ? "instrumento_reativado" : "instrumento_desativado",
    p_entidade: "instrumentos",
    p_entidade_id: id,
    p_detalhes: {},
  });
  revalidatePath("/admin/instrumentos");
  return { ok: ativo ? "Reativado." : "Desativado. Quem já o tem no perfil mantém o histórico." };
}
