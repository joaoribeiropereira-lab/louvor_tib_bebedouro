"use client";

import { useActionState } from "react";
import { Alerta, BotaoEnviar } from "@/components/ui";
import type { Instrumento } from "@/lib/types";
import { convidarMembro } from "@/app/(app)/admin/membros/actions";

export function FormularioConvite({ instrumentos }: { instrumentos: Instrumento[] }) {
  const [estado, acao] = useActionState(convidarMembro, null);
  return (
    <form action={acao} className="space-y-4 rounded-xl border border-borda bg-superficie p-5">
      <h2 className="text-xl">Convidar integrante</h2>
      <Alerta estado={estado} />
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="conv-nome" className="rotulo">Nome</label>
          <input id="conv-nome" name="nome" required minLength={2} maxLength={80} className="campo" />
        </div>
        <div>
          <label htmlFor="conv-email" className="rotulo">E-mail</label>
          <input id="conv-email" name="email" type="email" required className="campo" />
        </div>
      </div>
      <fieldset>
        <legend className="rotulo">Instrumentos e funções</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {instrumentos.map((i) => (
            <label key={i.id} className="flex min-h-[44px] items-center gap-3 rounded-lg border border-borda px-3 text-sm">
              <input type="checkbox" name="instrumentos" value={i.id} className="h-4 w-4 accent-[rgb(var(--destaque))]" />
              {i.nome}
            </label>
          ))}
        </div>
      </fieldset>
      <div>
        <label htmlFor="conv-papel" className="rotulo">Acesso</label>
        <select id="conv-papel" name="papel" defaultValue="membro" className="campo">
          <option value="membro">Membro</option>
          <option value="admin">Administrador</option>
        </select>
      </div>
      <BotaoEnviar>Enviar convite</BotaoEnviar>
    </form>
  );
}
