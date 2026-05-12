import { servicoService } from '../service/ServicoService.js';
import { criarServicoSchema, atualizarServicoSchema } from '../validato/ServicoSchemaValidation.js';

export const ServicoController = {
 async listar(req, res) {
    try {
      const servicos = await servicoService.findAll(req.empresaId);
      return res.json(servicos);
    } catch (error) {
      return res.status(500).json({ erro: error.message });
    }
  },

  async criar(req, res) {
    // Validação com Zod
    const resultado = criarServicoSchema.safeParse(req.body);
    if (!resultado.success) {
      return res.status(400).json({ erro: resultado.error.flatten().fieldErrors });
    }

    try {
      // empresaId vem do token — nunca do body (segurança multi-tenant)
      const novo = await servicoService.create(req.empresaId, resultado.data);
      return res.status(201).json(novo);
    } catch (error) {
      return res.status(400).json({ erro: error.message });
    }
  },

  async atualizar(req, res) {
    const resultado = atualizarServicoSchema.safeParse(req.body);
    if (!resultado.success) {
      return res.status(400).json({ erro: resultado.error.flatten().fieldErrors });
    }

    try {
      const atualizado = await servicoService.update(
        req.params.id,
        req.empresaId,
        resultado.data
      );
      return res.json({ mensagem: "Serviço atualizado!", servico: atualizado });
    } catch (error) {
      return res.status(error.status || 400).json({ erro: error.message });
    }
  },

  async deletar(req, res) {
    try {
      await servicoService.delete(req.params.id, req.empresaId);
      return res.json({ mensagem: "Serviço removido com sucesso!" });
    } catch (error) {
      return res.status(error.status || 400).json({ erro: error.message });
    }
  }
};