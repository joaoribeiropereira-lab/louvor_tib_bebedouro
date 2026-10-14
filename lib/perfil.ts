import "server-only";
import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Estado } from "@/lib/types";

const esquema = z.object({
  nome: z.string().trim().min(2, "Informe o nome (mínimo 2 letras).").max(80, "Nome muito longo."),
  tom: z.string().regex(/^([A-G](#|b)?m?)?$/, "Tom inválido."),
  instrumentos: z.array(z.string().uuid()).max(20),
});

/** Grava nome, tom preferido e instrumentos. O RLS decide quem pode gravar em quem. */
export async function gravarPerfil(
  supabase: SupabaseClient,
  perfilId: string,
  formData: FormData,
  { permitirTom }: { permitirTom: boolean },
): Promise<Estado> {
  const lido = esquema.safeParse({
    nome: formData.get("nome"),
    tom: String(formData.get("tom") ?? ""),
    instrumentos: formData.getAll("instrumentos").map(String),
  });
  if (!lido.success) return { erro: lido.error.issues[0].message };
  const { nome, tom, instrumentos } = lido.data;

  const dados: Record<string, unknown> = { nome_exibicao: nome };
  if (permitirTom) dados.tom_preferido = tom === "" ? null : tom;

  const { error: erroPerfil } = await supabase.from("profiles").update(dados).eq("id", perfilId);
  if (erroPerfil) return { erro: "Não foi possível salvar o perfil." };

  if (instrumentos.length > 0) {
    const { error } = await supabase
      .from("perfil_instrumentos")
      .upsert(
        instrumentos.map((instrumento_id) => ({ perfil_id: perfilId, instrumento_id })),
        { onConflict: "perfil_id,instrumento_id" },
      );
    if (error) return { erro: "Não foi possível salvar os instrumentos." };
  }

  let remocao = supabase.from("perfil_instrumentos").delete().eq("perfil_id", perfilId);
  if (instrumentos.length > 0) {
    remocao = remocao.not("instrumento_id", "in", `(${instrumentos.join(",")})`);
  }
  const { error: erroRemocao } = await remocao;
  if (erroRemocao) return { erro: "Não foi possível atualizar os instrumentos." };

  return { ok: "Alterações salvas." };
}
