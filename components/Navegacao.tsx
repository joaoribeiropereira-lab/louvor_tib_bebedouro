"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  CalendarDays, ClipboardList, GraduationCap, Home, ListMusic, LogOut, Menu, Mic2, Music,
  SlidersHorizontal, UserCircle, Users, X,
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

type Item = { href: string; rotulo: string; icone: React.ReactNode; fase?: number };

const PRINCIPAL: Item[] = [
  { href: "/", rotulo: "Início", icone: <Home size={18} aria-hidden /> },
  { href: "/escalas", rotulo: "Escalas", icone: <CalendarDays size={18} aria-hidden />, fase: 5 },
  { href: "/musicas", rotulo: "Músicas", icone: <Music size={18} aria-hidden />, fase: 2 },
  { href: "/repertorios", rotulo: "Repertórios", icone: <ListMusic size={18} aria-hidden />, fase: 3 },
  { href: "/ensaio", rotulo: "Modo de ensaio", icone: <Mic2 size={18} aria-hidden />, fase: 4 },
  { href: "/treinamento", rotulo: "Treinamento musical", icone: <GraduationCap size={18} aria-hidden />, fase: 7 },
  { href: "/perfil", rotulo: "Meu perfil", icone: <UserCircle size={18} aria-hidden /> },
];

const ADMIN: Item[] = [
  { href: "/admin/membros", rotulo: "Integrantes", icone: <Users size={18} aria-hidden /> },
  { href: "/admin/instrumentos", rotulo: "Instrumentos", icone: <SlidersHorizontal size={18} aria-hidden /> },
  { href: "/admin/importar", rotulo: "Importar cifras", icone: <ClipboardList size={18} aria-hidden />, fase: 6 },
];

function Linha({ item, ativo, aoClicar }: { item: Item; ativo: boolean; aoClicar: () => void }) {
  const base = "flex min-h-[44px] items-center gap-3 rounded-lg px-3 text-sm";
  if (item.fase) {
    return (
      <li>
        <span className={`${base} cursor-not-allowed text-suave/70`} aria-disabled="true">
          {item.icone}
          <span className="flex-1">{item.rotulo}</span>
          <span className="selo">Fase {item.fase}</span>
        </span>
      </li>
    );
  }
  return (
    <li>
      <Link
        href={item.href}
        onClick={aoClicar}
        aria-current={ativo ? "page" : undefined}
        className={`${base} ${ativo ? "bg-destaque/15 font-medium text-destaque" : "hover:bg-superficie2"}`}
      >
        {item.icone}
        {item.rotulo}
      </Link>
    </li>
  );
}

export function Navegacao({ nome, admin }: { nome: string; admin: boolean }) {
  const caminho = usePathname();
  const [aberto, setAberto] = useState(false);
  const fechar = () => setAberto(false);
  const ativo = (href: string) => (href === "/" ? caminho === "/" : caminho.startsWith(href));

  const conteudo = (
    <div className="flex h-full flex-col gap-4 p-4">
      <div className="flex items-center gap-3 px-1">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-tib.png" alt="" width={44} height={44} className="h-11 w-11 shrink-0" />
        <div>
          <p className="font-titulo text-lg leading-tight">Grupo de Louvor</p>
          <p className="text-sm text-suave">TIB Bebedouro</p>
        </div>
      </div>

      <nav aria-label="Principal" className="flex-1 space-y-4 overflow-y-auto">
        <ul className="space-y-1">
          {PRINCIPAL.map((i) => <Linha key={i.href} item={i} ativo={ativo(i.href)} aoClicar={fechar} />)}
        </ul>
        {admin && (
          <div>
            <p className="px-3 pb-1 text-xs text-suave">Administração</p>
            <ul className="space-y-1">
              {ADMIN.map((i) => <Linha key={i.href} item={i} ativo={ativo(i.href)} aoClicar={fechar} />)}
            </ul>
          </div>
        )}
      </nav>

      <div className="space-y-2 border-t border-borda pt-3">
        <p className="truncate px-1 text-sm text-suave">{nome}</p>
        <ThemeToggle />
        <form action="/auth/sair" method="post">
          <button type="submit" className="botao-secundario botao-pequeno w-full justify-start">
            <LogOut size={16} aria-hidden /> Sair
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-borda bg-superficie px-4 py-2 lg:hidden">
        <div className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-tib.png" alt="" width={32} height={32} className="h-8 w-8" />
          <p className="font-titulo">Louvor TIB Bebedouro</p>
        </div>
        <button
          type="button"
          onClick={() => setAberto(true)}
          className="botao-secundario botao-pequeno"
          aria-label="Abrir menu"
          aria-expanded={aberto}
        >
          <Menu size={18} aria-hidden />
        </button>
      </header>

      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-borda bg-superficie lg:block">
        {conteudo}
      </aside>

      {aberto && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <button type="button" className="absolute inset-0 bg-black/60" onClick={fechar} aria-label="Fechar menu" />
          <div className="relative h-full w-72 max-w-[85%] bg-superficie shadow-xl">
            <button
              type="button"
              onClick={fechar}
              className="botao-secundario botao-pequeno absolute right-3 top-3"
              aria-label="Fechar menu"
            >
              <X size={16} aria-hidden />
            </button>
            {conteudo}
          </div>
        </div>
      )}
    </>
  );
}
