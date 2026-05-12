import { prisma } from '../config/database.js';
import { BaseService } from './BaseService.js';

class HorarioService extends BaseService {
  constructor() {
    super(prisma.horarioFuncionamento);
  }

  // Sobrescreve o create para usar upsert — regra: um registro por dia por empresa
  async configurar(empresaId, data) {
    const { diaSemana, abertura, fechamento, estaAtivo } = data;

    return await prisma.horarioFuncionamento.upsert({
      where: {
        // Chave única composta no schema do Prisma: @@unique([empresaId, diaSemana])
        empresaId_diaSemana: { empresaId, diaSemana }
      },
      update: { abertura, fechamento, estaAtivo },
      create: { empresaId, diaSemana, abertura, fechamento, estaAtivo }
    });
  }
}

export const horarioService = new HorarioService();