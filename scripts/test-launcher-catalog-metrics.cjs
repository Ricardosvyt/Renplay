const { test } = require('node:test');
const assert = require('node:assert/strict');
const { launcherCatalogQuery, mapLauncherCatalogGame } = require('../src/lib/launcher-catalog-query.cjs');

test('launcher catalog query aggregates visible reviews and recorded downloads per game', () => {
  assert.match(launcherCatalogQuery, /FROM rp_reviews[\s\S]*?WHERE hidden = false[\s\S]*?GROUP BY game_id/i);
  assert.match(launcherCatalogQuery, /FROM rp_downloads[\s\S]*?GROUP BY game_id/i);
  assert.match(launcherCatalogQuery, /LEFT JOIN/i);
  assert.match(launcherCatalogQuery, /FROM rp_translations[\s\S]*?status = 'PUBLISHED'/i);
});

test('launcher catalog exposes only published translation summaries', () => {
  const mapped = mapLauncherCatalogGame({
    id: 'translated-game', name: 'Translated game', created_at: null, updated_at: null,
    metadata: {}, rating_average: null, review_count: 0, download_count: 0,
    available_translations: [{ id: 'pt-id', language: 'Português', version: '1.0', compatibleVersions: ['1.0'] }]
  });
  assert.equal(mapped.availableTranslations.length, 1);
  assert.equal(mapped.availableTranslations[0].language, 'Português');
});

test('launcher catalog maps aggregate values to the fields consumed by the renderer', () => {
  assert.deepEqual(mapLauncherCatalogGame({
    id: 'tokyo-memories', name: 'Tokyo Memories', created_at: '2026-10-19', updated_at: '2026-10-20',
    metadata: { genre: 'Drama', rating: 1, downloads: 5 },
    rating_average: '4.7', review_count: '12800', download_count: '256400'
  }), {
    id: 'tokyo-memories', name: 'Tokyo Memories', createdAt: '2026-10-19', updatedAt: '2026-10-20',
    genre: 'Drama', rating: 4.7, reviewCount: 12800, downloads: 256400
  });
});

test('empty aggregate rows stay honest instead of inheriting mock metadata values', () => {
  assert.deepEqual(mapLauncherCatalogGame({
    id: 'new-game', name: 'New game', created_at: null, updated_at: null,
    metadata: { rating: 4.9, downloads: 90000 },
    rating_average: null, review_count: 0, download_count: 0
  }), {
    id: 'new-game', name: 'New game', createdAt: null, updatedAt: null,
    rating: null, reviewCount: 0, downloads: 0
  });
});
