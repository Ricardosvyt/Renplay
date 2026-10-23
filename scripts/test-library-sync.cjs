const { test, describe } = require("node:test");
const assert = require("node:assert/strict");

describe("TESTES DE SINCRONIZAÇÃO DA BIBLIOTECA (SITE ↔ LAUNCHER ↔ NEON)", () => {
  // Simulação de banco de dados e estado com regras idênticas ao Neon PostgreSQL
  function createMockEnvironment() {
    const games = new Map([
      ["sakura-memories", { id: "sakura-memories", name: "Sakura Memories", status: "PUBLISHED", metadata: { version: "1.0.0", downloadUrl: "https://storage.renplay.site/sakura.7z" } }],
      ["shadow-realm", { id: "shadow-realm", name: "Shadow Realm", status: "DRAFT", metadata: { version: "0.1.0" } }],
      ["cyber-tokyo", { id: "cyber-tokyo", name: "Cyber Tokyo", status: "PUBLISHED", metadata: { version: "2.1.0", downloadUrl: "https://storage.renplay.site/tokyo.7z" } }],
    ]);

    const library = new Map(); // key: `${userId}:${gameId}`, value: { userId, gameId, addedAt: Date }

    function addGameToLibrary(userId, gameId) {
      if (!userId) throw new Error("UNAUTHORIZED");
      const game = games.get(gameId);
      if (!game || game.status !== "PUBLISHED") {
        throw new Error("GAME_NOT_FOUND_OR_NOT_PUBLISHED");
      }
      const key = `${userId}:${gameId}`;
      if (!library.has(key)) {
        library.set(key, { userId, gameId, addedAt: new Date() });
      }
      return { success: true, added: true, gameId };
    }

    function removeGameFromLibrary(userId, gameId) {
      if (!userId) throw new Error("UNAUTHORIZED");
      const key = `${userId}:${gameId}`;
      const existed = library.delete(key);
      return { success: true, removed: existed, gameId };
    }

    function getUserLibrary(userId) {
      if (!userId) throw new Error("UNAUTHORIZED");
      const list = [];
      for (const entry of library.values()) {
        if (entry.userId === userId) {
          const game = games.get(entry.gameId);
          if (game) {
            list.push({ id: game.id, name: game.name, status: game.status, addedAt: entry.addedAt, ...game.metadata });
          }
        }
      }
      return list;
    }

    function getManifest(userId, gameId) {
      if (!userId) throw new Error("UNAUTHORIZED");
      const game = games.get(gameId);
      if (!game) throw new Error("GAME_NOT_FOUND");
      if (game.status !== "PUBLISHED") throw new Error("FORBIDDEN");
      if (!game.metadata?.downloadUrl) throw new Error("MANIFEST_UNAVAILABLE");
      return {
        schemaVersion: 1,
        gameId: game.id,
        name: game.name,
        downloadUrl: game.metadata.downloadUrl,
        sizeBytes: 104857600,
        sha256: "a".repeat(64),
        executable: `${game.id}.exe`,
        files: [{ path: `${game.id}.exe`, size: 104857600, sha256: "a".repeat(64) }],
      };
    }

    return { games, library, addGameToLibrary, removeGameFromLibrary, getUserLibrary, getManifest };
  }

  test("1. Adicionar jogo pelo site / launcher à biblioteca pessoal", () => {
    const env = createMockEnvironment();
    const result = env.addGameToLibrary("user_alice", "sakura-memories");
    assert.equal(result.success, true);
    assert.equal(result.gameId, "sakura-memories");

    const aliceLib = env.getUserLibrary("user_alice");
    assert.equal(aliceLib.length, 1);
    assert.equal(aliceLib[0].id, "sakura-memories");
    assert.equal(aliceLib[0].name, "Sakura Memories");
  });

  test("2. Idempotência: adicionar o mesmo jogo mais de uma vez não duplica o registro", () => {
    const env = createMockEnvironment();
    env.addGameToLibrary("user_alice", "sakura-memories");
    env.addGameToLibrary("user_alice", "sakura-memories");
    env.addGameToLibrary("user_alice", "sakura-memories");

    const aliceLib = env.getUserLibrary("user_alice");
    assert.equal(aliceLib.length, 1, "Não deve haver duplicatas na biblioteca do usuário");
  });

  test("3. Isolamento: Usuário A não vê e não interfere na biblioteca do Usuário B", () => {
    const env = createMockEnvironment();
    env.addGameToLibrary("user_alice", "sakura-memories");
    env.addGameToLibrary("user_bob", "cyber-tokyo");

    const aliceLib = env.getUserLibrary("user_alice");
    const bobLib = env.getUserLibrary("user_bob");

    assert.equal(aliceLib.length, 1);
    assert.equal(aliceLib[0].id, "sakura-memories");

    assert.equal(bobLib.length, 1);
    assert.equal(bobLib[0].id, "cyber-tokyo");
  });

  test("4. Jogo em rascunho (DRAFT) não pode ser adicionado à biblioteca pública", () => {
    const env = createMockEnvironment();
    assert.throws(
      () => env.addGameToLibrary("user_alice", "shadow-realm"),
      /GAME_NOT_FOUND_OR_NOT_PUBLISHED/
    );
    assert.equal(env.getUserLibrary("user_alice").length, 0);
  });

  test("5. Remover jogo da biblioteca e preservação de outros itens", () => {
    const env = createMockEnvironment();
    env.addGameToLibrary("user_alice", "sakura-memories");
    env.addGameToLibrary("user_alice", "cyber-tokyo");

    assert.equal(env.getUserLibrary("user_alice").length, 2);

    const removeRes = env.removeGameFromLibrary("user_alice", "sakura-memories");
    assert.equal(removeRes.success, true);
    assert.equal(removeRes.removed, true);

    const aliceLibAfter = env.getUserLibrary("user_alice");
    assert.equal(aliceLibAfter.length, 1);
    assert.equal(aliceLibAfter[0].id, "cyber-tokyo");
  });

  test("6. Consulta de manifesto de instalação autorizada", () => {
    const env = createMockEnvironment();
    const manifest = env.getManifest("user_alice", "sakura-memories");
    assert.equal(manifest.schemaVersion, 1);
    assert.equal(manifest.gameId, "sakura-memories");
    assert.equal(manifest.downloadUrl, "https://storage.renplay.site/sakura.7z");
    assert.equal(manifest.executable, "sakura-memories.exe");
    assert.equal(manifest.files.length, 1);
  });

  test("7. Tentativa de obter manifesto sem autenticação falha com UNAUTHORIZED", () => {
    const env = createMockEnvironment();
    assert.throws(() => env.getManifest(null, "sakura-memories"), /UNAUTHORIZED/);
  });
});
