"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { exigirAdmin } from "@/lib/auth";
import { gravarPerfil } from "@/lib/perfil";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { Estado } from "@/lib/types";

const idUsuario = z.string().uuid();

export async function convidarMembro(_: Estado, formData: FormData): Promise<Estado> {
  await exigirAdmin();
  const lido = z
    .object({
      nome: z.string().trim().min(2, "Informe o nome.").max(80),
      email: z.string().trim().toLowerCase().email("Informe um e-mail válido."),
      papel: z.enum(["membro", "admin"]),
      instrumentos: z.array(z.string().uuid()).max(20),
    })
    .safeParse({
      nome: formData.get("nome"),
      email: formData.get("email"),
      papel: formData.get("papel") ?? "membro",
      instrumentos: formData.getAll("instrumentos").map(String),
    });
  if (!lido.success) return { erro: lido.error.issues[0].message };
  const { nome, email, papel, instrumentos } = lido.data;

  const { data, error } = await createAdminClient().auth.admin.inviteUserByEmail(email, { data: { nome } });
  if (error || !data.user) {
    const jaExiste = /already|registered|exists/i.test(error?.message ?? "");
    return { erro: jaExiste ? "Já existe um cadastro com este e-mail." : "Não foi possível enviar o convite. Confira o e-mail e tente de novo." };
  }

  const novoId = data.user.id;
  const supabase = await createClient();

  if (papel === "admin") await supabase.from("profiles").update({ papel: "admin" }).eq("id", novoId);
  if (instrumentos.length > 0) {
    await supabase
      .from("perfil_instrumentos")
      .upsert(instrumentos.map((instrumento_id) => ({ perfil_id: novoId, instrumento_id })));
  }
  await supabase.rpc("registrar_auditoria", {
    p_acao: "convite_enviado",
    p_entidade: "profiles",
    p_entidade_id: novoId,
    p_detalhes: { email, nome, papel },
  });

  revalidatePath("/admin/membros");
  return { ok: `Convite enviado para ${email}.` };
}

export async function alterarAtivo(id: string, ativo: boolean): Promise<Estado> {
  const { perfil } = await exigirAdmin();
  if (!idUsuario.safeParse(id).success) return { erro: "Integrante inválido." };
  if (id === perfil.id && !ativo) return { erro: "Você não pode desativar a própria conta." };

  const supabase = await createClient();
  const { error } = await supabase.from("profiles").update({ ativo }).eq("id", id);
  if (error) return { erro: error.message.includes("administrador") ? "Deve existir ao menos um administrador ativo." : "Não foi possível alterar o status." };

  // Bloqueia (ou libera) o login de fato, além de marcar o perfil.
  await createAdminClient().auth.admin.updateUserById(id, { ban_duration: ativo ? "none" : "876000h" });

  await supabase.rpc("registrar_auditoria", {
    p_acao: ativo ? "membro_reativado" : "membro_desativado",
    p_entidade: "profiles",
    p_entidade_id: id,
    p_detalhes: {},
  });
  revalidatePath("/admin/membros");
  return { ok: ativo ? "Integrante reativado." : "Integrante desativado. O histórico foi mantido." };
}

export async function alterarPapel(id: string, papel: "admin" | "membro"): Promise<Estado> {
  const { perfil } = await exigirAdmin();
  if (!idUsuario.safeParse(id).success || !["admin", "membro"].includes(papel)) return { erro: "Dados inválidos." };
  if (id === perfil.id) return { erro: "Você não pode alterar o próprio papel." };

  const supabase = await createClient();
  const { error } = await supabase.from("profiles").update({ papel }).eq("id", id);
  if (error) return { erro: "Não foi possível alterar o papel." };

  await supabase.rpc("registrar_auditoria", {
    p_acao: "papel_alterado",
    p_entidade: "profiles",
    p_entidade_id: id,
    p_detalhes: { papel },
  });
  revalidatePath("/admin/membros");
  return { ok: papel === "admin" ? "Agora é administrador." : "Agora é membro." };
}

export async function salvarPerfilDeMembro(_: Estado, formData: FormData): Promise<Estado> {
  await exigirAdmin();
  const id = idUsuario.safeParse(formData.get("perfil_id"));
  if (!id.success) return { erro: "Integrante inválido." };

  const supabase = await createClient();
  const resultado = await gravarPerfil(supabase, id.data, formData, { permitirTom: false });
  if (resultado?.ok) {
    await supabase.rpc("registrar_auditoria", {
      p_acao: "perfil_editado",
      p_entidade: "profiles",
      p_entidade_id: id.data,
      p_detalhes: {},
    });
  }
  revalidatePath("/admin/membros");
  return resultado;
}
