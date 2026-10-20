<div align="center">

  <img src="public/Logo.png" alt="RenPlay Logo" width="380" />

  <br />

  <p align="center">
    <strong>A Plataforma Definitiva de Distribuição, Publicação e Experiência para Visual Novels</strong>
  </p>

  <p align="center">
    <a href="https://nextjs.org"><img src="https://img.shields.io/badge/Next.js-16.4.2-black?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js" /></a>
    <a href="https://react.dev"><img src="https://img.shields.io/badge/React-19.3.0-blue?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React 19" /></a>
    <a href="https://tailwindcss.com"><img src="https://img.shields.io/badge/Tailwind_CSS-v4.0-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" /></a>
    <a href="https://www.typescriptlang.org"><img src="https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" /></a>
    <a href="https://neon.tech"><img src="https://img.shields.io/badge/Database-PostgreSQL_/_Neon-00E599?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" /></a>
  </p>

  <p align="center">
    <img src="https://img.shields.io/badge/Status-Em_Desenvolvimento_Ativo-FFDE00?style=flat-square&labelColor=090A0F&color=FFDE00" alt="Status" />
    <img src="https://img.shields.io/badge/Design-Cyberpunk_Gold_Aesthetics-FFDE00?style=flat-square&labelColor=090A0F" alt="Design" />
    <img src="https://img.shields.io/badge/Plataformas-Windows_%7C_Android_%7C_Linux_%7C_Web-white?style=flat-square&labelColor=090A0F" alt="Plataformas" />
  </p>

</div>

---

## 🌟 Visão Geral

O **RenPlay** é um ecossistema moderno voltado à comunidade de **Visual Novels** no Brasil e no mundo. Projetado com estética de estúdio AAA, combina uma vitrine digital de alta performance, área de autenticação cinematográfica com mascote animada, estúdio de publicação com live preview em tempo real e APIs prontas para integração direta com launchers desktop.

<br />

<div align="center">
  <img src="public/Rina_open.png" alt="Rina - Mascote Oficial RenPlay" width="460" style="border-radius: 20px; box-shadow: 0 20px 50px rgba(0,0,0,0.5);" />
  <p><em>Rina — Mascote Oficial e Guia do Ecossistema RenPlay</em></p>
</div>

---

## ✨ Principais Funcionalidades

### 🎮 Vitrine & Loja de Jogos
- **Catálogo Dinâmico:** Apresentação de jogos com banners panorâmicos, sinopse, tags de busca rápida e filtros por gênero.
- **Página de Detalhes:** Galeria de capturas de tela interativa, badges de plataformas suportadas (Windows, Android, Linux, macOS, Web) e especificações técnicas de download.
- **Destaque aos Tradutores:** Reconhecimento transparente das equipes e grupos de tradução parceiros (fansubs, scans e localizadores).

### ⚡ Autenticação Cinematográfica com Rina
- **Piscada de Olhos Orgânica:** Sistema de animação ocular em tempo real diretamente no DOM (`/Rina_open.png` e `/Rina_closed.png`), sem travamento de re-render ou interrupção de flutuação.
- **Efeitos de Estúdio:** Grids holográficos cibernéticos com máscara radial, anéis orbitais giratórios, brasas flutuantes douradas (`✦`) e auras de iluminação suave.
- **Alternador de Tema:** Suporte completo com um clique a **Modo Escuro** (Preto & Amarelo Ouro `#FFDE00`) e **Modo Claro** com persistência em `localStorage`.

### 📝 Estúdio de Publicação (Wizard em 5 Etapas)
- **Preenchimento Estruturado por Seções:**
  1. **Informações:** Título, descrições curta e longa, desenvolvedora, publisher, gênero, categoria, tags, datas e plataformas.
  2. **Idiomas & Tradução:** Idiomas disponíveis e créditos da equipe de tradução responsável.
  3. **Imagens & Mídias:** Ícone (1:1), poster vertical (3:4), banner panorâmico (16:9) e galeria de screenshots com visualizador em miniatura.
  4. **Arquivos & Download:** Upload com detecção automática de tamanho, versão do arquivo e compatibilidade.
  5. **Administração:** Desenvolvedor responsável, tradutor responsável, status (*Rascunho*, *Revisão*, *Publicado*, *Oculto*), permissões de equipe, changelog e agendamento.
- **Live Preview Duplo em Tempo Real:** Visualização instantânea lado a lado alternando entre o modo **Página da Loja** e o modo **Card da Vitrine / Launcher**.
- **Ícones Vetoriais SVG:** Interface limpa sem emojis padrão do sistema, utilizando símbolos vetoriais consistentes para sistemas operacionais e ações.

### 🔌 APIs Integradas (App Router)
- `GET /api/games` — Consulta completa de jogos com metadados e filtros.
- `GET /api/launcher` — Endpoint de comunicação de versões, status e downloads para clientes desktop.
- `GET /api/health` — Verificação de saúde da aplicação e integridade dos serviços.

---

## 🛠️ Stack Tecnológica

