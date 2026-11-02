// Lokalni PostgreSQL za razvoj (embedded-postgres, pravi Postgres binarni paket).
// Pokreni: npm run db  — ostavi terminal otvoren. Podaci su u ./.pgdata
import { existsSync } from "node:fs";
import EmbeddedPostgres from "embedded-postgres";

const databaseDir = new URL("../.pgdata", import.meta.url).pathname;
const pg = new EmbeddedPostgres({ databaseDir, user: "dvaput", password: "dvaput", port: 5433, persistent: true });

if (!existsSync(databaseDir)) await pg.initialise();
await pg.start();
try {
  await pg.createDatabase("dvaput");
} catch {
  // baza već postoji
}
console.log("✅ PostgreSQL radi: postgresql://dvaput:dvaput@localhost:5433/dvaput");

const stop = async () => {
  await pg.stop();
  process.exit(0);
};
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
