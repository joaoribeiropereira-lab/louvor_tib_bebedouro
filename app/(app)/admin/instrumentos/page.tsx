import { exigirAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { GestaoInstrumentos } from "@/components/GestaoInstrumentos";
import type { Instrumento } from "@/lib/types";

export const metadata = { title: "Instrumentos e funções" };

export default async function PaginaInstrumentos() {
  await exigirAdmin();
  const supabase = await createClient();
  const { data } = await supabase.from("instrumentos").select("*").order("ordem").order("nome");

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl">Instrumentos e funções</h1>
        <p className="mt-2 text-sm text-suave">Esta lista aparece no perfil dos integrantes e, mais adiante, na montagem das escalas.</p>
      </div>
      <GestaoInstrumentos instrumentos={(data ?? []) as Instrumento[]} />
    </div>
  );
}
