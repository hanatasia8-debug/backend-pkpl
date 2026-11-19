// Bridge to prisma/seed.mjs to ensure backward compatibility
require("dotenv/config");

import("./seed.mjs").catch((err) => {
  console.error("❌ Seeding Error:", err);
  process.exit(1);
});
