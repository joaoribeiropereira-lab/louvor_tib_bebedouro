import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

async function sair(request: NextRequest) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  const url = new URL("/login", request.url);
  const motivo = request.nextUrl.searchParams.get("motivo");
  if (motivo === "desativado") url.searchParams.set("erro", "desativado");
  return NextResponse.redirect(url, { status: 303 });
}

export const GET = sair;
export const POST = sair;
