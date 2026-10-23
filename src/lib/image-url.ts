/**
 * Utilitário central para formatação e exibição segura de imagens no RenPlay.
 *
 * 1. Imagens locais (/images/..., /Logo.png) e base64 (data:image/...) são retornadas diretamente.
 * 2. Imagens remotas (HTTP / HTTPS) passam pelo proxy do servidor (/api/image-proxy?url=...),
 *    evitando bloqueios de hotlink (HTTP 403), falhas de CORS e cabeçalhos de Referer cruzados.
 * 3. Valores nulos ou vazios retornam fallback seguro para evitar imagens quebradas.
 */
export function formatImageUrl(url?: string | null, fallback = "/images/so-much-to-love-cover.jpg"): string {
  if (!url || typeof url !== "string") return fallback;
  const trimmed = url.trim();
  if (!trimmed) return fallback;

  // Imagem base64 ou caminho relativo local
  if (trimmed.startsWith("/") || trimmed.startsWith("data:")) {
    return trimmed;
  }

  // URL externa segura roteada pelo proxy
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return `/api/image-proxy?url=${encodeURIComponent(trimmed)}`;
  }

  return fallback;
}
