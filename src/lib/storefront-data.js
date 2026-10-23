const storefrontCategories = [
  { name: 'Drama', count: 420, imageIndex: 6 },
  { name: 'Romance', count: 680, imageIndex: 0 },
  { name: 'Fantasia', count: 320, imageIndex: 2 },
  { name: 'Mistério', count: 280, imageIndex: 7 },
  { name: 'Slice of Life', count: 310, imageIndex: 4 },
  { name: 'Comédia', count: 260, imageIndex: 1 },
  { name: 'Suspense', count: 240, imageIndex: 7 },
  { name: 'Aventura', count: 230, imageIndex: 5 }
];

function getPopularGames(games, limit = 5) {
  return [...games]
    .sort((a, b) => (Number(b.downloads) || 0) - (Number(a.downloads) || 0)
      || (Number(b.rating) || 0) - (Number(a.rating) || 0))
    .slice(0, limit);
}

function getRecentGames(games, limit = 4) {
  return [...games]
    .sort((a, b) => {
      const dateA = Date.parse(a.publishedAt || a.updatedAt || '') || 0;
      const dateB = Date.parse(b.publishedAt || b.updatedAt || '') || 0;
      return dateB - dateA;
    })
    .slice(0, limit);
}

function formatCompactCount(value) {
  if (!Number.isFinite(value) || value < 0) return '—';
  return new Intl.NumberFormat('pt-BR', {
    notation: 'compact',
    compactDisplay: 'short',
    maximumFractionDigits: 1
  }).format(value);
}

module.exports = { getPopularGames, getRecentGames, formatCompactCount, storefrontCategories };
