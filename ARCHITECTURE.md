# GUIA DE ARQUITETURA MODULAR — RENPLAY & LAUNCHER

Este documento descreve a organização modular do ecossistema RenPlay, estabelecida para garantir modularidade, manutenibilidade, escalabilidade e velocidade de desenvolvimento.

---

## 1. Visão Geral do Ecossistema

O RenPlay é composto por dois sistemas integrados:
1. **RenPlay Web (`Renplay/`)**: Plataforma Web Next.js (App Router, Tailwind CSS, TypeScript, Neon PostgreSQL).
2. **RenPlay Launcher Desktop (`launcher/`)**: Aplicação Desktop desenvolvida em Electron para gerenciamento, download, atualização e execução de Visual Novels Ren'Py.

Ambos comunicam-se através de contratos de API REST (`/api/v1/...` e rotas Web) e autenticação segura com Argon2id, tokens e sessão.

---

## 2. Estrutura Modular: RenPlay Web (`Renplay/`)

### 2.1. Publicação de Jogos (`/dashboard/jogos/publish`)
- **Página orquestradora:** [`Renplay/src/app/dashboard/jogos/publish/page.tsx`](file:///d:/Renpyzinho/Renplay/src/app/dashboard/jogos/publish/page.tsx)
- **Componentes isolados:**
  - `StepNav.tsx`: Navegação entre os 6 passos com barra de progresso.
  - `Step1Identity.tsx`: Título, desenvolvedora, publicadora, gênero, categoria, classificação.
  - `Step2Information.tsx`: Sinopse, descrição completa, status e links oficiais.
  - `Step3LanguagesTags.tsx`: Tags, idiomas disponíveis, opções de acessibilidade.
  - `Step4Gallery.tsx`: Capa vertical, banner hero 16:9, logotipo e capturas de tela.
  - `Step5Files.tsx`: Executável principal, mirrors de download e tamanho da build.
  - `Step6Launch.tsx`: Revisão final de dados, checklist de validação e publicação no catálogo.
  - `PublishLivePreview.tsx`: Preview em tempo real do card e banner do jogo.
  - `FormControls.tsx`: Botões de avanço, retrocesso e salvamento de rascunho.
  - `types.ts`: Tipos centralizados do formulário de publicação.

### 2.2. Página Inicial (`/`)
- **Página orquestradora:** [`Renplay/src/app/page.tsx`](file:///d:/Renpyzinho/Renplay/src/app/page.tsx)
- **Componentes isolados:**
  - `components/layout/Header.tsx`: Barra superior com logo, navegação e botões de conta.
  - `components/layout/Footer.tsx`: Rodapé com links institucionais e direitos autorais.
  - `components/home/HomeHero.tsx`: Hero section com banner de destaque e CTA do launcher.
  - `components/home/HomeFeatures.tsx`: Destaques da plataforma (saves na nuvem, launcher rápido).
  - `components/home/HomeCatalogSection.tsx`: Catálogo com filtros de busca e categorias.
  - `components/home/HomeFaq.tsx`: Perguntas frequentes interativas.
  - `components/home/HomeDownloadCta.tsx`: Seção de download do instalador Windows.
  - `components/catalog/GameCard.tsx`: Card de jogo reutilizável com badges e capa.
  - `components/catalog/GameDetailsModal.tsx`: Modal detalhado de visualização de jogo.

### 2.3. Painel Administrativo (`/dashboard`)
- **Página orquestradora:** [`Renplay/src/app/dashboard/page.tsx`](file:///d:/Renpyzinho/Renplay/src/app/dashboard/page.tsx)
- **Componentes isolados:**
  - `components/dashboard/DashboardSidebar.tsx`: Navegação lateral com contadores dinâmicos.
  - `components/dashboard/DashboardOverviewTab.tsx`: Métricas de catálogo, downloads e usuários.
  - `components/dashboard/DashboardGamesTab.tsx`: Tabela de jogos com filtros, publicação e exclusão.
  - `components/dashboard/DashboardUsersTab.tsx`: Tabela de membros com badges de função e verificação.
  - `components/dashboard/DashboardSettingsTab.tsx`: Configurações globais e versão OTA.
  - `components/dashboard/types.ts`: Tipagem de jogos e membros.

### 2.4. Autenticação (`/login`)
- **Página orquestradora:** [`Renplay/src/app/login/page.tsx`](file:///d:/Renpyzinho/Renplay/src/app/login/page.tsx)
- **Componentes isolados:**
  - `components/auth/AuthHeader.tsx`: Cabeçalho com logo, retorno e seletor de tema escuro/claro.
  - `components/auth/AuthCharacterSide.tsx`: Painel lateral com Rina animada (piscada natural), aura dourada e chips.
  - `components/auth/LoginFormCard.tsx`: Card flutuante com inputs, controle de visibilidade de senha e feedback.

---

## 3. Estrutura Modular: Launcher Desktop (`launcher/`)

### 3.1. Scripts de Renderização (`launcher/src/`)
- **Orquestrador:** [`launcher/src/renderer.js`](file:///d:/Renpyzinho/launcher/src/renderer.js)
  - Gerencia o estado reativo (`state`), roteamento de visualizações (`currentView`), listeners de IPC e sincronização.
- **Componentes modulares (`src/renderer/components/`):**
  - `game-card.js`: **Card de jogos no launcher**, tags, thumbnail, badges de status e seções de catálogo (destaques, novidades e coleções).
  - `hero-carousel.js`: Carrossel de destaques da tela inicial, transições suaves, temporizador e botões de navegação.
  - `library-view.js`: Seção de biblioteca do usuário, filtros (todos, instalados, não instalados) e algoritmo de recomendações.
  - `game-details.js`: Página de detalhes do jogo, card hero 100% integrado, abas de galeria, comentários e botão de instalação/download.
  - `lightbox.js`: Visualizador fullscreen de capturas de tela e ilustrações.
  - `auth-controller.js`: Validações em tempo real de username, e-mail, senha, força de senha e fluxo de recuperação.

### 3.2. Folhas de Estilo (`launcher/src/style.css`)
O arquivo [`launcher/src/style.css`](file:///d:/Renpyzinho/launcher/src/style.css) importa módulos organizados por responsabilidade visual:
- `renderer/styles/base.css`: Variáveis CSS, reset, tipografia e estrutura principal.
- `renderer/styles/sidebar.css`: Barra lateral, iluminação ambiente e menu de navegação.
- `renderer/styles/hero-carousel.css`: Estilização do carrossel hero e slides.
- `renderer/styles/catalog.css`: Grids de catálogo, cards de jogos (`.game-card-new`, `.mini-card`) e pílulas de gênero.
- `renderer/styles/library.css`: Grid de biblioteca, estado vazio e botões de filtro.
- `renderer/styles/game-details.css`: Layout da página de detalhes, hero card e seções de comentários.
- `renderer/styles/lightbox.css`: Modal de visualização de imagem em tela cheia e responsividade.

---

## 4. Instruções para Modificações Futuras

Quando for solicitado:
- **"Altere somente o card dos jogos no launcher"**:
  - Modifique a estrutura/lógica em: [`launcher/src/renderer/components/game-card.js`](file:///d:/Renpyzinho/launcher/src/renderer/components/game-card.js)
  - Modifique os estilos em: [`launcher/src/renderer/styles/catalog.css`](file:///d:/Renpyzinho/launcher/src/renderer/styles/catalog.css)
- **"Altere o carrossel no launcher"**:
  - Modifique a lógica em: [`launcher/src/renderer/components/hero-carousel.js`](file:///d:/Renpyzinho/launcher/src/renderer/components/hero-carousel.js)
  - Modifique os estilos em: [`launcher/src/renderer/styles/hero-carousel.css`](file:///d:/Renpyzinho/launcher/src/renderer/styles/hero-carousel.css)
- **"Altere um passo do assistente de publicação no site"**:
  - Modifique apenas o componente correspondente em: `Renplay/src/components/publish/Step*.tsx`
- **"Altere a tabela ou filtros de jogos no painel administrativo"**:
  - Modifique: [`Renplay/src/components/dashboard/DashboardGamesTab.tsx`](file:///d:/Renpyzinho/Renplay/src/components/dashboard/DashboardGamesTab.tsx)
- **"Altere a tela de login"**:
  - Modifique: [`Renplay/src/components/auth/LoginFormCard.tsx`](file:///d:/Renpyzinho/Renplay/src/components/auth/LoginFormCard.tsx) ou [`AuthCharacterSide.tsx`](file:///d:/Renpyzinho/Renplay/src/components/auth/AuthCharacterSide.tsx)

---

## 5. Procedimentos de Validação e Testes

Antes de finalizar qualquer alteração:
1. **No site (`Renplay/`)**:
   - Executar `npm run check` (validação de tipos TypeScript, 0 erros).
   - Executar `npm run test` (todos os 62 testes de segurança, biblioteca e autenticação devem passar).
2. **No launcher (`launcher/`)**:
   - Executar `npm run check` (validação sintática de todos os arquivos JS).
   - Executar `npm run test` (todos os 17 testes de catálogo, runtime, download e extração devem passar).
