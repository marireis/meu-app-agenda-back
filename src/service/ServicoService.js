import { prisma } from '../config/database.js';
import { BaseService } from './BaseService.js';

class ServicoService extends BaseService {
  constructor() {
    super(prisma.servico); // Indica que este service opera na tabela servico
  }
}

export const servicoService = new ServicoService();