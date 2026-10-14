import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Grupo de Louvor TIB Bebedouro", template: "%s · Louvor TIB Bebedouro" },
  description: "Escalas, cifras e repertórios do Grupo de Louvor TIB Bebedouro.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1 };

// Tema escuro por padrão; só vira claro se a pessoa escolheu "claro".
const scriptTema = `try{if(localStorage.getItem('tema')!=='claro')document.documentElement.classList.add('dark')}catch(e){document.documentElement.classList.add('dark')}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: scriptTema }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
