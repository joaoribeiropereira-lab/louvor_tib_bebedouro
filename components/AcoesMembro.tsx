"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Alerta } from "@/components/ui";
import type { Estado, Papel } from "@/lib/types";
import { alterarAtivo, alterarPapel } from "@/app/(app)/admin/membros/actions";

export function AcoesMembro({ id, nome, ativo, papel, ehVoce }: { id: string; nome: string; ativo: boolean; papel: Papel; ehVoce: boolean }) {
  const [pendente, iniciar] = useTransition();
  const [retorno, setRetorno] = useState<Estado>(null);

  function executar(confirmacao: string, fn: () => Promise<Estado>) {
    if (!window.confirm(confirmacao)) return;
    iniciar(async () => setRetorno(await fn()));
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <Link href={`/admin/membros/${id}`} className="botao-secundario botao-pequeno">Editar</Link>
        {!ehVoce && (
          <>
            <button
              type="button"
              disabled={pendente}
              className="botao-secundario botao-pequeno"
              onClick={() =>
                executar(
                  papel === "admin" ? `Tornar ${nome} um membro comum?` : `Dar acesso de administrador a ${nome}?`,
                  () => alterarPapel(id, papel === "admin" ? "membro" : "admin"),
                )
              }
            >
              {papel === "admin" ? "Tornar membro" : "Tornar admin"}
            </button>
            <button
              type="button"
              disabled={pendente}
              className={ativo ? "botao-perigo botao-pequeno" : "botao-secundario botao-pequeno"}
              onClick={() =>
                executar(
                  ativo ? `Desativar ${nome}? A pessoa perde o acesso, mas o histórico é mantido.` : `Reativar ${nome}?`,
                  () => alterarAtivo(id, !ativo),
                )
              }
            >
              {ativo ? "Desativar" : "Reativar"}
            </button>
          </>
        )}
      </div>
      <Alerta estado={retorno} />
    </div>
  );
}
