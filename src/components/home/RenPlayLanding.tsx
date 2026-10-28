"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { LauncherInfo } from "@/types/game";

import styles from "./RenPlayLanding.module.css";
import { SiteAdBanner } from "./SiteAdBanner";

type Platform = "windows" | "linux" | "macos" | "android";
type Props = { launcherInfo: LauncherInfo };
const platforms: { id: Platform; name: string; format: string }[] = [
  { id: "windows", name: "Windows", format: "Seu launcher no PC" },
  { id: "linux", name: "Linux", format: "Mais liberdade para jogar" },
  { id: "macos", name: "macOS", format: "Suas histórias no Mac" },
  { id: "android", name: "Android", format: "Leve suas histórias com você" },
];

function Glyph({ name }: { name: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {name === "windows" ? (
        <path d="m3 5 8-1v7H3zm10-1 8-1v8h-8zM3 13h8v7l-8-1zm10 0h8v8l-8-1z" />
      ) : name === "android" ? (
        <>
          <rect x="6" y="2" width="12" height="20" rx="3" />
          <path d="M10 18h4" />
        </>
      ) : name === "macos" || name === "linux" ? (
        <>
          <rect x="3" y="3" width="18" height="13" rx="2" />
          <path d="M8 21h8m-4-5v5" />
          {name === "linux" && <path d="m7 7 3 3-3 3m6 0h4" />}
        </>
      ) : name === "download" ? (
        <path d="M12 3v12m-5-5 5 5 5-5M4 17v4h16v-4" />
      ) : name === "arrow" ? (
        <path d="M4 12h16m-6-6 6 6-6 6" />
      ) : name === "search" ? (
        <>
          <circle cx="10" cy="10" r="6" />
          <path d="m15 15 6 6" />
        </>
      ) : name === "cloud" ? (
        <>
          <path d="M6 18a5 5 0 0 1-1-10 7 7 0 0 1 13 1 4.5 4.5 0 0 1 0 9" />
          <path d="M12 13v8m-3-3 3 3 3-3" />
        </>
      ) : name === "library" ? (
        <>
          <rect x="3" y="4" width="6" height="16" rx="1" />
          <rect x="11" y="4" width="4" height="16" rx="1" />
          <path d="m18 5 3 14" />
        </>
      ) : name === "zap" ? (
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      ) : name === "gamepad" ? (
        <>
          <line x1="6" y1="12" x2="10" y2="12" />
          <line x1="8" y1="10" x2="8" y2="14" />
          <circle cx="15" cy="13" r="0.8" fill="currentColor" />
          <circle cx="18" cy="11" r="0.8" fill="currentColor" />
          <rect x="2" y="6" width="20" height="12" rx="4" />
        </>
      ) : name === "menu" ? (
        <>
          <line x1="4" y1="6" x2="20" y2="6" />
          <line x1="4" y1="12" x2="20" y2="12" />
          <line x1="4" y1="18" x2="20" y2="18" />
        </>
      ) : name === "close" ? (
        <>
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </>
      ) : (
        <path d="m12 3 3 6 6 3-6 3-3 6-3-6-6-3 6-3z" />
      )}
    </svg>
  );
}

function safeDownload(value?: string | null) {
  if (!value) return null;
  if (/^\/downloads\/[a-zA-Z0-9_./-]+$/.test(value) && !value.includes("..")) return value;
  try { const url = new URL(value); return url.protocol === "https:" && !url.username && !url.password ? url.href : null; } catch { return null; }
}

