"use client";

import { useActionState } from "react";
import { definirSenha } from "./actions";
import { Alerta, BotaoEnviar } from "@/components/ui";

export default function PaginaDefinirSenha() {
  const [estado, acao] = useActionState(definirSenha, null);
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-tib.png" alt="Logo da TIB Bebedouro" width={64} height={64} className="mb-5 h-16 w-16" />
        <h1 className="text-2xl">Crie sua senha</h1>
        <p className="mb-6 mt-2 text-sm text-suave">Use pelo menos 8 caracteres. Depois disso você já entra na plataforma.</p>
        <form action={acao} className="space-y-4">
          <Alerta estado={estado} />
          <div>
            <label htmlFor="senha" className="rotulo">Nova senha</label>
            <input id="senha" name="senha" type="password" autoComplete="new-password" minLength={8} required className="campo" />
          </div>
          <div>
            <label htmlFor="confirmacao" className="rotulo">Repita a senha</label>
            <input id="confirmacao" name="confirmacao" type="password" autoComplete="new-password" minLength={8} required className="campo" />
          </div>
          <BotaoEnviar className="botao-primario w-full">Salvar senha</BotaoEnviar>
        </form>
      </div>
    </main>
  );
}
