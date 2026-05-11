import { servicoService } from '../service/ServicoService.js';

export const ServicoController = {
  // Lista serviços APENAS da empresa logada
  async listar(req, res) {
    try {
      // req.empresaId vem do authMiddleware
      const servicos = await servicoService.findAll(req.empresaId);
      return res.json(servicos);
    } catch (error) {
      return res.status(500).json({ erro: error.message });
    }
  },

  async criar(req, res) {
    try {
      // O Service vincula automaticamente ao empresaId do token
      const novo = await servicoService.create(req.empresaId, req.body);
      return res.status(201).json(novo);
    } catch (error) {
      return res.status(400).json({ erro: error.message });
    }
  },

  async atualizar(req, res) {
    const { id } = req.params;
    try {
      // A BaseService garante que você só edita o que é seu
      const atualizado = await servicoService.update(id, req.empresaId, req.body);
      return res.json({ mensagem: "Serviço atualizado!", servico: atualizado });
    } catch (error) {
      return res.status(error.status || 400).json({ erro: error.message });
    }
  },

  async deletar(req, res) {
    const { id } = req.params;
    try {
      await servicoService.delete(id, req.empresaId);
      return res.json({ mensagem: "Serviço removido com sucesso!" });
    } catch (error) {
      return res.status(400).json({ erro: "Erro ao deletar: serviço pode ter agendamentos vinculados." });
    }
  }
};