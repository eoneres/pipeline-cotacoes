# Guia de Instalação - Pipeline de Cotações

## 📋 Pré-requisitos

- **Node.js**: v18.0.0 ou superior
- **npm**: v9.0.0 ou superior
- **Git**: Para clonar o repositório
- **Python 3.8+**: Apenas para Prophet
- **Docker**: Opcional, para Redis

## 🚀 Instalação Rápida

### Windows

```powershell
# 1. Instalar Node.js
winget install OpenJS.NodeJS

# 2. Instalar Git
winget install Git.Git

# 3. Clonar repositório
git clone https://github.com/eoneres/pipeline-cotacoes.git
cd pipeline-cotacoes

# 4. Instalar dependências
npm run setup

# 5. Configurar ambiente
cd backend
cp .env.example .env

# 6. Iniciar
npm run dev

LINUX/MAC OS

# 1. Instalar Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 2. Clonar repositório
git clone https://github.com/eoneres/pipeline-cotacoes.git
cd pipeline-cotacoes

# 3. Instalar dependências
npm run setup

# 4. Configurar ambiente
cd backend
cp .env.example .env

# 5. Iniciar
npm run dev

DOCKER

# 1. Instalar Docker Desktop
# Windows: https://docs.docker.com/desktop/install/windows-install/
# Linux: sudo apt-get install docker-compose

# 2. Clonar repositório
git clone https://github.com/eoneres/pipeline-cotacoes.git
cd pipeline-cotacoes

# 3. Iniciar containers
docker-compose up -d

# 4. Verificar logs
docker-compose logs -f

🐳 Instalação com Docker
bash
# 1. Instalar Docker Desktop
# Windows: https://docs.docker.com/desktop/install/windows-install/
# Linux: sudo apt-get install docker-compose

# 2. Clonar repositório
git clone https://github.com/eoneres/pipeline-cotacoes.git
cd pipeline-cotacoes

# 3. Iniciar containers
docker-compose up -d

# 4. Verificar logs
docker-compose logs -f
🔧 Configuração do Banco de Dados
SQLite (Desenvolvimento)
bash
cd backend
npx prisma migrate dev --name init
PostgreSQL (Produção)
sql
-- Criar banco de dados
CREATE DATABASE pipeline_cotacoes;

-- Criar usuário
CREATE USER cotacoes_user WITH PASSWORD 'sua_senha';

-- Dar permissões
GRANT ALL PRIVILEGES ON DATABASE pipeline_cotacoes TO cotacoes_user;
🧪 Verificação da Instalação
bash
# Verificar backend
curl http://localhost:3001/health

# Verificar frontend
# Acesse http://localhost:3000 no navegador

# Verificar WebSocket
# Deve aparecer "✅ WebSocket conectado" no console
🐛 Solução de Problemas
Erro: Port 3001 already in use
bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :3001
kill -9 <PID>
Erro: Prisma Client not found
bash
cd backend
npx prisma generate
Erro: Redis connection failed
bash
# Iniciar Redis com Docker
docker run -d --name redis -p 6379:6379 redis:7-alpine

# Ou instalar Redis localmente
# Windows: https://github.com/microsoftarchive/redis/releases
# Linux: sudo apt-get install redis-server
📦 Scripts Úteis
bash
# Backend
npm run dev          # Desenvolvimento
npm run start        # Produção
npm run test         # Testes
npm run prisma:studio # Interface do banco

# Frontend
npm run dev          # Desenvolvimento
npm run build        # Build de produção
npm run preview      # Preview do build

# Gerais
npm run setup        # Instalar todas dependências
npm run docker:up    # Subir containers
npm run docker:down  # Descer containers
text

---

### **4. Guia de Contribuição**

### **Arquivo: `docs/CONTRIBUTING.md`**

```markdown
# Guia de Contribuição

## 🎯 Como Contribuir

1. **Fork o repositório**
2. **Crie uma branch** (`git checkout -b feature/nova-funcionalidade`)
3. **Commit suas mudanças** (`git commit -m 'feat: adiciona nova funcionalidade'`)
4. **Push para a branch** (`git push origin feature/nova-funcionalidade`)
5. **Abra um Pull Request**

## 📝 Padrões de Código

### Backend

```javascript
// Use async/await
async function buscarDados() {
  try {
    const dados = await service.buscar();
    return dados;
  } catch (error) {
    logger.error('Erro:', error);
    throw error;
  }
}

// Use logger em vez de console
logger.info('Mensagem informativa');
logger.error('Erro:', error);
Frontend
jsx
// Use hooks funcionais
const MeuComponente = ({ prop }) => {
  const [state, setState] = useState(null);
  
  useEffect(() => {
    // Efeito colateral
  }, []);
  
  return <div>{prop}</div>;
};

// Use TailwindCSS para estilos
<div className="bg-white rounded-lg shadow-md p-4">
🧪 Testes
bash
# Executar testes
npm test

# Testes com cobertura
npm run test:coverage

# Modo watch
npm run test:watch
📚 Commits Semânticos
Tipo	Descrição
feat	Nova funcionalidade
fix	Correção de bug
docs	Documentação
style	Formatação
refactor	Refatoração
test	Testes
chore	Manutenção
Exemplo: feat: adiciona previsão com Prophet

text

---

### **5. Changelog**

### **Arquivo: `docs/CHANGELOG.md`**

```markdown
# Changelog

## [1.0.0] - 2024-04-02

### 🚀 Funcionalidades
- Pipeline ETL completo para coleta de cotações
- Dashboard com gráficos interativos
- Sistema de alertas configuráveis
- Previsões com Regressão Linear
- Análise de Sentimento de notícias
- WebSocket para atualizações em tempo real
- Cache Redis para alta performance
- Exportação CSV/Excel
- Documentação Swagger completa

### 🔧 Melhorias
- Performance 40x com Redis
- Interface responsiva com TailwindCSS
- Tratamento de erros robusto
- Logging estruturado

### 🐛 Correções
- Corrigido problema de reconexão WebSocket
- Corrigido erro de validação de dados
- Corrigido formatação de moedas