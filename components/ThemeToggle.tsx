"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [escuro, setEscuro] = useState(true);

  useEffect(() => {
    setEscuro(document.documentElement.classList.contains("dark"));
  }, []);

  function alternar() {
    const proximo = !escuro;
    document.documentElement.classList.toggle("dark", proximo);
    try {
      localStorage.setItem("tema", proximo ? "escuro" : "claro");
    } catch {}
    setEscuro(proximo);
  }

  return (
    <button
      type="button"
      onClick={alternar}
      className="botao-secundario botao-pequeno w-full justify-start"
      aria-label={escuro ? "Mudar para o tema claro" : "Mudar para o tema escuro"}
    >
      {escuro ? <Sun size={16} aria-hidden /> : <Moon size={16} aria-hidden />}
      {escuro ? "Tema claro" : "Tema escuro"}
    </button>
  );
}
