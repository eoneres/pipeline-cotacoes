-- CreateTable
CREATE TABLE "cotacoes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "moeda" TEXT NOT NULL,
    "bid" REAL NOT NULL,
    "ask" REAL NOT NULL,
    "high" REAL NOT NULL,
    "low" REAL NOT NULL,
    "varBid" REAL NOT NULL,
    "pctChange" REAL NOT NULL,
    "timestamp" DATETIME NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "coleta_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "moeda" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "registros" INTEGER NOT NULL DEFAULT 0,
    "error" TEXT,
    "started_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finished_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "configuracoes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "chave" TEXT NOT NULL,
    "valor" TEXT NOT NULL,
    "descricao" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "cotacoes_moeda_timestamp_idx" ON "cotacoes"("moeda", "timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "cotacoes_moeda_timestamp_key" ON "cotacoes"("moeda", "timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "configuracoes_chave_key" ON "configuracoes"("chave");
