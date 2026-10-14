import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

/** Recebe os links de convite e de redefinição de senha enviados por e-mail. */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const tipo = searchParams.get("type") as EmailOtpType | null;
  const codigo = searchParams.get("code");

  const padrao = tipo === "invite" || tipo === "recovery" ? "/definir-senha" : "/";
  const pedido = searchParams.get("next");
  const destino = pedido && pedido.startsWith("/") && !pedido.startsWith("//") ? pedido : padrao;

  const supabase = await createClient();
  let falhou = true;

  if (tokenHash && tipo) {
    const { error } = await supabase.auth.verifyOtp({ type: tipo, token_hash: tokenHash });
    falhou = Boolean(error);
  } else if (codigo) {
    const { error } = await supabase.auth.exchangeCodeForSession(codigo);
    falhou = Boolean(error);
  }

  if (falhou) return NextResponse.redirect(`${origin}/login?erro=link`);
  return NextResponse.redirect(`${origin}${destino}`);
}
