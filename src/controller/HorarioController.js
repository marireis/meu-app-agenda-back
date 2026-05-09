import { prisma } from '../config/database.js';

export const HorarioController = {
  // 1. Configurar (Criar ou Atualizar) os horários de uma empresa em lote
  async configurar(req, res) {
    const { empresaId, horarios } = req.body;
    
    // O ideal é que o front-end envie uma lista (array) com os horários da semana
    if (!empresaId || !horarios || !Array.isArray(horarios)) {
      return res.status(400).json({ erro: "Dados inválidos. Envie o empresaId e um array de horarios." });
    }

    try {
      // Cria uma lista de operações no banco para cada dia da semana enviado
      const operacoes = horarios.map(h => 
        prisma.horarioFuncionamento.upsert({
          where: { 
            // Busca se já existe uma configuração para esta empresa neste dia específico
            empresaId_diaSemana: { empresaId, diaSemana: h.diaSemana } 
          },
          update: { 
            abertura: h.abertura, 
            fechamento: h.fechamento, 
            estaAtivo: h.estaAtivo // Permite "desligar" um dia específico
          },
          create: { 
            diaSemana: h.diaSemana,
            abertura: h.abertura,
            fechamento: h.fechamento,
            estaAtivo: h.estaAtivo,
            empresaId 
          }
        })
      );

      // Executa todas as atualizações de uma vez só no banco de dados
      await Promise.all(operacoes);

      res.json({ mensagem: "Horários configurados com sucesso!" });
    } catch (error) {
      console.error("Erro ao configurar horários:", error);
      res.status(500).json({ erro: "Erro interno ao salvar os horários." });
    }
  },

  // 2. Buscar horários configurados (útil para o painel de configurações do empreendedor)
  async listarPorEmpresa(req, res) {
    const { empresaId } = req.params;

    try {
      const horarios = await prisma.horarioFuncionamento.findMany({
        where: { empresaId },
        orderBy: { diaSemana: 'asc' } // Garante que a lista venha ordenada de Domingo(0) a Sábado(6)
      });
      res.json(horarios);
    } catch (error) {
      res.status(500).json({ erro: "Erro ao buscar horários." });
    }
  }
};