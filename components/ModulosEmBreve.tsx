const MODULOS = [
  { nome: "Escalas e confirmação de presença", fase: 5 },
  { nome: "Banco de músicas e cifras", fase: 2 },
  { nome: "Repertórios", fase: 3 },
  { nome: "Modo de ensaio", fase: 4 },
  { nome: "Importação de cifras", fase: 6, soAdmin: true },
  { nome: "Treinamento musical", fase: 7 },
];

export function ModulosEmBreve({ admin }: { admin: boolean }) {
  return (
    <section aria-labelledby="proximos">
      <h2 id="proximos" className="mb-1 text-xl">Chegando nas próximas fases</h2>
      <p className="mb-3 text-sm text-suave">Estas áreas ainda não foram construídas, por isso não mostram números.</p>
      <ul className="divide-y divide-borda rounded-xl border border-borda bg-superficie">
        {MODULOS.filter((m) => admin || !m.soAdmin).map((m) => (
          <li key={m.nome} className="flex min-h-[48px] items-center justify-between gap-3 px-4 text-sm">
            <span>{m.nome}</span>
            <span className="selo">Fase {m.fase}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