| Camada | Tecnologia | Descrição |
| :--- | :--- | :--- |
| **Framework** | [Next.js 16 (App Router)](https://nextjs.org) | Arquitetura moderna com Turbopack, Server Actions e Partial Prerendering. |
| **UI Library** | [React 19](https://react.dev) | Renderização reativa de última geração com transições suaves. |
| **Estilização** | [Tailwind CSS v4](https://tailwindcss.com) | Sistema de design utility-first com tema personalizado `#FFDE00`. |
| **Linguagem** | [TypeScript 5](https://www.typescriptlang.org) | Tipagem estática rigorosa para máxima confiabilidade do código. |
| **Banco de Dados** | [PostgreSQL](https://www.postgresql.org) / [Neon](https://neon.tech) | Banco de dados serverless relacional via driver nativo `pg`. |

---

## 📂 Estrutura do Projeto

```text
Renplay/
├── public/                     # Imagens estáticas, logos e mascotes (Rina)
│   ├── Logo.png               # Logo oficial da marca RenPlay
│   ├── Logoaccount.png        # Logo versão conta/painel
│   ├── Rina_open.png          # Mascote com olhos abertos
│   ├── Rina_closed.png        # Mascote com olhos fechados (animação)
│   └── images/                # Banners e capas de jogos em demonstração
├── src/
│   └── app/
│       ├── api/               # Rotas de API HTTP do Next.js
│       │   ├── games/         # Endpoints de listagem e dados de jogos
│       │   ├── launcher/      # Integração com aplicativo desktop
│       │   └── health/        # Healthcheck do sistema
│       ├── dashboard/         # Painel administrativo do estúdio
│       │   ├── page.tsx       # Visão geral, estatísticas e listagem
│       │   └── publish/       # Assistente de publicação multietapas
│       ├── login/             # Tela de login interativa com Rina
│       ├── portal/            # Biblioteca e exploração
│       ├── dev/               # Área restrita para desenvolvedores
│       ├── layout.tsx         # Layout raiz com fontes e metadados
│       ├── globals.css        # Variáveis de cores, orbs e keyframes
│       └── page.tsx           # Página inicial / Vitrine principal
├── package.json               # Dependências e scripts de execução
├── tsconfig.json              # Configurações do compilador TypeScript
└── next.config.ts             # Configurações do Next.js Turbopack
```

---

## 🚀 Como Iniciar Localmente

### Pré-requisitos
- [Node.js](https://nodejs.org) (v18.18+ ou superior recomendado)
- Gerenciador de pacotes `npm`, `pnpm` ou `yarn`

### 1. Clonar ou Acessar a Pasta
```bash
cd d:/Renpyzinho/Renplay
```

### 2. Instalar Dependências
```bash
npm install
```

### 3. Configurar Variáveis de Ambiente
Crie um arquivo `.env` na raiz do projeto com a string de conexão do PostgreSQL (opcional para navegação estática):
```env
DATABASE_URL="postgresql://usuario:senha@seu-host-neon.tech/renplay?sslmode=require"
```

### 4. Executar o Servidor de Desenvolvimento
```bash
npm run dev
```

Acesse em seu navegador: **[http://localhost:3000](http://localhost:3000)**

---

## 📜 Scripts Disponíveis

| Comando | Descrição |
| :--- | :--- |
| `npm run dev` | Inicia o servidor de desenvolvimento com hot-reload rápido via Turbopack |
| `npm run build` | Compila o projeto e valida tipagens e rotas estáticas/dinâmicas para produção |
| `npm run start` | Executa o build de produção previamente gerado |
| `npm run lint` | Executa o analisador estático ESLint para garantir os padrões de código |

---

## 🎨 Paleta de Cores e Identidade Visual

| Token | Hex | Aplicação |
| :--- | :--- | :--- |
| **RenPlay Yellow** | `#FFDE00` | Botões principais, anéis de foco, realces e brasas |
| **Amber Accent** | `#F59E0B` | Gradientes secundários e auras luminosas |
| **Dark Base** | `#090A0F` | Fundo principal da aplicação (Dark Mode) |
| **Card Surface** | `#12141D` | Cartões e formulários com alto contraste e glassmorphism |
| **Border Dark** | `#262B3D` | Bordas refinadas para delimitação de componentes |

---

## 🤝 Contribuição e Parcerias

Contribuições para o ecossistema RenPlay são sempre bem-vindas!
1. Faça um Fork do projeto
2. Crie uma branch para sua funcionalidade (`git checkout -b feature/nova-funcionalidade`)
3. Faça commit das alterações (`git commit -m 'feat: adiciona nova funcionalidade'`)
4. Envie para o repositório remoto (`git push origin feature/nova-funcionalidade`)
5. Abra um **Pull Request**

---

<div align="center">
  <p>Desenvolvido com 💛 pela comunidade e equipe <strong>RenPlay</strong>.</p>
  <p><em>Inspirado na magia de contar histórias através de Visual Novels.</em></p>
</div>
