import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Pool } from "pg";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
if (!process.env.DATABASE_URL) {
  const envFile = await fs.readFile(path.join(projectRoot, ".env"), "utf8").catch(() => "");
  const databaseLine = envFile.split(/\r?\n/).find((line) => line.startsWith("DATABASE_URL="));
  if (databaseLine) process.env.DATABASE_URL = databaseLine.slice("DATABASE_URL=".length).trim().replace(/^"|"$/g, "");
}
if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL não configurada.");

const games = [
  ["tokyo-memories", "Tokyo Memories: Destino", "Romance / Drama", "Studio Sakura", "Uma história sobre reencontros, escolhas e os caminhos que o destino esconde.", "PUBLISHED"],
  ["so-much-to-love", "So Much To Love", "Romance", "Rina Works", "Uma visual novel leve sobre amizade, carinho e novas oportunidades.", "PUBLISHED"],
  ["midnight-campus", "Midnight Campus", "Mistério", "Night Owl Studio", "Investigue os segredos de um campus que só aparece depois da meia-noite.", "PUBLISHED"],
  ["letters-in-spring", "Letters in Spring", "Drama", "Hana Interactive", "Cartas antigas conectam duas gerações em uma narrativa delicada e emocionante.", "PUBLISHED"],
  ["neon-afterglow", "Neon Afterglow", "Sci-fi", "Pixel Aurora", "Em uma cidade iluminada por neon, cada decisão pode alterar o futuro.", "PUBLISHED"],
  ["cafe-rainy-days", "Café Rainy Days", "Slice of Life", "Mochi Team", "Conheça clientes curiosos e histórias acolhedoras em um café sempre chuvoso.", "PUBLISHED"],
  ["the-last-summer", "The Last Summer", "Aventura", "Blue Horizon", "Uma última viagem de verão transforma para sempre um grupo de amigos.", "DRAFT"],
  ["moonlit-garden", "Moonlit Garden", "Fantasia", "Luna Tales", "Explore um jardim mágico onde as flores guardam memórias esquecidas.", "PUBLISHED"],
  ["paper-cranes", "Paper Cranes", "Romance", "Kitsune House", "Promessas, origamis e uma busca para reencontrar alguém muito especial.", "DRAFT"],
  ["echoes-of-eden", "Echoes of Eden", "Fantasia / Drama", "Eden Forge", "Uma jornada épica por um mundo que está perdendo suas últimas lembranças.", "PUBLISHED"],
];

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
const client = await pool.connect();
try {
  await client.query("BEGIN");
  const owner = await client.query("SELECT id FROM rp_users WHERE username = 'teste.admin' LIMIT 1");
  const createdBy = owner.rows[0]?.id ?? null;
  for (const [id, name, genre, developer, description, status] of games) {
    const metadata = {
      description,
      fullDescription: `${description} Esta é uma experiência de exemplo criada para testar a vitrine, filtros e fluxo de publicação do RenPlay.`,
      developer,
      publisher: "RenPlay Publishing",
      genre,
      category: "Visual Novel",
      version: "1.0.0",
      coverImage: "/images/so-much-to-love-cover.jpg",
      horizontalBanner: "/images/so-much-to-love-01.jpg",
      screenshots: ["/images/so-much-to-love-01.jpg", "/images/so-much-to-love-02.webp", "/images/so-much-to-love-03.webp"],
      downloadUrl: "https://example.com/renplay-demo.zip",
      platforms: ["Windows", "Android"],
      languages: ["Português (Brasil)", "Inglês"],
      tags: ["Demo", "RenPlay", "Visual Novel"],
      fileSize: "480 MB",
      fileVersion: "1.0.0",
      mainFileName: `${id}-v1.0.0.zip`,
      translatedBy: "Equipe RenPlay",
      changeLog: "Versão inicial de demonstração.",
    };
    await client.query(
      `INSERT INTO rp_games (id, name, status, metadata, created_by, distribution_authorized)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, status = EXCLUDED.status,
       metadata = EXCLUDED.metadata, created_by = EXCLUDED.created_by,
       distribution_authorized = EXCLUDED.distribution_authorized, updated_at = now()`,
      [id, name, status, metadata, createdBy, status === "PUBLISHED"]
    );
  }
  await client.query("COMMIT");
  console.log(`Jogos de exemplo inseridos/atualizados: ${games.length}`);
} catch (error) {
  await client.query("ROLLBACK").catch(() => undefined);
  throw error;
} finally {
  client.release();
  await pool.end();
}
