
import { prisma } from '../config/database.js';

export const ProfissionalController = {
  // Criar um novo profissional atrelado à empresa logada
  async criar(req, res, next) {
    try {
      const { nome, telefone, foto, servicosIds } = req.body;
      const empresaId = req.empresaId; // Capturado pelo authMiddleware

      if (!nome) {
        return res.status(400).json({ erro: "O nome do profissional é obrigatório." });
      }

      // Criação usando Transaction para garantir que o profissional e seus serviços sejam salvos juntos
      const novoProfissional = await prisma.$transaction(async (tx) => {
        const profissional = await tx.profissional.create({
          data: {
            nome,
            telefone,
            foto,
            empresaId
          }
        });

        // Se foram passados serviços, cria os vínculos na tabela intermediária
        if (servicosIds && Array.isArray(servicosIds)) {
          const vinculos = servicosIds.map(servicoId => ({
            profissionalId: profissional.id,
            servicoId
          }));

          await tx.profissionalServico.createMany({
            data: vinculos
          });
        }

        return profissional;
      });

      return res.status(201).json(novoProfissional);
    } catch (error) {
      next(error);
    }
  },

  // Listar todos os profissionais da empresa logada (com seus respectivos serviços)
  async listar(req, res, next) {
    try {
      const empresaId = req.empresaId;

      const profissionais = await prisma.profissional.findMany({
        where: { 
          empresaId,
          estaAtivo: true 
        },
        include: {
          servicos: {
            include: {
              servico: true
            }
          }
        }
      });

      // Formata a resposta para o Front-end receber os serviços de forma mais limpa
      const respostaFormatada = profissionais.map(p => ({
        id: p.id,
        nome: p.nome,
        telefone: p.telefone,
        foto: p.foto,
        servicos: p.servicos.map(s => s.servico)
      }));

      return res.json(respostaFormatada);
    } catch (error) {
      next(error);
    }
  },

  // Novo: Criar um bloqueio na agenda do profissional (Almoço, Folga, etc.)
  async criarBloqueio(req, res, next) {
    try {
      const { profissionalId, descricao, dataInicio, dataFim } = req.body;
      const empresaId = req.empresaId;

      if (!profissionalId || !dataInicio || !dataFim) {
        return res.status(400).json({ erro: "Profissional, data de início e fim são obrigatórios." });
      }

      const bloqueio = await prisma.bloqueioAgenda.create({
        data: {
          descricao,
          dataInicio: new Date(dataInicio),
          dataFim: new Date(dataFim),
          profissionalId,
          empresaId
        }
      });

      return res.status(201).json(bloqueio);
    } catch (error) {
      next(error);
    }
  }
};