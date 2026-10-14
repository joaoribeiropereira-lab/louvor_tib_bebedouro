import { Navegacao } from "@/components/Navegacao";
import { exigirUsuario } from "@/lib/auth";

export default async function LayoutApp({ children }: { children: React.ReactNode }) {
  const { perfil } = await exigirUsuario();
  return (
    <div className="min-h-screen">
      <Navegacao nome={perfil.nome_exibicao} admin={perfil.papel === "admin"} />
      <main className="px-4 py-6 lg:ml-64 lg:px-10 lg:py-10">
        <div className="mx-auto max-w-4xl">{children}</div>
      </main>
    </div>
  );
}
