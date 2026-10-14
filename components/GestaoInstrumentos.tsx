"use client";

import { useActionState, useState, useTransition } from "react";
import { Alerta, BotaoEnviar } from "@/components/ui";
import type { Estado, Instrumento } from "@/lib/types";
import { alternarInstrumento, criarInstrumento } from "@/app/(app)/admin/instrumentos/actions";

export function GestaoInstrumentos({ instrumentos }: { instrumentos: Instrumento[] }) {
  const [estado, acao] = useActionState(criarInstrumento, null);
  const [retorno, setRetorno] = useState<Estado>(null);
  const [pendente, iniciar] = useTransition();

  return (
    <div className="space-y-6">
      <form action={acao} className="space-y-3 rounded-xl border border-borda bg-superficie p-5">
        <h2 className="text-xl">Adicionar instrumento ou função</h2>
        <Alerta estado={estado} />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label htmlFor="novo-nome" className="rotulo">Nome</label>
            <input id="novo-nome" name="nome" required minLength={2} maxLength={60} className="campo" placeholder="Ex.: Violino, Back vocal" />
          </div>
          <BotaoEnviar>Adicionar</BotaoEnviar>
        </div>
      </form>

      <Alerta estado={retorno} />
      <ul className="divide-y divide-borda rounded-xl border border-borda bg-superficie">
        {instrumentos.map((i) => (
          <li key={i.id} className="flex min-h-[56px] items-center justify-between gap-3 px-4 py-2">
            <span className={i.ativo ? "" : "text-suave line-through"}>{i.nome}</span>
            <button
              type="button"
              disabled={pendente}
              className={i.ativo ? "botao-secundario botao-pequeno" : "botao-primario botao-pequeno"}
              onClick={() => {
                if (i.ativo && !window.confirm(`Desativar “${i.nome}”? Ele deixa de aparecer para novas escolhas.`)) return;
                iniciar(async () => setRetorno(await alternarInstrumento(i.id, !i.ativo)));
              }}
            >
              {i.ativo ? "Desativar" : "Reativar"}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
