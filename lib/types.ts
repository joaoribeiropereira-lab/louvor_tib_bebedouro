export type Papel = "admin" | "membro";

export type Perfil = {
  id: string;
  email: string;
  nome_exibicao: string;
  papel: Papel;
  ativo: boolean;
  tom_preferido: string | null;
  primeiro_acesso_em: string | null;
  criado_em: string;
};

export type Instrumento = { id: string; nome: string; ativo: boolean; ordem: number };

/** Resultado padrão das ações de formulário. */
export type Estado = { erro?: string; ok?: string } | null;

const NOTAS = ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"];
export const TONS_MAIORES = NOTAS;
export const TONS_MENORES = NOTAS.map((n) => `${n}m`);
