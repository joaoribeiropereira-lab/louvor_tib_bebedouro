import { redirect } from "next/navigation";
import { getSessao } from "@/lib/auth";
import { FormularioLogin } from "./FormularioLogin";

export const metadata = { title: "Entrar" };

const AVISOS: Record<string, string> = {
  desativado: "Sua conta está desativada. Fale com um administrador.",
  link: "Este link expirou ou já foi usado. Peça um novo convite ou redefina sua senha.",
};

export default async function PaginaLogin({ searchParams }: { searchParams: Promise<{ erro?: string }> }) {
  const sessao = await getSessao();
  if (sessao?.perfil.ativo) redirect("/");
  const { erro } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-tib.png" alt="Logo da TIB Bebedouro" width={96} height={96} className="mb-6 h-24 w-24" />
        <h1 className="text-3xl leading-tight">Grupo de Louvor<br />TIB Bebedouro</h1>
        <p className="mb-8 mt-2 text-sm text-suave">Acesso restrito aos integrantes. Entre com o e-mail do seu convite.</p>
        <FormularioLogin aviso={erro ? AVISOS[erro] : undefined} />
      </div>
    </main>
  );
}
