import Link from "next/link";
import { exigirUsuario } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ModulosEmBreve } from "@/components/ModulosEmBreve";

export const metadata = { title: "Início" };

const ROTULOS_ATIVIDADE: Record<string, string> = {
  convite_enviado: "enviou um convite",
  membro_desativado: "desativou um integrante",
  membro_reativado: "reativou um integrante",
  papel_alterado: "alterou o acesso de um integrante",
  perfil_editado: "editou o perfil de um integrante",
  instrumento_criado: "adicionou um instrumento",
  instrumento_desativado: "desativou um instrumento",
  instrumento_reativado: "reativou um instrumento",
};

function saudacao() {
  const hora = Number(new Intl.DateTimeFormat("pt-BR", { hour: "numeric", hour12: false, timeZone: "America/Sao_Paulo" }).format(new Date()));
  return hora < 12 ? "Bom dia" : hora < 18 ? "Boa tarde" : "Boa noite";
}

export default async function PaginaInicial() {
  const { perfil } = await exigirUsuario();
  const supabase = await createClient();
  const primeiroNome = perfil.nome_exibicao.split(" ")[0];

  if (perfil.papel === "admin") return <PainelAdmin nome={primeiroNome} />;

  const { data } = await supabase
    .from("perfil_instrumentos")
    .select("instrumentos(nome)")
    .eq("perfil_id", perfil.id);
  const funcoes = ((data ?? []) as unknown as { instrumentos: { nome: string } | null }[])
    .map((d) => d.instrumentos?.nome)
    .filter(Boolean) as string[];

  return (
    <div className="space-y-8">
      <h1 className="text-4xl leading-tight">{saudacao()}, {primeiroNome}.</h1>

      <section aria-labelledby="meu-perfil" className="rounded-xl border border-borda bg-superficie p-5">
        <h2 id="meu-perfil" className="mb-3 text-xl">Seu perfil musical</h2>
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-suave">Instrumentos e funções</dt>
            <dd className="mt-0.5">{funcoes.length ? funcoes.join(", ") : "Nenhum definido ainda"}</dd>
          </div>
          <div>
            <dt className="text-suave">Tom de preferência</dt>
            <dd className="mt-0.5">{perfil.tom_preferido ?? "Sem preferência"}</dd>
          </div>
        </dl>
        {(funcoes.length === 0 || !perfil.tom_preferido) && (
          <Link href="/perfil" className="botao-secundario mt-4">Completar meu perfil</Link>
        )}
      </section>

      <ModulosEmBreve admin={false} />
    </div>
  );
}

async function PainelAdmin({ nome }: { nome: string }) {
  const supabase = await createClient();

  const [ativos, pendentes, instrumentos, aguardando, atividade] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("ativo", true),
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("ativo", true).is("primeiro_acesso_em", null),
    supabase.from("instrumentos").select("id", { count: "exact", head: true }).eq("ativo", true),
    supabase.from("profiles").select("id, nome_exibicao, email").eq("ativo", true).is("primeiro_acesso_em", null).order("criado_em", { ascending: false }).limit(6),
    supabase.from("auditoria").select("id, acao, criado_em, ator:profiles(nome_exibicao)").order("criado_em", { ascending: false }).limit(8),
  ]);

  const estatisticas = [
    { rotulo: "Integrantes ativos", valor: ativos.count ?? 0 },
    { rotulo: "Convites pendentes", valor: pendentes.count ?? 0 },
    { rotulo: "Instrumentos e funções", valor: instrumentos.count ?? 0 },
  ];
  const fmt = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short", timeZone: "America/Sao_Paulo" });
  const eventos = (atividade.data ?? []) as unknown as { id: number; acao: string; criado_em: string; ator: { nome_exibicao: string } | null }[];

  return (
    <div className="space-y-8">
      <h1 className="text-4xl leading-tight">{saudacao()}, {nome}.</h1>

      <dl className="grid gap-px overflow-hidden rounded-xl border border-borda bg-borda sm:grid-cols-3">
        {estatisticas.map((e) => (
          <div key={e.rotulo} className="bg-superficie p-5">
            <dd className="font-titulo text-4xl">{e.valor}</dd>
            <dt className="mt-1 text-sm text-suave">{e.rotulo}</dt>
          </div>
        ))}
      </dl>

      <div className="flex flex-wrap gap-3">
        <Link href="/admin/membros" className="botao-primario">Gerenciar integrantes</Link>
        <Link href="/admin/instrumentos" className="botao-secundario">Instrumentos e funções</Link>
      </div>

      <section aria-labelledby="aguardando">
        <h2 id="aguardando" className="mb-3 text-xl">Ainda não acessaram a plataforma</h2>
        {(aguardando.data ?? []).length === 0 ? (
          <p className="rounded-xl border border-borda bg-superficie p-4 text-sm text-suave">Todos os integrantes ativos já entraram pelo menos uma vez.</p>
        ) : (
          <ul className="divide-y divide-borda rounded-xl border border-borda bg-superficie">
            {(aguardando.data ?? []).map((p) => (
              <li key={p.id} className="flex flex-col px-4 py-3 text-sm">
                <span className="font-medium">{p.nome_exibicao}</span>
                <span className="text-suave">{p.email}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="atividade">
        <h2 id="atividade" className="mb-3 text-xl">Atividade recente</h2>
        {eventos.length === 0 ? (
          <p className="rounded-xl border border-borda bg-superficie p-4 text-sm text-suave">Nenhuma alteração registrada ainda.</p>
        ) : (
          <ul className="divide-y divide-borda rounded-xl border border-borda bg-superficie">
            {eventos.map((e) => (
              <li key={e.id} className="flex flex-wrap items-baseline justify-between gap-2 px-4 py-3 text-sm">
                <span>
                  <span className="font-medium">{e.ator?.nome_exibicao ?? "Alguém"}</span>{" "}
                  {ROTULOS_ATIVIDADE[e.acao] ?? e.acao}
                </span>
                <time className="text-suave" dateTime={e.criado_em}>{fmt.format(new Date(e.criado_em))}</time>
              </li>
            ))}
          </ul>
        )}
      </section>

      <ModulosEmBreve admin />
    </div>
  );
}
