import type { Config } from "tailwindcss";

const cor = (v: string) => `rgb(var(--${v}) / <alpha-value>)`;

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        fundo: cor("fundo"),
        superficie: cor("superficie"),
        superficie2: cor("superficie2"),
        borda: cor("borda"),
        texto: cor("texto"),
        suave: cor("suave"),
        destaque: cor("destaque"),
        "destaque-texto": cor("destaque-texto"),
        perigo: cor("perigo"),
        sucesso: cor("sucesso"),
      },
      fontFamily: {
        titulo: ['"Iowan Old Style"', '"Palatino Linotype"', "Palatino", "Georgia", "serif"],
        sans: ["system-ui", "-apple-system", '"Segoe UI"', "Roboto", "sans-serif"],
        cifra: ['"JetBrains Mono"', "ui-monospace", "Menlo", "Consolas", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
