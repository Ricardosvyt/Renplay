# RELATÓRIO DE INTEGRAÇÃO — RENPLAY

**Site:** `https://renplay.site` (`D:\Renpyzinho\Renplay`)  
**Launcher:** RenPlay Desktop (`D:\Renpyzinho\launcher`)  
**Banco de Dados:** Neon PostgreSQL  
**Data:** 22/10/2026  
**Status:** Integração Concluída e Testada com Sucesso  

---

## 1. RESUMO EXECUTIVO E ARQUITETURA FINAL

A plataforma **RenPlay** foi unificada sob uma arquitetura de dados e autenticação centralizada:

```
                  ┌──────────────────────────────────────────────┐
                  │               Neon PostgreSQL                │
                  │  (rp_users, rp_sessions, rp_games,           │
                  │   rp_library, rp_builds, rp_translations)    │
                  └──────────────────────┬───────────────────────┘
                                         │
                                         ▼
                  ┌──────────────────────────────────────────────┐
                  │             RenPlay API (Next.js)            │
                  │             https://renplay.site             │
                  │  /api/v1/auth/* | /api/v1/library/*          │
                  │  /api/v1/games/* | /api/games | /api/users   │
                  └───────────────┬──────────────┬───────────────┘
                                  │              │
                   Sessão Cookie  │              │  Bearer Token / PKCE
                                  ▼              ▼
           ┌─────────────────────────────┐   ┌─────────────────────────────┐
           │        RenPlay Site         │   │       RenPlay Launcher      │
           │      (Web / Dashboard)      │   │     (Electron / Desktop)    │
           │                             │   │                             │
           │ • Catálogo público          │   │ • Catálogo espelhado        │
           │ • Minha Biblioteca (Nuvem)  │   │ • Minha Biblioteca (Nuvem)  │
           │ • Painel Administrativo     │   │ • Instalações Locais        │
           │ • Assistente de Publicação  │   │ • Player & Saves locais     │
           └─────────────────────────────┘   └─────────────────────────────┘
```

### Regras Centrais Aplicadas:
1. **Identidade Unificada:** O usuário utiliza a mesma conta (`rp_users`) no site e no launcher.
2. **Catálogo Global vs. Biblioteca Pessoal:**
   - O catálogo (`rp_games`) reúne todos os títulos publicados.
   - A biblioteca pessoal (`rp_library`) contém exclusivamente os jogos adicionados pelo próprio usuário.
   - Jogos criados ou publicados no painel administrativo **não** são despejados na biblioteca pessoal de ninguém automaticamente.
3. **Instalações Locais Distintas:**
   - Jogos instalados no disco pelo launcher mantêm estado local protegido (`.renplay-install.json`).
   - Remover um jogo da biblioteca em nuvem **não apaga** os arquivos instalados no computador.
   - Desinstalar pelo launcher remove os arquivos gerenciados preservando saves em `game/saves`.

---

## 2. TABELAS DO BANCO DE DADOS (NEON POSTGRESQL)

| Tabela | Função | Chaves e Restrições |
| :--- | :--- | :--- |
| `rp_users` | Contas de usuários, desenvolvedores e administradores | PK: `id`, UNIQUE: `username`, `email`, Hash: `Argon2id` |
| `rp_sessions` | Sessões ativas (web e desktop) | PK: `id`, FK: `user_id`, Índices de expiração e hash de token |
| `rp_games` | Catálogo central de jogos e visual novels | PK: `id`, status: `PUBLISHED`, `DRAFT`, `SUSPENDED`, `ARCHIVED` |
| `rp_library` | Vínculo entre usuário e seus jogos adquiridos/adicionados | PK composta: `(user_id, game_id)`, FKs em `rp_users` e `rp_games` |
| `rp_builds` | Versões de instalação, binários e manifests | PK: `id`, FK: `game_id` |
| `rp_translations` | Pacotes de tradução oficiais e comunitários | PK: `id`, FK: `game_id` |
| `rp_reports` | Auditoria e relatórios de moderação | PK: `id`, FKs rastreáveis |

---

## 3. ENDPOINTS DA API CENTRALIZADA

### A. Autenticação Unificada (`/lib/auth.ts`)
- **`getSessionUser(request?: Request)`**: Identifica o usuário de forma agnóstica via **Bearer Token** (Launcher Desktop) ou via **Cookie HTTP-Only `renplay_session`** (Navegador Web).
- **`POST /api/v1/auth/login`**: Emite `accessToken` e `refreshToken` para o launcher.
- **`POST /api/v1/auth/refresh`**: Rotação segura de tokens para manter o launcher conectado sem interrupções.

### B. Biblioteca Pessoal Sincronizada
- **`GET /api/v1/library`**:
  - Retorna todos os jogos vinculados ao usuário autenticado (`rp_library JOIN rp_games`).
  - Cache: `no-store` para refletir adições/remoções imediatas entre abas e aplicativos.
- **`POST /api/v1/library` & `POST /api/v1/library/[gameId]`**:
  - Adiciona o jogo à biblioteca pessoal do usuário autenticado de forma idempotente (`ON CONFLICT (user_id, game_id) DO NOTHING`).
  - Valida se o jogo existe e está publicado (`status = 'PUBLISHED'`).
- **`DELETE /api/v1/library` & `DELETE /api/v1/library/[gameId]`**:
  - Remove com segurança o vínculo da biblioteca do usuário autenticado no Neon sem afetar outros usuários nem dados locais de instalação.

### C. Catálogo & Manifests de Instalação
- **`GET /api/v1/games`**:
  - Lista catálogo público para o launcher (`distribution_authorized = true`).