export function RenPlayLanding(props: Props) {
  const { launcherInfo } = props;
  const [menuOpen, setMenuOpen] = useState(false);

  const urlFor = (id: Platform) => safeDownload(launcherInfo.downloads?.[id]?.url ?? (id === "windows" ? launcherInfo.downloadUrl : null));
  const platformButton = (id: Platform, hero = false) => {
    const platform = platforms.find(item => item.id === id)!;
    const url = urlFor(id);
    return url ? <a className={hero ? styles.primary : styles.platformButton} href={url} rel="noopener noreferrer"><Glyph name="download"/>Baixar para {platform.name}<Glyph name="arrow"/></a>
      : hero ? <a className={styles.primary} href="#downloads"><Glyph name={id}/>Ver versão {platform.name}<Glyph name="arrow"/></a>
      : <button className={styles.platformButton} disabled>Em breve para {platform.name}</button>;
  };


  return <div className={styles.page}>
    <a className={styles.skip} href="#main">Pular para o conteúdo</a>
    <header className={styles.header}>
      <Link href="/" aria-label="RenPlay início" className={styles.logo}><Image src="/Logo.png" alt="RenPlay" width={160} height={44} priority/></Link>
      <button className={styles.menuToggle} aria-label={menuOpen ? "Fechar navegação" : "Abrir navegação"} aria-expanded={menuOpen} aria-controls="home-nav" onClick={() => setMenuOpen(!menuOpen)}>
        <Glyph name={menuOpen ? "close" : "menu"} />
        <span>{menuOpen ? "Fechar" : "Menu"}</span>
      </button>
      <nav id="home-nav" className={`${styles.nav} ${menuOpen ? styles.navOpen : ""}`} aria-label="Navegação principal" onClick={() => setMenuOpen(false)}>
        <a href="#experience">O launcher</a>
        <a href="#downloads">Downloads</a>
        <Link href="/dev">Dev</Link>
      </nav>
    </header>

    <main id="main">
      <section className={styles.hero} aria-labelledby="hero-title">
        <div className={styles.heroArt} aria-hidden="true"><div className={styles.halo}/><span className={styles.heroWord}>PLAY</span></div><div className={styles.rina}><Image src="/Rina.png" alt="Rina, personagem do RenPlay, com sua jaqueta preta e dourada" fill sizes="(max-width: 760px) 100vw, 55vw" priority/></div>
        <div className={styles.heroCopy}>
          <span className={styles.eyebrow}><i/>SEU UNIVERSO COMEÇA COM UM DOWNLOAD</span>
          <h1 id="hero-title">Suas histórias.<br/>Seu universo.<br/><em>Seu RenPlay.</em></h1>
          <p>Um launcher para descobrir, organizar e jogar. Leve o RenPlay para sua tela e deixe espaço para a próxima história.</p>
          <div className={styles.heroActions}><div className={styles.desktopCta}>{platformButton("windows", true)}</div><div className={styles.mobileCta}>{platformButton("android", true)}</div><a className={styles.secondary} href="#experience">Conheça o launcher <Glyph name="arrow"/></a></div>
          <p className={styles.heroNote}><span className={styles.desktopCta}>Windows · Linux · macOS</span><span className={styles.mobileCta}>RenPlay para Android</span><span>Uma conta. Muitas histórias.</span></p>
        </div>
        <div className={styles.rinaBadge}><i/><div><strong>Rina</strong><small>Seu próximo universo está esperando.</small></div><Glyph name="spark"/></div>
      </section>

      <div className={styles.promiseStrip}><span><Glyph name="library"/>Sua biblioteca organizada</span><span><Glyph name="spark"/>Histórias para descobrir</span><span><Glyph name="cloud"/>Seus saves, no seu controle</span></div>
      <SiteAdBanner />

      <section id="experience" className={styles.experience}>
        <div className={styles.sectionTitle}><span className={styles.eyebrow}>FEITO PARA QUEM VIVE HISTÓRIAS</span><h2>Menos procura.<br/><em>Mais um capítulo.</em></h2><p>O RenPlay aproxima você dos seus jogos, do primeiro download até a próxima escolha.</p></div>

        <div className={styles.launcherShowcase}>
          <div className={styles.launcherTitlebar}>
            <div className={styles.windowDots}><i/><i/><i/></div>
            <span className={styles.launcherTitleText}>RenPlay Launcher • Desktop Experience</span>
            <span className={styles.launcherTitleStatus}>v0.1.9 • Runtimes Integrados</span>
          </div>
          <div className={styles.launcherBody}>
            <aside className={styles.mockSidebar}>
              <div className={`${styles.mockNavItem} ${styles.mockNavItemActive}`}><Glyph name="library"/> Início</div>
              <div className={styles.mockNavItem}><Glyph name="spark"/> Meus Jogos</div>
              <div className={styles.mockNavItem}><Glyph name="cloud"/> Saves na Nuvem</div>
              <div className={styles.mockNavItem}><Glyph name="download"/> Downloads</div>
            </aside>
            <div className={styles.mockContent}>
              <div className={styles.mockGameBanner}>
                <span className={styles.mockGameBadge}>Launcher Oficial • Experiência Otimizada</span>
                <h3 className={styles.mockGameTitle}>Sua próxima história começa com um clique.</h3>
                <p className={styles.mockGameDesc}>Descubra visual novels, mantenha suas histórias atualizadas e jogue direto pelo launcher oficial sem configurações complicadas.</p>
                <a href="#downloads" className={styles.mockPlayBtn}><Glyph name="download"/> Baixar Launcher Oficial <Glyph name="arrow"/></a>
              </div>
              <div className={styles.mockMetaPills}>
                <span className={styles.mockPill}><Glyph name="zap"/> Runtimes Ren&apos;Py 7 &amp; 8</span>
                <span className={styles.mockPill}><Glyph name="cloud"/> Saves Locais e Nuvem</span>
                <span className={styles.mockPill}><Glyph name="gamepad"/> Compatível com Windows</span>
                <span className={styles.mockPill}><Glyph name="android"/> Android</span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.features}>
          <article><span className={styles.featureIcon}><Glyph name="library"/></span><small>01 / ORGANIZE</small><h3>Um lugar para seus mundos.</h3><p>Sua biblioteca, seus favoritos e suas próximas histórias reunidos dentro do launcher.</p><a href="#downloads">Quero o RenPlay <Glyph name="arrow"/></a></article>
          <article><span className={styles.featureIcon}><Glyph name="download"/></span><small>02 / JOGUE</small><h3>Do catálogo para sua tela.</h3><p>No launcher Windows, baixe, instale e abra os jogos compatíveis com os runtimes incluídos.</p><a href="#downloads">Conheça as versões <Glyph name="arrow"/></a></article>
          <article><span className={styles.featureIcon}><Glyph name="cloud"/></span><small>03 / CONTINUE</small><h3>Não perca seu capítulo.</h3><p>Organize seus saves locais gratuitamente e conheça as opções de nuvem dos planos RenPlay.</p><a href="#downloads">Encontre sua versão <Glyph name="arrow"/></a></article>
        </div>
      </section>

      <section id="downloads" className={styles.downloads} aria-labelledby="downloads-title">
        <div className={styles.downloadIntro}><span className={styles.eyebrow}>ESCOLHA ONDE SUA HISTÓRIA CONTINUA</span><h2 id="downloads-title">Seu mundo.<br/><em>Na sua tela.</em></h2><p>Encontre a versão do RenPlay para seu dispositivo. As versões disponíveis têm download direto aqui.</p><span className={styles.downloadHint}>Os jogos e os recursos disponíveis podem variar por plataforma.</span></div>
        <div className={styles.platformGrid}>{platforms.map(platform => <article key={platform.id} className={`${styles.platform} ${styles[platform.id] || ""}`}>
          <div className={styles.platformTop}><Glyph name={platform.id}/><span className={urlFor(platform.id) ? styles.available : styles.upcoming}>{urlFor(platform.id) ? "Disponível" : "Em breve"}</span></div><h3>{platform.name}</h3><p>{platform.format}</p>{urlFor(platform.id) && <small>{launcherInfo.downloads?.[platform.id]?.version ? `Versão ${launcherInfo.downloads[platform.id]?.version}` : "Download oficial"}{launcherInfo.downloads?.[platform.id]?.architecture ? ` · ${launcherInfo.downloads[platform.id]?.architecture}` : ""}</small>}{platformButton(platform.id)}
        </article>)}</div>
      </section>

      <section className={styles.closing}><span className={styles.eyebrow}>CADA ESCOLHA ABRE UM CAMINHO</span><h2>A próxima história<br/>pode ser a sua favorita.</h2><a href="#downloads" className={styles.primary}><Glyph name="download"/>Encontre seu download <Glyph name="arrow"/></a></section>
    </main>
    <footer className={styles.footer}><Link href="/" className={styles.footerBrand}>REN<span>PLAY</span></Link><p>Histórias que continuam com você.</p><div><a href="#downloads">Downloads</a><Link href="/account">Minha conta</Link><Link href="/dashboard">Área de criadores</Link></div><small>© 2026 RenPlay</small></footer>
  </div>;
}

