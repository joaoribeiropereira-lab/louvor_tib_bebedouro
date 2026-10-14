import { exigirUsuario } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { FormularioPerfil } from "@/components/FormularioPerfil";
import type { Instrumento } from "@/lib/types";
import { salvarMeuPerfil } from "./actions";

export const metadata = { title: "Meu perfil" };

export default async function PaginaPerfil() {
  const { perfil } = await exigirUsuario();
  const supabase = await createClient();

  const [{ data: instrumentos }, { data: meus }] = await Promise.all([
    supabase.from("instrumentos").select("*").eq("ativo", true).order("ordem").order("nome"),
    supabase.from("perfil_instrumentos").select("instrumento_id").eq("perfil_id", perfil.id),
  ]);

  return (
    <div className="max-w-xl">
      <h1 className="text-3xl">Meu perfil</h1>
      <p className="mb-8 mt-2 text-sm text-suave">{perfil.email}</p>
      <FormularioPerfil
        acao={salvarMeuPerfil}
        nome={perfil.nome_exibicao}
        tom={perfil.tom_preferido}
        mostrarTom
        instrumentos={(instrumentos ?? []) as Instrumento[]}
        selecionados={(meus ?? []).map((m) => m.instrumento_id as string)}
      />
    </div>
  );
}
