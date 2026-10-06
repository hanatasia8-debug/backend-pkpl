#!/bin/sh
set -e

echo "Menghubungkan ke basis data PostgreSQL dan menerapkan skema Prisma..."
npx prisma db push --skip-generate --accept-data-loss

echo "Populasi data dummy awal (seeding database)..."
node prisma/seed.js || true

exec "$@"