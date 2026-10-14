"use client";

import Link from "next/link";
import { useActionState } from "react";
import { entrar } from "./actions";
import { Alerta, BotaoEnviar } from "@/components/ui";

export function FormularioLogin({ aviso }: { aviso?: string }) {
  const [estado, acao] = useActionState(entrar, null);
  return (
    <form action={acao} className="space-y-4">
      {aviso && <Alerta estado={{ erro: aviso }} />}
      <Alerta estado={estado} />
      <div>
        <label htmlFor="email" className="rotulo">E-mail</label>
        <input id="email" name="email" type="email" autoComplete="email" required className="campo" />
      </div>
      <div>
        <label htmlFor="senha" className="rotulo">Senha</label>
        <input id="senha" name="senha" type="password" autoComplete="current-password" required className="campo" />
      </div>
      <BotaoEnviar className="botao-primario w-full">Entrar</BotaoEnviar>
      <p className="text-center text-sm">
        <Link href="/esqueci-senha" className="text-destaque underline underline-offset-4">Esqueci minha senha</Link>
      </p>
    </form>
  );
}
