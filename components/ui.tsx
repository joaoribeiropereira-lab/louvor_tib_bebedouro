"use client";

import { useFormStatus } from "react-dom";
import type { Estado } from "@/lib/types";

export function BotaoEnviar({
  children,
  className = "botao-primario",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={className}>
      {pending ? "Aguarde…" : children}
    </button>
  );
}

export function Alerta({ estado }: { estado: Estado }) {
  if (!estado?.erro && !estado?.ok) return null;
  const erro = Boolean(estado.erro);
  return (
    <p
      role={erro ? "alert" : "status"}
      className={`rounded-lg border px-3 py-2 text-sm ${
        erro ? "border-perigo/40 bg-perigo/10 text-perigo" : "border-sucesso/40 bg-sucesso/10 text-sucesso"
      }`}
    >
      {estado.erro ?? estado.ok}
    </p>
  );
}
