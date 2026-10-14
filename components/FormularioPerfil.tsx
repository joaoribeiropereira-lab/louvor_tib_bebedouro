"use client";

import { useActionState } from "react";
import { Alerta, BotaoEnviar } from "@/components/ui";
import { TONS_MAIORES, TONS_MENORES, type Estado, type Instrumento } from "@/lib/types";

type Props = {
  acao: (estado: Estado, formData: FormData) => Promise<Estado>;
  perfilId?: string;
  nome: string;
  tom?: string | null;
  mostrarTom?: boolean;
  instrumentos: Instrumento[];
  selecionados: string[];
};

export function FormularioPerfil({ acao, perfilId, nome, tom, mostrarTom = false, instrumentos, selecionados }: Props) {
  const [estado, enviar] = useActionState(acao, null);
  return (
    <form action={enviar} className="space-y-6">
      {perfilId && <input type="hidden" name="perfil_id" value={perfilId} />}
      <Alerta estado={estado} />

      <div>
        <label htmlFor="nome" className="rotulo">Nome de exibição</label>
        <input id="nome" name="nome" defaultValue={nome} required minLength={2} maxLength={80} className="campo" />
      </div>

      <fieldset>
        <legend className="rotulo">Instrumentos e funções</legend>
        <p className="ajuda mb-2">Marque todos os que a pessoa toca ou exerce.</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {instrumentos.map((i) => (
            <label key={i.id} className="flex min-h-[44px] items-center gap-3 rounded-lg border border-borda px-3 text-sm">
              <input
                type="checkbox"
                name="instrumentos"
                value={i.id}
                defaultChecked={selecionados.includes(i.id)}
                className="h-4 w-4 accent-[rgb(var(--destaque))]"
              />
              {i.nome}
            </label>
          ))}
        </div>
      </fieldset>

      {mostrarTom && (
        <div>
          <label htmlFor="tom" className="rotulo">Tom de preferência</label>
          <select id="tom" name="tom" defaultValue={tom ?? ""} className="campo">
            <option value="">Sem preferência</option>
            <optgroup label="Maiores">
              {TONS_MAIORES.map((t) => <option key={t} value={t}>{t}</option>)}
            </optgroup>
            <optgroup label="Menores">
              {TONS_MENORES.map((t) => <option key={t} value={t}>{t}</option>)}
            </optgroup>
          </select>
          <p className="ajuda">Será usado como sugestão ao transpor músicas, a partir da Fase 2.</p>
        </div>
      )}

      <BotaoEnviar>Salvar alterações</BotaoEnviar>
    </form>
  );
}
