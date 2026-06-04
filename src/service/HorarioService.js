import { prisma } from '../config/database.js';
import { BaseService } from './BaseService.js';

class HorarioService extends BaseService {
  constructor() {
    super(prisma.horarioFuncionamento);
  }

  // Ajustado para a nova chave composta com profissionalId opcional (global da empresa)
  async configurar(empresaId, data) {
    const { diaSemana, abertura, fechamento, estaAtivo, profissionalId = null } = data;

    return await prisma.horarioFuncionamento.upsert({
      where: {
        empresaId_profissionalId_diaSemana: { 
          empresaId, 
          profissionalId, 
          diaSemana 
        }
      },
      update: { abertura, fechamento, estaAtivo },
      create: { empresaId, profissionalId, diaSemana, abertura, fechamento, estaAtivo }
    });
  }
}

export const horarioService = new HorarioService();