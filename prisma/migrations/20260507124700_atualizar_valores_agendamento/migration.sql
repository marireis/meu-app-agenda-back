/*
  Warnings:

  - Added the required column `valorTotal` to the `Agendamento` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Agendamento" ADD COLUMN     "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "statusReserva" TEXT NOT NULL DEFAULT 'AGUARDANDO_PAGAMENTO',
ADD COLUMN     "valorPago" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "valorTotal" DOUBLE PRECISION NOT NULL;
