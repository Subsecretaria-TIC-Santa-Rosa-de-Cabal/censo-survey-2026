import "dotenv/config";

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL no esta configurada");
  process.exit(1);
}

const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const csvPath = path.join(__dirname, "..", "barrios.csv");

async function main() {
  const content = fs.readFileSync(csvPath, "utf-8");
  const lines = content.split(/\r?\n/).filter((line) => line.trim() !== "");

  // Skip header
  const dataLines = lines.slice(1);

  const neighborhoods = dataLines
    .map((line) => {
      const [name, comuna] = line.split(";");
      return {
        name: name?.trim(),
        comuna: comuna?.trim() || null,
      };
    })
    .filter((item) => item.name)
    .sort((a, b) => a.name.localeCompare(b.name, "es", { sensitivity: "base" }));

  console.log(`Cargando ${neighborhoods.length} barrios...`);

  let created = 0;
  let skipped = 0;

  for (const neighborhood of neighborhoods) {
    try {
      await prisma.neighborhood.upsert({
        where: { name: neighborhood.name },
        update: { comuna: neighborhood.comuna },
        create: {
          name: neighborhood.name,
          comuna: neighborhood.comuna,
        },
      });
      created++;
    } catch (error) {
      console.error(`Error con ${neighborhood.name}:`, error.message);
      skipped++;
    }
  }

  console.log(`Barrios creados/actualizados: ${created}`);
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
