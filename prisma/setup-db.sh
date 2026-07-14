#!/bin/bash
set -e
cd "$(dirname "$0")/.."

echo "=== Step 1: Enable pgvector + citext extensions ==="
npx prisma db execute --file prisma/sql/enable_extensions.sql
echo "Extensions enabled."

echo "=== Step 2: Remove broken migrations ==="
rm -rf prisma/migrations
echo "Migrations directory removed."

echo "=== Step 3: Generate fresh init migration ==="
npx prisma migrate dev --name init
echo "Init migration generated."

echo "=== Step 4: Apply migration to Neon ==="
npx prisma migrate deploy
echo "Migration deployed."

echo "=== Step 5: Generate Prisma client ==="
npx prisma generate
echo "Prisma client generated."

echo "=== Database setup complete ==="
