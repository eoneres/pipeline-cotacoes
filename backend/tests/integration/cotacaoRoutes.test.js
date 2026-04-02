const request = require('supertest');
const app = require('../../src/server');
const { prisma } = require('../../src/config/database');

describe('Integração - Rotas de Cotação', () => {
    beforeAll(async () => {
        // Limpar dados de teste
        await prisma.cotacao.deleteMany();
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });

    describe('GET /api/cotacoes', () => {
        it('deve retornar lista de cotações', async () => {
            const response = await request(app)
                .get('/api/cotacoes')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeDefined();
            expect(response.body.pagination).toBeDefined();
        });

        it('deve filtrar por moeda', async () => {
            const response = await request(app)
                .get('/api/cotacoes?moeda=USD-BRL')
                .expect(200);

            expect(response.body.success).toBe(true);
        });

        it('deve validar parâmetros inválidos', async () => {
            const response = await request(app)
                .get('/api/cotacoes?limit=9999')
                .expect(400);

            expect(response.body.error).toBe('Erro de validação');
        });
    });

    describe('GET /api/cotacoes/moedas', () => {
        it('deve retornar lista de moedas disponíveis', async () => {
            const response = await request(app)
                .get('/api/cotacoes/moedas')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeDefined();
            expect(Array.isArray(response.body.data)).toBe(true);
        });
    });

    describe('GET /api/cotacoes/atuais/:moeda', () => {
        it('deve retornar cotação atual para moeda válida', async () => {
            const response = await request(app)
                .get('/api/cotacoes/atuais/USD-BRL')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeDefined();
        });

        it('deve validar formato de moeda inválido', async () => {
            const response = await request(app)
                .get('/api/cotacoes/atuais/USD')
                .expect(400);

            expect(response.body.error).toBe('Erro de validação');
        });
    });

    describe('GET /api/cotacoes/historico/:moeda', () => {
        it('deve retornar histórico da moeda', async () => {
            const response = await request(app)
                .get('/api/cotacoes/historico/USD-BRL?dias=7')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeDefined();
            expect(response.body.meta).toBeDefined();
        });
    });
});