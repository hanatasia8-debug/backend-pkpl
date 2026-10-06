require("dotenv/config");
const { Pool } = require("pg");

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    console.log("Menambahkan kolom baru ke tabel village_profile secara aman (non-destructive)...");
    
    await pool.query(`
      ALTER TABLE village_profile 
      ADD COLUMN IF NOT EXISTS about_text TEXT,
      ADD COLUMN IF NOT EXISTS history_text TEXT,
      ADD COLUMN IF NOT EXISTS vision TEXT,
      ADD COLUMN IF NOT EXISTS missions TEXT,
      ADD COLUMN IF NOT EXISTS structure_image_url TEXT;
    `);

    console.log("✅ Berhasil menambahkan kolom-kolom baru ke tabel village_profile!");
  } catch (error) {
    console.error("❌ Gagal migrasi kolom:", error);
  } finally {
    await pool.end();
  }
}

main();
