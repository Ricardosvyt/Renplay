const launcherCatalogQuery = `
  SELECT g.id, g.public_id::text AS public_id, g.name, g.status, g.metadata, g.created_at, g.updated_at,
    reviews.rating_average,
    COALESCE(reviews.review_count, 0)::int AS review_count,
    COALESCE(downloads.download_count, 0)::int AS download_count
  FROM rp_games g
  LEFT JOIN (
    SELECT game_id, ROUND(AVG(rating)::numeric, 1) AS rating_average,
      COUNT(*)::int AS review_count
    FROM rp_reviews
    WHERE hidden = false
    GROUP BY game_id
  ) reviews ON reviews.game_id = g.id
  LEFT JOIN (
    SELECT game_id, COUNT(*)::int AS download_count
    FROM rp_downloads
    GROUP BY game_id
  ) downloads ON downloads.game_id = g.id
  WHERE g.status = 'PUBLISHED' AND g.distribution_authorized = true
  ORDER BY g.updated_at DESC
`;

function mapLauncherCatalogGame(row) {
  const metadata = row.metadata && typeof row.metadata === 'object' ? row.metadata : {};
  const average = row.rating_average === null || row.rating_average === undefined
    ? null
    : Number(row.rating_average);

  const sizeLabel = metadata.fileSize || metadata.sizeLabel || metadata.size || metadata.tamanho;
  const canonicalId = String(row.public_id || row.id);

  return {
    ...metadata,
    ...(sizeLabel ? { fileSize: metadata.fileSize || sizeLabel, sizeLabel, size: sizeLabel } : {}),
    ...(metadata.sizeBytes ? { sizeBytes: Number(metadata.sizeBytes) } : {}),
    id: canonicalId,
    publicId: row.public_id ? String(row.public_id) : undefined,
    public_id: row.public_id ? String(row.public_id) : undefined,
    legacyId: row.id,
    slug: metadata.slug || row.id,
    name: row.name,
    ...(row.status ? { status: row.status } : {}),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    rating: Number.isFinite(average) ? average : null,
    reviewCount: Number(row.review_count ?? 0),
    downloads: Number(row.download_count ?? 0)
  };
}

module.exports = { launcherCatalogQuery, mapLauncherCatalogGame };