- **`GET /api/v1/games/[id]/manifest`**:
  - Retorna o manifesto verificado de instalação (`schemaVersion: 1`, `downloadUrl`, `sizeBytes`, `sha256`, `executable`, `files`).
  - Exige autenticação e autorização prévia.
- **`GET /api/games`**:
  - Catálogo público para o site (`status = 'PUBLISHED'`), com suporte a busca (`q=`) e gênero (`genre=`).
  - Permite aos administradores/desenvolvedores listar jogos em rascunho com `includeAll=true`.
- **`PATCH /api/games`**:
  - Endpoint administrativo para transição de estados (`PUBLISHED`, `DRAFT`, `SUSPENDED`, `ARCHIVED`) e destaque (`featured`).
- **`POST /api/games`**:
  - Publicação de novos jogos através do assistente de publicação.

---

## 4. ALTERAÇÕES IMPLEMENTADAS NO SITE (`Renplay`)

1. **Assistente de Publicação em 6 Categorias (`/dashboard/jogos/publish`):**
   - **Etapa 1:** Identidade Visual & GitHub (Nome, Banner/Capa com upload local e URL externa, Repositório GitHub).
   - **Etapa 2:** Informações & Sinopse (Desenvolvedor, Versão semântica, Gênero, Engine, Sinopse).
   - **Etapa 3:** Idiomas, Plataformas & Classificação (Português, Inglês, Espanhol, Windows, Adulto 18+).
   - **Etapa 4:** Galeria de Screenshots (Upload e URLs de prévia).
   - **Etapa 5:** Arquivos & Download (Link direto HTTPS, Espelho Pixeldrain, SHA-256 e executável).
   - **Etapa 6:** Publicação & Revisão (Rascunho ou Publicado no Neon).

2. **Portal da Conta (`/portal`):**
   - Conectado em tempo real à API `/api/v1/library` e `/api/v1/auth/me`.
   - Renderização dos jogos reais do usuário no Neon PostgreSQL.
   - Ação de remoção da biblioteca pessoal via `DELETE /api/v1/library`.
   - Botão para abrir o jogo diretamente no Desktop (`renplay://launch/${game.id}`).
   - Estado vazio elegante com convite para explorar o catálogo.

3. **Página Inicial & Modal de Detalhes (`/`):**
   - Botão dinâmico "+ Adicionar à Minha Biblioteca" / "✓ Na sua biblioteca (Remover)" integrado à API.
   - Sincronização automática com a sessão do usuário.
   - Atalho direto para iniciar o Launcher oficial.

4. **Painel Administrativo (`/dashboard`):**
   - Filtros de status no catálogo: **Todos**, **Publicados**, **Rascunhos**, **Arquivados**.
   - Ações instantâneas: **Publicar**, **Despublicar (Rascunho)**, **Arquivar** e **Excluir** via `PATCH /api/games`.

---

## 5. ALTERAÇÕES IMPLEMENTADAS NO LAUNCHER (`launcher`)

1. **Sincronização da Biblioteca na Inicialização e Login:**
   - `account-ipc.js` agora busca a biblioteca imediatamente após o login bem-sucedido e após o registro.
   - Adicionado handler `library-remove` para desconectar títulos da conta.
   - Adicionado handler `library-sync` para atualização sob demanda e recuperação pós-offline.

2. **Aba "Meus Jogos" (`renderer.js`):**
   - **Fim do vazamento de catálogo:** Quando a biblioteca do usuário está vazia, o launcher não exibe mais todos os jogos do catálogo como se fossem do usuário.
   - Exibição estrita: jogos vinculados à conta (`state.cloudLibrary`) + jogos instalados localmente neste computador (`state.games`).
   - Estado vazio moderno com chamada para ação ("Explorar Catálogo").
   - Novo filtro: **Todos**, **Instalados**, **Não instalados**.

3. **Página de Detalhes do Jogo:**
   - Botão interativo para **Adicionar** ou **Remover da biblioteca** da conta.
   - Remoção da biblioteca não deleta a instalação física do disco (ações desacopladas e seguras).

---

## 6. TESTES AUTOMATIZADOS EXECUTADOS

### Launcher (`D:\Renpyzinho\launcher`):
```bash
npm test
✔ 17/17 testes aprovados (0 falhas)
  - Autenticação e tokens Bearer
  - Validação de manifests e hashes SHA-256
  - Instalação e desinstalação segura preservando saves
  - Conversão de links de download (Pixeldrain/Google Drive)
  - Parser de roteiros Ren'Py

npm run check
✔ 29 arquivos JavaScript validados com sucesso
```

### Site RenPlay (`D:\Renpyzinho\Renplay`):
```bash
npm test
✔ 62/62 testes aprovados (0 falhas)
  - Client IP & Header Security (10 testes)
  - Login Audit, Argon2id & Sessões (20 testes)
  - Recuperação de senha & Resend (10 testes)
  - Registro de usuários & Rate limiting (5 testes)
  - Controle de Acesso Baseado em Cargos - RBAC (7 testes)
  - Sincronização de Biblioteca Neon: Adição, Remoção, Idempotência, Isolamento e Manifests (7 testes)

npm run check
✔ tsc --noEmit: 0 erros de tipagem TypeScript
```

---

## 7. RECOMENDAÇÕES PARA PRODUÇÃO

1. **Protocol Handler Windows:**
   - O launcher já registra o protocolo `renplay://`. Para ambientes web, manter o link `renplay://launch/:gameId` como atalho amigável.
2. **CDN de Builds:**
   - Ao publicar novos jogos de grande porte (>1GB), priorizar links diretos com suporte a cabeçalho `Range: bytes=` (como Cloudflare R2 ou Pixeldrain) para download retomável pelo launcher.
