import { prisma } from '../config/database.js';

export const ServicoController = {
  // 1. Criar um novo serviço
  async criar(req, res) {
    // Recebemos os dados que o empreendedor preencheu no Front-end
    const { nome, preco, duracao, empresaId } = req.body;

    try {
      const novoServico = await prisma.servico.create({
        data: { 
          nome, 
          preco, 
          duracao, // Duração em minutos (ex: 30, 60, 90). Crucial para a agenda!
          empresaId // Precisamos saber de qual empresa é este serviço
        }
      });
      res.status(201).json(novoServico);
    } catch (error) {
      console.error("Erro ao criar serviço:", error);
      res.status(400).json({ erro: "Erro ao criar o serviço. Verifique os dados." });
    }
  },

  // 2. Listar todos os serviços de uma empresa específica
  async listarPorEmpresa(req, res) {
    const { empresaId } = req.params;

    try {
      const servicos = await prisma.servico.findMany({
        where: { empresaId }
      });
      res.json(servicos);
    } catch (error) {
      res.status(500).json({ erro: "Erro ao buscar serviços." });
    }
  }
};