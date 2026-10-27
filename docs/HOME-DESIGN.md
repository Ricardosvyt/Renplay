# Página inicial e downloads

A página inicial usa `RenPlayLanding.tsx` e `RenPlayLanding.module.css`. É uma página promocional de download, sem catálogo, busca, filtros ou modal de jogos. A página consulta apenas as versões do launcher. A personagem principal é a Rina, usando o asset original public/Rina.png, com composição gráfica em CSS. No computador, o destaque é Windows; em telas de até 760 px, Android ganha destaque e aparece primeiro na seção de downloads. Linux e macOS também têm cartões próprios.

## Downloads reais

`GET /api/launcher` retorna `downloads.windows`, `downloads.linux`, `downloads.macos` e `downloads.android`, cada um com `url`, `version` e `architecture` opcionais. O campo antigo `downloadUrl` continua correspondendo ao Windows.

Os links podem vir de releases publicadas com assets verificados no banco, de `src/data/launcher.json` ou das variáveis de ambiente abaixo (prioridade maior):

- `RENPLAY_DOWNLOAD_WINDOWS_URL`
- `RENPLAY_DOWNLOAD_LINUX_URL`
- `RENPLAY_DOWNLOAD_MACOS_URL`
- `RENPLAY_DOWNLOAD_ANDROID_URL`

Use HTTPS ou um caminho `/downloads/arquivo` realmente existente em `public`. Sem link, a interface mostra **Em breve**; não simula download nem oferece um executável Windows no botão Android. Publicar um link não cria um build: cada arquivo deve ser compilado para sua plataforma antes de configurar sua URL.

## Arte anterior (preservada, fora da página atual)

Asset: `public/assets/renplay/landing/story-portal-v1.png`. Gerado com a ferramenta integrada de geração de imagens. É ilustração de marca, não captura de um jogo real.

Prompt utilizado:

> Use case: stylized-concept. Asset type: original hero illustration for RenPlay, a visual novel game launcher website with charcoal black and warm yellow branding. Create a cinematic premium anime environment: a cozy futuristic reading and gaming room opening onto a vast luminous golden portal and a dreamy floating island landscape at twilight. A single adult traveler in a dark jacket seen from behind, sitting at a desk with a widescreen monitor and a phone, both showing abstract landscapes without readable UI. Beautiful hand-painted animation background, detailed architectural lines, warm amber rim light, muted charcoal, cream gold and subtle blue shadows, atmospheric depth. Landscape 1536x1024 composition, main subject and bright portal in right two-thirds, left side dark and calm for layout overlap. Inviting, adventurous, polished illustration, not photorealistic. No text, no logo, no watermark, no sexual content. This is decorative brand artwork, not a real game screenshot.

