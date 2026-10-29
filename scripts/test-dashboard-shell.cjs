const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

test("dashboard layout owns the shared administrative shell", () => {
  const layout = read("src/app/dashboard/layout.tsx");
  const shell = read("src/components/dashboard/DashboardShell.tsx");
  assert.match(layout, /DashboardShell/);
  for (const route of ["jogos", "saves", "usuarios", "publicidade", "configuracoes"]) {
    assert.match(shell, new RegExp(`/dashboard/${route}`));
  }
  assert.match(shell, /Central administrativa/);
});

test("specialized pages no longer create duplicate dashboard chrome", () => {
  for (const file of ["src/app/dashboard/usuarios/page.tsx", "src/app/dashboard/publicidade/page.tsx"]) {
    const source = read(file);
    assert.doesNotMatch(source, /<header/);
    assert.doesNotMatch(source, /DashboardSidebar/);
  }
});
