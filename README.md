# Grupo de Louvor TIB Bebedouro — Fase 1 (Fundação)

Next.js 15 + TypeScript + Tailwind + Supabase (PostgreSQL, Auth e RLS). Hospedagem: GitHub + Vercel.

## O que a Fase 1 entrega
- Login com e-mail e senha, recuperação de senha e criação de senha pelo convite.
- Acesso **privado**: sem cadastro público. Integrantes entram só por convite do administrador.
- Papéis `admin` e `membro`, verificados no servidor (cada página e ação) **e** no banco (RLS e gatilhos).
- Perfil do integrante: nome, instrumentos/funções e tom de preferência.
- Administração: convidar, editar, desativar/reativar integrantes, mudar papel, gerenciar instrumentos.
- Desativar bloqueia o login de verdade (ban no Auth) e mantém o histórico.
- Auditoria das ações administrativas, exibida como "Atividade recente".
- Dashboard de membro e de administrador, com dados reais do banco. Módulos das próximas fases aparecem como "Fase N", sem números inventados.
- Logo da TIB no login, no menu e como ícone do navegador (`public/logo-tib.png`, `app/icon.png`).
- Tema escuro (padrão) e claro, responsivo, navegação por teclado, foco visível.

## 1. Criar o projeto no Supabase
1. Em supabase.com, crie uma conta e um projeto (plano Free).
2. **SQL Editor**: cole e execute o conteúdo de `supabase/migrations/0001_fundacao.sql`.
3. **Authentication > Sign In / Providers**: desligue **Allow new users to sign up**.
4. **Authentication > URL Configuration**: em *Site URL*, coloque o endereço do site (em desenvolvimento, `http://localhost:3000`; ao publicar, o endereço da Vercel). Adicione o mesmo endereço em *Redirect URLs*.
5. **Authentication > Email Templates**: troque o link nos modelos abaixo.
   - **Invite user**: `<a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=invite">Aceitar convite</a>`
   - **Reset password**: `<a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery">Criar nova senha</a>`
6. **Project Settings > API**: copie a URL, a chave `anon` e a chave `service_role`.

## 2. Primeiro administrador
1. **Authentication > Users > Add user > Create new user**, com o seu e-mail e uma senha, marcando **Auto Confirm User**.
2. No SQL Editor, rode `supabase/bootstrap_primeiro_admin.sql` com o seu e-mail.

## 3. Rodar no computador
```bash
cp .env.example .env.local   # preencha com as chaves do passo 1.6
npm install
npm run dev                  # http://localhost:3000
```

## 4. Publicar (GitHub + Vercel)
1. Crie um repositório **privado** no GitHub e envie o código (`.env.local` já está no `.gitignore`).
2. Na Vercel, **Add New > Project**, importe o repositório.
3. Em *Environment Variables*, cadastre `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` e `SUPABASE_SERVICE_ROLE_KEY`.
4. Depois do deploy, volte ao Supabase (passo 1.4) e troque *Site URL* e *Redirect URLs* pelo endereço da Vercel.

## Segurança
- `SUPABASE_SERVICE_ROLE_KEY` só é lida em `lib/supabase/admin.ts` (importa `server-only`), e só depois de `exigirAdmin()`.
- Um membro não consegue virar admin nem se reativar: o gatilho `proteger_campos_perfil` bloqueia isso no banco, mesmo com chamadas diretas à API.
- O banco nunca deixa o grupo sem um administrador ativo.
- Membros enxergam só o próprio perfil. A lista de colegas (só o nome) vem da view `diretorio`.

## Limitações conhecidas
- O envio de e-mail embutido do Supabase Free é limitado a poucos e-mails por hora. Para convidar o grupo todo de uma vez, configure um SMTP próprio (ex.: Resend, plano gratuito) em *Authentication > SMTP Settings*.
- O Supabase Free pausa o projeto após cerca de 1 semana sem uso (reativa com um clique).
- A escolha de tema fica salva no navegador. Preferências salvas na conta entram na Fase 4.
- Backup: o plano Free não inclui backups automáticos. A estratégia de backup entra na Fase 8.

## Teste manual da Fase 1
1. Como admin, convide um e-mail seu de teste; abra o link e crie a senha.
2. Entre como esse membro: o menu **não** mostra "Administração".
3. Como membro, acesse `/admin/membros` pela barra de endereço: deve voltar para o início.
4. Desative o membro: ele não consegue mais entrar. Reative: volta a entrar.
5. Tente desativar o único admin: deve ser recusado.
6. Teste no celular e no computador, nos dois temas.

## Estrutura
```
app/            páginas e ações (login, (app)/ com área logada, admin/)
components/     interface reutilizável
lib/            clientes Supabase, auth, validações
supabase/       migração SQL e script do primeiro admin
```
