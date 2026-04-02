describe('Testes Básicos', () => {
    test('Ambiente de teste configurado corretamente', () => {
        expect(process.env.NODE_ENV).toBe('test');
        expect(true).toBe(true);
    });

    test('Express app deve ser inicializável', async () => {
        const express = require('express');
        const app = express();

        app.get('/test', (req, res) => {
            res.json({ ok: true });
        });

        expect(app).toBeDefined();
    });
});