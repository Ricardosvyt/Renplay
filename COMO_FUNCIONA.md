# RenPlay — contexto para outras IAs

Este arquivo é o mapa rápido do projeto. Leia antes de alterar código, banco de dados ou autenticação.

## Objetivo do produto

RenPlay é uma plataforma para descobrir e distribuir visual novels. O site possui uma página inicial pública, login de conta, portal do usuário e uma área administrativa para catálogo, publicações e usuários.

## Tecnologia

- Next.js 16 com App Router.
- React 19 e TypeScript.
- Tailwind CSS e estilos globais em `src/app/globals.css`.
- PostgreSQL hospedado no Neon, acessado com `pg`.
- Senhas protegidas com `bcryptjs`.
- Sessões web guardadas no banco e identificadas pelo cookie HttpOnly `renplay_session`.

## Identidade visual

O design oficial usa a linguagem da página de login:

- Fundo: `#090A0F`.
- Superfície: `#12141D`.
- Borda: `#29292F`.
- Destaque: `#FFDE00`.
- Texto principal: `#F5F5F5`.
- Texto secundário: tons de `zinc`.
- Usar SVG para ícones; não usar emojis como ícones de interface.
- A personagem principal é a Rina. Usar os PNGs transparentes existentes em `public/`.

## Páginas principais

- `/`: página inicial, hero da Rina, download do launcher, catálogo, filtros, FAQ e modal de detalhes.
- `/login`: autenticação de usuário; em caso de sucesso encaminha para `/dashboard`.
- `/dashboard`: painel administrativo com visão geral, catálogo, equipe e configurações.
- `/dashboard/publish`: publicação de jogos.
- `/dashboard/usuarios`: gerenciamento de usuários.
- `/portal`: área da conta.
- `/dev`: área de desenvolvimento.
- `/login-original`: cópia de referência da versão antiga do login.

## APIs

- `POST /api/auth/login`: valida usuário/e-mail e senha, aplica limite de tentativas e cria sessão.
- `GET /api/auth/me`: retorna a sessão atual.
- `POST /api/auth/logout`: revoga a sessão atual.
- `GET /api/games`: catálogo público.
- `GET /api/launcher`: informações do launcher.
- `/api/users`: operações administrativas de usuários; exige sessão e papel `ADMIN`.
- `/api/health`: verificação básica da aplicação.

## Autenticação

O login usa `src/lib/auth.ts` e `src/lib/db.ts`. O cookie de sessão é HttpOnly, usa `SameSite=Lax` e fica seguro em produção. As rotas protegidas são redirecionadas pelo `src/proxy.ts` quando não existe `renplay_session`.

Não remover o limite de tentativas da tabela `rp_limits`. Não armazenar senhas em texto puro, não colocar `DATABASE_URL` no código e não retornar mensagens com senha, token ou string de conexão.

## Banco de dados

As migrações ficam em `db/migrations/` e devem ser aplicadas nesta ordem:

1. `001_platform.sql`
2. `002_asset_validation.sql`
3. `003_policies.sql`
4. `004_auth_indexes.sql`

As tabelas mais importantes são `rp_users`, `rp_user_roles`, `rp_sessions`, `rp_limits`, `rp_games`, `rp_assets`, `rp_builds`, `rp_translations` e `rp_audit`.

O arquivo `db/schema.sql` é uma estrutura legada de referência para `staff_users`; o fluxo atual de login usa as tabelas `rp_*` das migrações.

## Como executar

```bash
npm install
npm run dev
```

É necessário configurar `DATABASE_URL` no `.env`. Depois de alterar banco, reinicie o servidor Next.js para limpar conexões e cache de desenvolvimento.

## Banco de teste

Para um reset completo e controlado, use `node scripts/reset-database.mjs --confirm-reset`. Esse comando apaga as tabelas `rp_*` e reaplica todas as migrações. Depois, `node scripts/seed-test-accounts.mjs` cria as contas de teste documentadas em `CONTAS_TESTE.md`.

Nunca execute o reset em produção sem um backup e uma confirmação explícita do ambiente.

## Regras para futuras IAs

1. Inspecionar os arquivos existentes antes de editar.
2. Preservar as mudanças do usuário e não usar `git reset --hard`.
3. Não apagar banco ou arquivos sem confirmação explícita do escopo.
4. Fazer mudanças pequenas e validar com `npx tsc --noEmit`.
5. Manter o design preto/dourado e a responsividade.
6. Mostrar erros de formulário próximos ao campo ou ação que falhou.
7. Ao mudar autenticação, revisar cookie, sessão, rate limit e autorização juntos.

