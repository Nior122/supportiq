@echo off
cd /d "c:\Users\PC\Desktop\ai customer"

echo === Step 1: Enable extensions ===
npx prisma db execute --file prisma/sql/enable_extensions.sql
if errorlevel 1 (echo FAILED at step 1 & exit /b 1)

echo === Step 2: Remove broken migrations ===
if exist prisma\migrations rmdir /s /q prisma\migrations
echo Migrations removed.

echo === Step 3: Generate init migration ===
npx prisma migrate dev --name init
if errorlevel 1 (echo FAILED at step 3 & exit /b 1)

echo === Step 4: Deploy migration ===
npx prisma migrate deploy
if errorlevel 1 (echo FAILED at step 4 & exit /b 1)

echo === Step 5: Generate Prisma client ===
npx prisma generate
if errorlevel 1 (echo FAILED at step 5 & exit /b 1)

echo === DONE ===
