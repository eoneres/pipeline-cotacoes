/*
  Warnings:

  - You are about to drop the `coleta_logs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `configuracoes` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `cotacoes` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "coleta_logs";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "configuracoes";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "cotacoes";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "Cotacao" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "moeda" TEXT NOT NULL,
    "bid" REAL NOT NULL,
    "ask" REAL NOT NULL,
    "high" REAL NOT NULL,
    "low" REAL NOT NULL,
    "varBid" REAL NOT NULL,
    "pctChange" REAL NOT NULL,
    "timestamp" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ColetaLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "moeda" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "registros" INTEGER NOT NULL DEFAULT 0,
    "error" TEXT,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Configuracao" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "chave" TEXT NOT NULL,
    "valor" TEXT NOT NULL,
    "descricao" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Alerta" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "moeda" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "valor" REAL NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "canal" TEXT NOT NULL,
    "destinatario" TEXT,
    "ultimaNotificacao" DATETIME,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Notificacao" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "alertaId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "mensagem" TEXT NOT NULL,
    "dados" TEXT,
    "status" TEXT NOT NULL,
    "erro" TEXT,
    "enviadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "Cotacao_moeda_timestamp_idx" ON "Cotacao"("moeda", "timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "Cotacao_moeda_timestamp_key" ON "Cotacao"("moeda", "timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "Configuracao_chave_key" ON "Configuracao"("chave");

-- CreateIndex
CREATE INDEX "Alerta_moeda_ativo_idx" ON "Alerta"("moeda", "ativo");

-- CreateIndex
CREATE INDEX "Notificacao_alertaId_idx" ON "Notificacao"("alertaId");
