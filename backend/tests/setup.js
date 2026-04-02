const dotenv = require('dotenv');

// Configurar ambiente de teste
dotenv.config({ path: '.env.test' });

// Forçar ambiente de teste
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = process.env.DATABASE_URL || 'file:./test.db';

// Aumentar timeout para operações de banco
jest.setTimeout(10000);