const { test } = require('node:test');
const assert = require('node:assert/strict');
const { getPopularGames, getRecentGames, formatCompactCount, storefrontCategories } = require('../src/lib/storefront-data');

test('ranks popular games by real downloads without mutating the catalog', () => {
  const catalog = [
    { id: 'a', downloads: 12 },
    { id: 'b', downloads: 90 },
    { id: 'c', downloads: 30 }
  ];

  assert.deepEqual(getPopularGames(catalog, 2).map(game => game.id), ['b', 'c']);
  assert.deepEqual(catalog.map(game => game.id), ['a', 'b', 'c']);
});

test('recent games sort by published date and fall back to update date', () => {
  const catalog = [
    { id: 'old', publishedAt: '2026-01-01' },
    { id: 'new', publishedAt: '2026-02-01' },
    { id: 'updated', updatedAt: '2026-03-01' }
  ];

  assert.deepEqual(getRecentGames(catalog, 3).map(game => game.id), ['updated', 'new', 'old']);
});

test('compact counts and eight named storefront categories are stable', () => {
  assert.equal(formatCompactCount(256400).replace(/\u00a0/g, ' '), '256,4 mil');
  assert.deepEqual(storefrontCategories.map(category => category.name), [
    'Drama', 'Romance', 'Fantasia', 'Mistério',
    'Slice of Life', 'Comédia', 'Suspense', 'Aventura'
  ]);
  assert.equal(storefrontCategories.length, 8);
});
