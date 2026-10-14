import { exigirAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { AcoesMembro } from "@/components/AcoesMembro";
import { FormularioConvite } from "@/components/FormularioConvite";
import type { Instrumento, Papel } from "@/lib/types";

export const metadata = { title: "Integrantes" };

type Linha = {
  id: string; email: string; nome_exibicao: string; papel: Papel; ativo: boolean;
  primeiro_acesso_em: string | null;
  perfil_instrumentos: { instrumentos: { nome: string } | null }[];
};

export default async function PaginaMembros() {
  const { perfil } = await exigirAdmin();
  const supabase = await createClient();

  const [{ data: membros }, { data: instrumentos }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, email, nome_exibicao, papel, ativo, primeiro_acesso_em, perfil_instrumentos(instrumentos(nome))")
      .order("ativo", { ascending: false })
      .order("nome_exibicao"),
    supabase.from("instrumentos").select("*").eq("ativo", true).order("ordem").order("nome"),
  ]);

  const lista = (membros ?? []) as unknown as Linha[];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl">Integrantes</h1>
        <p className="mt-2 text-sm text-suave">{lista.filter((m) => m.ativo).length} ativos de {lista.length} cadastrados.</p>
      </div>

      <FormularioConvite instrumentos={(instrumentos ?? []) as Instrumento[]} />

      <ul className="divide-y divide-borda rounded-xl border border-borda bg-superficie">
        {lista.map((m) => {
          const funcoes = m.perfil_instrumentos.map((p) => p.instrumentos?.nome).filter(Boolean).join(", ");
          const status = !m.ativo ? "Desativado" : m.primeiro_acesso_em ? "Ativo" : "Convite pendente";
          return (
            <li key={m.id} className="space-y-3 p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-medium">{m.nome_exibicao}{m.id === perfil.id && <span className="text-suave"> (você)</span>}</p>
                  <p className="truncate text-sm text-suave">{m.email}</p>
                  <p className="text-sm text-suave">{funcoes || "Sem instrumentos definidos"}</p>
                </div>
                <div className="flex gap-2">
                  {m.papel === "admin" && <span className="selo">Administrador</span>}
                  <span className="selo">{status}</span>
                </div>
              </div>
              <AcoesMembro id={m.id} nome={m.nome_exibicao} ativo={m.ativo} papel={m.papel} ehVoce={m.id === perfil.id} />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
