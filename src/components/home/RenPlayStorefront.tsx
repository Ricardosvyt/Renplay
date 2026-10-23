"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Game, LauncherInfo } from "@/types/game";
import storefrontData from "@/lib/storefront-data";
import styles from "./RenPlayStorefront.module.css";

const { getPopularGames, getRecentGames, formatCompactCount, storefrontCategories } = storefrontData;
const artSheet = "/assets/renplay/games/novel-art-sprite.png";
const banner = "/assets/renplay/banners/banner-sonhos-de-outono.png";
const discordInvite = process.env.NEXT_PUBLIC_DISCORD_INVITE_URL || "https://discord.com/app";

type Props = {
  games: Game[];
  loadingGames: boolean;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedGenre: string;
  onSelectGenre: (value: string) => void;
  libraryIds: string[];
  launcherInfo: LauncherInfo;
  onOpenGame: (game: Game) => void;
  onDownload: () => void;
};

function Icon({ name, className = "" }: { name: string; className?: string }) {
  const paths: Record<string, React.ReactNode> = {
    home: <><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z" /></>,
    games: <><path d="m12 3 9 5-9 5-9-5z" /><path d="m3 12 9 5 9-5M3 16l9 5 9-5" /></>,
    library: <><rect x="4" y="3" width="16" height="18" rx="2" /><path d="M8 3v18M12 8h5M12 12h5" /></>,
    download: <><path d="M12 3v12m-5-5 5 5 5-5" /><path d="M4 17v3h16v-3" /></>,
    cloud: <><path d="M7 18h10a4 4 0 0 0 .4-8A6 6 0 0 0 6 9a4.5 4.5 0 0 0 1 9Z" /></>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M10 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM20 8v6m3-3h-6" /></>,
    search: <><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 5 5" /></>,
    bell: <><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4" /></>,
    star: <><path d="m12 2 3 6.2 6.8 1-4.9 4.8 1.2 6.8L12 17.6l-6.1 3.2 1.2-6.8L2.2 9.2l6.8-1z" /></>,
    news: <><path d="M3 11h4l10-5v12L7 13H3zM7 13l2 7h4l-3-8M20 9l2-2m-2 8 2 2" /></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18M8 14h2m4 0h2m-8 3h2" /></>,
    arrow: <><path d="M5 12h14m-6-6 6 6-6 6" /></>,
    rocket: <><path d="M4.5 16.5c-1.5 1.2-2 4.5-2 4.5s3.3-.5 4.5-2c.8-.9.8-2.2-.1-3.1-.9-.9-2.2-.9-3.1.6ZM12 15l-3-3a22 22 0 0 1 2-5c2-3 6-4 9-4 0 3-1 7-4 9a22 22 0 0 1-4 3Z" /><path d="M9 12H4l-2 3h5m7 0v5l3 2 2-7M16 8h.01" /></>,
    chevron: <><path d="m9 18 6-6-6-6" /></>,
    discord: <><path d="M7 7c3-2 7-2 10 0l2 10c-2 2-4 3-7 3s-5-1-7-3L7 7Z" /><path d="M8 8 5 6l-2 12m13-10 3-2 2 12M9 13h.01M15 13h.01M9 17c2 1 4 1 6 0" /></>
  };
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

function SpriteArt({ index, label, cover }: { index: number; label: string; cover?: string }) {
  const x = `${(index % 4) * (100 / 3)}%`;
  const y = index < 4 ? "0%" : "100%";
  return <div className={styles.art} style={{ backgroundImage: `url(${artSheet})`, backgroundPosition: `${x} ${y}` }}>
    {cover && <Image src={cover} alt={label} fill sizes="(max-width: 720px) 45vw, 260px" unoptimized />}
    <span className={styles.artShade} />
  </div>;
}

export function RenPlayStorefront(props: Props) {
  const { games, loadingGames, searchQuery, onSearchChange, selectedGenre, onSelectGenre, libraryIds, launcherInfo, onOpenGame, onDownload } = props;
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [showAllNews, setShowAllNews] = useState(false);
  const popularRef = useRef<HTMLDivElement>(null);
  const newRef = useRef<HTMLDivElement>(null);
  const popularGames = useMemo(() => getPopularGames(games, 5), [games]);
  const recentGames = useMemo(() => getRecentGames(games, 4), [games]);
  const libraryGames = libraryIds.map(id => games.find(game => game.id === id)).filter((game): game is Game => Boolean(game)).slice(0, 2);

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  const scrollRail = (ref: React.RefObject<HTMLDivElement | null>, direction: number) => ref.current?.scrollBy({ left: direction * 320, behavior: "smooth" });
  const openDiscord = () => window.open(discordInvite, "_blank", "noopener,noreferrer");
  const selectGenre = (genre: string) => {
    onSelectGenre(genre);
    onSearchChange("");
    scrollTo("catalog");
  };

  const nav = [
    { name: "Início", icon: "home", href: "#top" },
    { name: "Meus Jogos", icon: "games", href: "#catalog" },
    { name: "Biblioteca", icon: "library", href: "/account" },
    { name: "Downloads", icon: "download", href: "#launcher" },
    { name: "Saves na Nuvem", icon: "cloud", href: "/account" },
    { name: "Comunidade", icon: "users", href: "#discord" }
  ];

  return <div id="top" className={styles.shell}>
    <aside className={styles.sidebar}>
      <Link href="/" className={styles.brand} aria-label="RenPlay início"><Image src="/Logo.png" alt="RenPlay" width={160} height={44} priority /></Link>
      <nav className={styles.nav} aria-label="Navegação principal">
        {nav.map((item, index) => <a key={item.name} href={item.href} className={`${styles.navItem} ${index === 0 ? styles.active : ""}`}>
          <Icon name={item.icon} /> <span>{item.name}</span>
        </a>)}
      </nav>
      <section className={styles.installed} aria-label="Jogos na sua biblioteca">
        <div className={styles.installedTitle}><span>NA SUA BIBLIOTECA</span><b>{libraryIds.length}</b></div>
        {libraryGames.length ? libraryGames.map((game, index) => <button className={styles.installedGame} key={game.id} onClick={() => onOpenGame(game)}>
          <span className={styles.installedThumb}><SpriteArt index={index} label="" cover={game.coverImage} /></span>
          <span><strong>{game.name}</strong><small><i />Na biblioteca</small></span>
        </button>) : <p className={styles.installedEmpty}>Adicione histórias à sua biblioteca para vê-las aqui.</p>}
      </section>
      <div className={styles.sideBottom}>
        <Link href="/login" className={styles.profile}><span className={styles.profileAvatar}>R</span><span><b>Entre na RenPlay</b><small>Sincronize seus jogos</small></span><Icon name="chevron" /></Link>
      </div>
    </aside>

    <div className={styles.main}>
      <header className={styles.topbar}>
        <label className={styles.search}><Icon name="search" /><input type="search" value={searchQuery} onChange={event => onSearchChange(event.target.value)} placeholder="Buscar por título, gênero ou desenvolvedor..." aria-label="Buscar jogos" /></label>
        <div className={styles.topActions}>
          <div className={styles.noticeWrap}>
            <button className={styles.iconButton} aria-label="Notificações" aria-expanded={notificationsOpen} onClick={() => setNotificationsOpen(value => !value)}><Icon name="bell" /><i /></button>
            {notificationsOpen && <div className={styles.noticePopover}><b>Novidades RenPlay</b><p>A Summer Story chegou ao catálogo.</p><button onClick={() => { setNotificationsOpen(false); scrollTo("news"); }}>Ver novidades</button></div>}
          </div>
          <Link href="/login" className={styles.loginLink}>Entrar</Link>
          <button className={styles.downloadTop} onClick={onDownload}>Baixar launcher</button>
        </div>
      </header>

      <div className={styles.pageGrid}>
        <main className={styles.feed}>
          <section className={styles.section} aria-labelledby="popular-title">
            <div className={styles.sectionHead}>
              <div className={styles.headingGroup}><Icon name="star" className={styles.headingIcon} /><div><h1 id="popular-title">Mais populares na RenPlay</h1><p>Os jogos mais baixados e recomendados pela comunidade.</p></div></div>
              <button className={styles.textLink} onClick={() => { onSelectGenre("all"); scrollTo("catalog"); }}>Ver todos <Icon name="arrow" /></button>
            </div>
            <div className={styles.popularRail} ref={popularRef}>
              {loadingGames ? <p className={styles.empty}>Carregando o catálogo…</p> : popularGames.length ? popularGames.map((game, index) => <button className={styles.popularCard} key={game.id} onClick={() => onOpenGame(game)}>
                <SpriteArt index={index} label={game.name} cover={game.coverImage || game.screenshots?.[0]} />
                <span className={styles.popularBadge}>{index === 0 ? "Mais baixado" : index === 1 ? "Em alta" : index === 2 && game.publishedAt ? "Novo" : game.genre || "Visual Novel"}</span>
                <span className={styles.gameOverlay}>
                  <strong>{game.name}</strong><small>{game.genre || game.category || "Visual Novel"}</small>
                  <span className={styles.gameStats}>
                    {typeof game.rating === "number" && <span><Icon name="star" />{game.rating.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}{game.reviewCount ? ` (${formatCompactCount(game.reviewCount)})` : ""}</span>}
                    {typeof game.downloads === "number" && <span><Icon name="download" />{formatCompactCount(game.downloads)}</span>}
                  </span>
                </span>
              </button>) : <p className={styles.empty}>Os jogos aparecerão aqui assim que forem publicados.</p>}
            </div>
            <div className={styles.railControls}><button aria-label="Jogos anteriores" onClick={() => scrollRail(popularRef, -1)}>‹</button><button aria-label="Próximos jogos" onClick={() => scrollRail(popularRef, 1)}>›</button></div>
          </section>

          <section className={styles.campaign} style={{ backgroundImage: `linear-gradient(90deg,rgba(9,8,12,.91),rgba(9,8,12,.58) 43%,rgba(9,8,12,.05)),url(${banner})` }} aria-labelledby="campaign-title">
            <div className={styles.campaignCopy}><span className={styles.campaignTag}>EVENTO ESPECIAL</span><h2 id="campaign-title">Sonhos de Outono</h2><p>Novas histórias, personagens exclusivos e recompensas por tempo limitado.</p><button onClick={() => { onSelectGenre("Drama"); scrollTo("catalog"); }}>Ver campanha <Icon name="arrow" /></button></div>
            <p className={styles.campaignSide}>Histórias<br />que ficam<br />com você.</p>
            <div className={styles.campaignDots} aria-label="Evento especial em destaque"><i className={styles.selectedDot} /></div>
          </section>

          <section id="catalog" className={styles.section} aria-labelledby="recent-title">
            <div className={styles.sectionHead}>
              <div className={styles.headingGroup}><Icon name="rocket" className={styles.headingIcon} /><div><h2 id="recent-title">Lançamentos recentes</h2><p>Confira os novos jogos adicionados ao catálogo.</p></div></div>
              <button className={styles.textLink} onClick={() => { onSelectGenre("all"); onSearchChange(""); }}>Ver todos <Icon name="arrow" /></button>
            </div>
            <div className={styles.recentRail} ref={newRef}>
              {recentGames.length ? recentGames.map((game, index) => <button className={styles.recentCard} key={game.id} onClick={() => onOpenGame(game)}>
                <SpriteArt index={(index + 4) % 8} label={game.name} cover={game.coverImage || game.screenshots?.[0]} />
                <span className={styles.newBadge}>Novo</span><span className={styles.recentOverlay}><strong>{game.name}</strong><small>{game.genre || game.category || "Visual Novel"}</small><span className={styles.gameStats}>{typeof game.rating === "number" && <span><Icon name="star" />{game.rating.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}</span>}{typeof game.downloads === "number" && <span><Icon name="download" />{formatCompactCount(game.downloads)}</span>}</span></span>
              </button>) : <p className={styles.empty}>{loadingGames ? "Carregando lançamentos…" : "Ainda não há lançamentos no catálogo."}</p>}
            </div>
            <div className={styles.railControls}><button aria-label="Lançamentos anteriores" onClick={() => scrollRail(newRef, -1)}>‹</button><button aria-label="Próximos lançamentos" onClick={() => scrollRail(newRef, 1)}>›</button></div>
          </section>

          <section className={styles.categorySection} aria-labelledby="category-title">
            <div className={styles.sectionHead}><div className={styles.headingGroup}><div><h2 id="category-title">Explore por gênero</h2><p>Escolha a atmosfera da sua próxima história.</p></div></div></div>
            <div className={styles.categoryGrid}>{storefrontCategories.map(category => <button key={category.name} className={`${styles.category} ${selectedGenre.toLowerCase() === category.name.toLowerCase() ? styles.categoryActive : ""}`} onClick={() => selectGenre(category.name)}>
              <span className={styles.categoryArt} style={{ backgroundImage: `linear-gradient(90deg,${category.name === "Fantasia" ? "#351268" : category.name === "Romance" ? "#5e1742" : category.name === "Mistério" ? "#082342" : "#251a21"}dd,transparent),url(${artSheet})`, backgroundSize: "100% 100%,400% 200%", backgroundPosition: `center,${(category.imageIndex % 4) * (100 / 3)}% ${category.imageIndex < 4 ? "0%" : "100%"}` }} />
              <Icon name={category.name === "Drama" ? "users" : category.name === "Romance" ? "star" : category.name === "Fantasia" ? "games" : category.name === "Mistério" ? "search" : category.name === "Slice of Life" ? "home" : category.name === "Comédia" ? "bell" : category.name === "Suspense" ? "cloud" : "arrow"} />
              <span><strong>{category.name}</strong><small>{category.count}+ jogos</small></span>
            </button>)}</div>
          </section>
        </main>

        <aside className={styles.rightRail}>
          <section id="news" className={styles.railPanel} aria-labelledby="news-title">
            <h2 id="news-title"><Icon name="news" />Novidades</h2>
            <div className={styles.newsList}>
              <article className={styles.newsItem}><span className={`${styles.newsIcon} ${styles.sunIcon}`}><Icon name="games" /></span><p><strong>Novo jogo no catálogo!</strong><span>A Summer Story já está disponível.</span><small>Há 2 horas</small></p></article>
              <article className={styles.newsItem}><span className={`${styles.newsIcon} ${styles.brandIcon}`}>R</span><p><strong>Atualização do Launcher</strong><span>Versão {launcherInfo.version} com melhorias e correções.</span><small>Há 1 dia</small></p></article>
              <article className={styles.newsItem}><span className={`${styles.newsIcon} ${styles.cloudIcon}`}><Icon name="cloud" /></span><p><strong>Novo sistema de saves</strong><span>Agora seus saves ficam na nuvem!</span><small>Há 2 dias</small></p></article>
              {showAllNews && <article className={styles.newsItem}><span className={`${styles.newsIcon} ${styles.eventIcon}`}><Icon name="calendar" /></span><p><strong>Encontro da comunidade</strong><span>Vote no próximo jogo do catálogo.</span><small>Em breve</small></p></article>}
            </div>
            <button className={styles.panelLink} onClick={() => setShowAllNews(value => !value)}>{showAllNews ? "Mostrar menos" : "Ver todas as novidades"}<Icon name="arrow" /></button>
          </section>

          <section className={styles.railPanel} aria-labelledby="events-title">
            <h2 id="events-title"><Icon name="calendar" />Próximos eventos</h2>
            <button className={styles.eventCard} onClick={() => scrollTo("campaign-title")} style={{ backgroundImage: `linear-gradient(0deg,rgba(7,8,12,.96),rgba(7,8,12,.04) 78%),url(${banner})` }}>
              <span className={styles.eventDate}>NOV<b>02</b></span><strong>Evento da Comunidade</strong><small>Vote no próximo jogo do catálogo!</small>
            </button>
            <button className={styles.panelLink} onClick={() => scrollTo("campaign-title")}>Ver calendário completo<Icon name="arrow" /></button>
          </section>

          <section id="discord" className={styles.discordPanel}>
            <div className={styles.discordHead}><span><Icon name="discord" /></span><h2>Discord</h2></div>
            <p>Participe da nossa comunidade, receba novidades, eventos e converse com outros jogadores.</p>
            <button onClick={openDiscord}><Icon name="discord" />Entrar no Discord</button>
          </section>

          <section id="launcher" className={styles.launcherCard}><div><span>RENPLAY DESKTOP</span><h2>Sua biblioteca,<br />sempre com você.</h2><p>Instale, organize e continue suas histórias.</p></div><button onClick={onDownload}>{launcherInfo.downloadUrl ? "Baixar launcher" : "Conhecer o launcher"}<Icon name="arrow" /></button></section>
        </aside>
      </div>
      <footer className={styles.footer}><span>© 2026 RenPlay</span><Link href="/login">Sua conta</Link><Link href="/dashboard">Criadores</Link></footer>
    </div>
  </div>;
}
