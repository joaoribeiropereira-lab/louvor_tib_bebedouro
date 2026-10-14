import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { exigirAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { FormularioPerfil } from "@/components/FormularioPerfil";
import type { Instrumento } from "@/lib/types";
import { salvarPerfilDeMembro } from "../actions";

export const metadata = { title: "Editar integrante" };

export default async function PaginaEditarMembro({ params }: { params: Promise<{ id: string }> }) {
  await exigirAdmin();
  const { id } = await params;
  if (!z.string().uuid().safeParse(id).success) notFound();

  const supabase = await createClient();
  const [{ data: alvo }, { data: instrumentos }, { data: dele }] = await Promise.all([
    supabase.from("profiles").select("id, email, nome_exibicao").eq("id", id).single(),
    supabase.from("instrumentos").select("*").eq("ativo", true).order("ordem").order("nome"),
    supabase.from("perfil_instrumentos").select("instrumento_id").eq("perfil_id", id),
  ]);
  if (!alvo) notFound();

  return (
    <div className="max-w-xl">
      <Link href="/admin/membros" className="text-sm text-destaque underline underline-offset-4">Voltar aos integrantes</Link>
      <h1 className="mt-4 text-3xl">{alvo.nome_exibicao}</h1>
      <p className="mb-8 mt-2 text-sm text-suave">{alvo.email}</p>
      <FormularioPerfil
        acao={salvarPerfilDeMembro}
        perfilId={alvo.id}
        nome={alvo.nome_exibicao}
        instrumentos={(instrumentos ?? []) as Instrumento[]}
        selecionados={(dele ?? []).map((d) => d.instrumento_id as string)}
      />
    </div>
  );
}
