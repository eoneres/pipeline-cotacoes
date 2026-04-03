# Guia de Deploy

## 🌐 Deploy Backend (Render)

1. Crie conta em [Render](https://render.com)
2. Conecte com GitHub
3. Clique em "New Web Service"
4. Selecione o repositório
5. Configure:
   - **Build Command**: `npm install && npx prisma generate`
   - **Start Command**: `npm start`
6. Adicione variáveis de ambiente
7. Clique em "Deploy"

## 🎨 Deploy Frontend (Vercel)

1. Crie conta em [Vercel](https://vercel.com)
2. Importe repositório
3. Configure:
   - **Framework**: Vite
   - **Root Directory**: frontend
4. Adicione variáveis de ambiente
5. Clique em "Deploy"

## 🗄️ Deploy Banco (Supabase)

1. Crie conta em [Supabase](https://supabase.com)
2. Clique em "New Project"
3. Configure região
4. Execute migrações:
   ```sql
   -- Copiar schema do Prisma
Anote a DATABASE_URL

💾 Deploy Redis (Redis Cloud)
Crie conta em Redis Cloud

Clique em "Create Subscription"

Escolha plano Free

Crie banco Redis

Anote credenciais

🔗 Verificar Deploy
bash
# Health check
curl https://api.pipeline-cotacoes.com/health

# Testar API
curl https://api.pipeline-cotacoes.com/api/cotacoes/moedas

# Acessar frontend
open https://pipeline-cotacoes.vercel.app
text

---

### **7. Atualizar package.json com scripts de documentação**

```json
{
  "scripts": {
    "docs:build": "npm run docs:api && npm run docs:swagger",
    "docs:api": "jsdoc -c jsdoc.json",
    "docs:swagger": "swagger-cli bundle backend/src/config/swagger.js -o docs/swagger.json",
    "docs:serve": "http-server docs -p 8080"
  }
}
