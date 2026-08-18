import "dotenv/config";

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL no esta configurada");
  process.exit(1);
}

const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const epsNames = [
  "Asmet Salud",
  "Coosalud",
  "Compensar",
  "Famisanar",
  "Nueva EPS",
  "Pijaos Salud",
  "S.O.S.",
  "SURA",
  "Salud Total",
  "Sanitas",
];

async function main() {
  const sortedNames = [...epsNames].sort((a, b) =>
    a.localeCompare(b, "es", { sensitivity: "base" })
  );

  console.log(`Cargando ${sortedNames.length} EPS...`);

  let created = 0;
  let skipped = 0;

  for (const name of sortedNames) {
    try {
      await prisma.eps.upsert({
        where: { name },
        update: {},
        create: { name },
      });
      created++;
    } catch (error) {
      console.error(`Error con ${name}:`, error.message);
      skipped++;
    }
  }

  console.log(`EPS creadas/actualizadas: ${created}`);
  console.log(`Errores: ${skipped}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
