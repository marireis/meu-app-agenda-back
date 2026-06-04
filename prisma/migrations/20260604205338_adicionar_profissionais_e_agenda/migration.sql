/*
  Warnings:

  - A unique constraint covering the columns `[empresaId,profissionalId,diaSemana]` on the table `horarios_funcionamento` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `dataHoraFim` to the `agendamentos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `profissionalId` to the `agendamentos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `valorSinal` to the `agendamentos` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "agendamentos" DROP CONSTRAINT "agendamentos_empresaId_fkey";

-- DropForeignKey
ALTER TABLE "horarios_funcionamento" DROP CONSTRAINT "horarios_funcionamento_empresaId_fkey";

-- DropForeignKey
ALTER TABLE "servicos" DROP CONSTRAINT "servicos_empresaId_fkey";

-- DropIndex
DROP INDEX "horarios_funcionamento_empresaId_diaSemana_key";

-- AlterTable
ALTER TABLE "agendamentos" ADD COLUMN     "dataHoraFim" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "profissionalId" TEXT NOT NULL,
ADD COLUMN     "valorSinal" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "empresas" ADD COLUMN     "statusSaaS" TEXT NOT NULL DEFAULT 'ATIVO';

-- AlterTable
ALTER TABLE "horarios_funcionamento" ADD COLUMN     "profissionalId" TEXT;

-- CreateTable
CREATE TABLE "profissionais" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT,
    "telefone" TEXT,
    "foto" TEXT,
    "estaAtivo" BOOLEAN NOT NULL DEFAULT true,
    "empresaId" TEXT NOT NULL,

    CONSTRAINT "profissionais_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profissional_servicos" (
    "profissionalId" TEXT NOT NULL,
    "servicoId" TEXT NOT NULL,

    CONSTRAINT "profissional_servicos_pkey" PRIMARY KEY ("profissionalId","servicoId")
);

-- CreateTable
CREATE TABLE "bloqueios_agenda" (
    "id" TEXT NOT NULL,
    "descricao" TEXT,
    "dataInicio" TIMESTAMP(3) NOT NULL,
    "dataFim" TIMESTAMP(3) NOT NULL,
    "empresaId" TEXT NOT NULL,
    "profissionalId" TEXT NOT NULL,

    CONSTRAINT "bloqueios_agenda_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "horarios_funcionamento_empresaId_profissionalId_diaSemana_key" ON "horarios_funcionamento"("empresaId", "profissionalId", "diaSemana");

-- AddForeignKey
ALTER TABLE "servicos" ADD CONSTRAINT "servicos_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profissionais" ADD CONSTRAINT "profissionais_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profissional_servicos" ADD CONSTRAINT "profissional_servicos_profissionalId_fkey" FOREIGN KEY ("profissionalId") REFERENCES "profissionais"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profissional_servicos" ADD CONSTRAINT "profissional_servicos_servicoId_fkey" FOREIGN KEY ("servicoId") REFERENCES "servicos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "horarios_funcionamento" ADD CONSTRAINT "horarios_funcionamento_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "horarios_funcionamento" ADD CONSTRAINT "horarios_funcionamento_profissionalId_fkey" FOREIGN KEY ("profissionalId") REFERENCES "profissionais"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bloqueios_agenda" ADD CONSTRAINT "bloqueios_agenda_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bloqueios_agenda" ADD CONSTRAINT "bloqueios_agenda_profissionalId_fkey" FOREIGN KEY ("profissionalId") REFERENCES "profissionais"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agendamentos" ADD CONSTRAINT "agendamentos_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agendamentos" ADD CONSTRAINT "agendamentos_profissionalId_fkey" FOREIGN KEY ("profissionalId") REFERENCES "profissionais"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
