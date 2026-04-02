const { PrismaClient } = require('@prisma/client');
const logger = require('./logger');

// Singleton para o Prisma Client
let prisma;

function getPrismaClient() {
    if (!prisma) {
        prisma = new PrismaClient({
            log: process.env.NODE_ENV === 'development'
                ? ['query', 'info', 'warn', 'error']
                : ['error'],
            errorFormat: 'pretty'
        });

        logger.info('✅ Prisma Client inicializado');
    }

    return prisma;
}

// Função para desconectar
async function disconnectPrisma() {
    if (prisma) {
        await prisma.$disconnect();
        logger.info('🔌 Prisma Client desconectado');
    }
}

module.exports = {
    prisma: getPrismaClient(),
    disconnectPrisma
};