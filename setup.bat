@echo off
echo 🚀 Configurando Pipeline de Cotações...
echo.

echo 📦 Instalando dependências raiz...
call npm install --save-dev concurrently
echo.

echo 📦 Instalando dependências do backend...
cd backend
call npm install
echo.

echo 🔧 Configurando Prisma...
call npx prisma generate
call npx prisma migrate dev --name init
echo.

echo 📝 Configurando ambiente...
if not exist .env copy .env.example .env
echo.

cd ..
echo 📦 Instalando dependências do frontend...
cd frontend
call npm install
echo.

cd ..
echo ✅ Setup concluído!
echo.
echo 🚀 Para iniciar o projeto:
echo   npm run dev:backend  - Inicia apenas o backend
echo   npm run dev:frontend - Inicia apenas o frontend
echo   npm run dev          - Inicia ambos
echo   npm run docker:up    - Inicia com Docker