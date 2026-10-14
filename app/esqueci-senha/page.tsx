"use client";

import Link from "next/link";
import { useActionState } from "react";
import { pedirRedefinicao } from "./actions";
import { Alerta, BotaoEnviar } from "@/components/ui";

export default function PaginaEsqueciSenha() {
  const [estado, acao] = useActionState(pedirRedefinicao, null);
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-tib.png" alt="Logo da TIB Bebedouro" width={64} height={64} className="mb-5 h-16 w-16" />
        <h1 className="text-2xl">Redefinir senha</h1>
        <p className="mb-6 mt-2 text-sm text-suave">Informe seu e-mail e enviaremos um link para criar uma nova senha.</p>
        <form action={acao} className="space-y-4">
          <Alerta estado={estado} />
          <div>
            <label htmlFor="email" className="rotulo">E-mail</label>
            <input id="email" name="email" type="email" autoComplete="email" required className="campo" />
          </div>
          <BotaoEnviar className="botao-primario w-full">Enviar link</BotaoEnviar>
          <p className="text-center text-sm">
            <Link href="/login" className="text-destaque underline underline-offset-4">Voltar ao login</Link>
          </p>
        </form>
      </div>
    </main>
  );
}
