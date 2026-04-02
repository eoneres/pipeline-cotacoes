const cotacaoService = require('../../src/services/cotacaoService');
const { prisma } = require('../../src/config/database');
const apiService = require('../../src/services/apiService');

// Mock das dependências
jest.mock('../../src/config/database');
jest.mock('../../src/services/apiService');

describe('CotacaoService - Testes Unitários', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('salvarCotacao', () => {
        it('deve salvar uma nova cotação com sucesso', async () => {
            const dadosCotacao = {
                moeda: 'USD-BRL',
                bid: 5.1234,
                ask: 5.1245,
                high: 5.1300,
                low: 5.1200,
                varBid: 0.0011,
                pctChange: 0.02,
                timestamp: new Date()
            };

            prisma.cotacao.upsert.mockResolvedValue(dadosCotacao);

            const resultado = await cotacaoService.salvarCotacao(dadosCotacao);

            expect(resultado).toEqual(dadosCotacao);
            expect(prisma.cotacao.upsert).toHaveBeenCalledWith({
                where: {
                    moeda_timestamp: {
                        moeda: dadosCotacao.moeda,
                        timestamp: dadosCotacao.timestamp
                    }
                },
                update: dadosCotacao,
                create: dadosCotacao
            });
        });

        it('deve lançar erro ao falhar ao salvar', async () => {
            const dadosCotacao = {
                moeda: 'USD-BRL',
                bid: 5.1234,
                ask: 5.1245,
                high: 5.1300,
                low: 5.1200,
                varBid: 0.0011,
                pctChange: 0.02,
                timestamp: new Date()
            };

            const erroEsperado = new Error('Erro ao salvar no banco');
            prisma.cotacao.upsert.mockRejectedValue(erroEsperado);

            await expect(cotacaoService.salvarCotacao(dadosCotacao)).rejects.toThrow('Erro ao salvar no banco');
        });
    });

    describe('buscarCotações', () => {
        it('deve listar cotações com paginação', async () => {
            const mockCotações = [
                { id: '1', moeda: 'USD-BRL', bid: 5.1234, timestamp: new Date() },
                { id: '2', moeda: 'USD-BRL', bid: 5.1245, timestamp: new Date() }
            ];

            prisma.cotacao.findMany.mockResolvedValue(mockCotações);
            prisma.cotacao.count.mockResolvedValue(2);

            const resultado = await cotacaoService.buscarCotações({ limit: 10, offset: 0 });

            expect(resultado.data).toHaveLength(2);
            expect(resultado.pagination.total).toBe(2);
            expect(resultado.pagination.limit).toBe(10);
        });

        it('deve filtrar por moeda', async () => {
            await cotacaoService.buscarCotações({ moeda: 'USD-BRL' });

            expect(prisma.cotacao.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { moeda: 'USD-BRL' }
                })
            );
        });

        it('deve filtrar por período', async () => {
            const startDate = '2024-01-01';
            const endDate = '2024-01-31';

            await cotacaoService.buscarCotações({ startDate, endDate });

            expect(prisma.cotacao.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: {
                        timestamp: {
                            gte: new Date(startDate),
                            lte: new Date(endDate)
                        }
                    }
                })
            );
        });
    });

    describe('buscarCotacaoAtual', () => {
        it('deve buscar cotação do banco se existir recente', async () => {
            const cotacaoMock = {
                moeda: 'USD-BRL',
                bid: 5.1234,
                timestamp: new Date()
            };

            prisma.cotacao.findFirst.mockResolvedValue(cotacaoMock);

            const resultado = await cotacaoService.buscarCotacaoAtual('USD-BRL');

            expect(resultado).toEqual(cotacaoMock);
            expect(apiService.getCotacoesAtuais).not.toHaveBeenCalled();
        });

        it('deve buscar da API se não houver dados recentes', async () => {
            prisma.cotacao.findFirst.mockResolvedValue(null);

            const apiResponse = {
                'USD-BRL': {
                    bid: '5.1234',
                    ask: '5.1245',
                    high: '5.1300',
                    low: '5.1200',
                    varBid: '0.0011',
                    pctChange: '0.02',
                    timestamp: Math.floor(Date.now() / 1000)
                }
            };

            apiService.getCotacoesAtuais.mockResolvedValue(apiResponse);
            prisma.cotacao.upsert.mockResolvedValue({ moeda: 'USD-BRL', bid: 5.1234 });

            const resultado = await cotacaoService.buscarCotacaoAtual('USD-BRL');

            expect(resultado).toBeDefined();
            expect(apiService.getCotacoesAtuais).toHaveBeenCalledWith('USD-BRL');
        });
    });

    describe('calcularEstatisticas', () => {
        it('deve calcular estatísticas corretamente', async () => {
            const historicoMock = [
                { bid: 5.10, pctChange: 0.1, timestamp: new Date('2024-01-01') },
                { bid: 5.12, pctChange: 0.2, timestamp: new Date('2024-01-02') },
                { bid: 5.15, pctChange: 0.3, timestamp: new Date('2024-01-03') },
                { bid: 5.13, pctChange: -0.1, timestamp: new Date('2024-01-04') },
                { bid: 5.18, pctChange: 0.5, timestamp: new Date('2024-01-05') }
            ];

            jest.spyOn(cotacaoService, 'buscarHistorico').mockResolvedValue(historicoMock);

            const stats = await cotacaoService.calcularEstatisticas('USD-BRL', 5);

            expect(stats.moeda).toBe('USD-BRL');
            expect(stats.total_registros).toBe(5);
            expect(parseFloat(stats.media_bid)).toBeCloseTo(5.136, 2);
            expect(parseFloat(stats.max_bid)).toBe(5.18);
            expect(parseFloat(stats.min_bid)).toBe(5.10);
            expect(stats.variacao_periodo).toBeDefined();
        });

        it('deve retornar null se não houver dados', async () => {
            jest.spyOn(cotacaoService, 'buscarHistorico').mockResolvedValue([]);

            const stats = await cotacaoService.calcularEstatisticas('USD-BRL', 5);

            expect(stats).toBeNull();
        });
    });

    describe('calcularDesvioPadrao', () => {
        it('deve calcular desvio padrão corretamente', () => {
            const valores = [2, 4, 4, 4, 5, 5, 7, 9];
            const desvio = cotacaoService.calcularDesvioPadrao(valores);

            expect(desvio).toBeCloseTo(2, 1);
        });

        it('deve retornar 0 para lista com um elemento', () => {
            const desvio = cotacaoService.calcularDesvioPadrao([5]);
            expect(desvio).toBe(0);
        });
    });
});