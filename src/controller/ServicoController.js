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
  },

  // 3. Atualizar um serviço existente (Alterar nome, preço ou duração)
  async atualizar(req, res) {
    const { id } = req.params; // Pega o ID do serviço que vem na URL
    const { nome, preco, duracao } = req.body; // Pega os novos dados

    try {
      const servicoAtualizado = await prisma.servico.update({
        where: { id: id },
        data: { nome, preco, duracao }
      });
      res.json({ mensagem: "Serviço atualizado com sucesso!", servico: servicoAtualizado });
    } catch (error) {
      console.error("Erro ao atualizar serviço:", error);
      res.status(400).json({ erro: "Erro ao atualizar o serviço. Verifique se o ID está correto." });
    }
  },

  // 4. Deletar um serviço
  async deletar(req, res) {
    const { id } = req.params;

    try {
      await prisma.servico.delete({
        where: { id: id }
      });
      res.json({ mensagem: "Serviço removido com sucesso!" });
    } catch (error) {
      console.error("Erro ao deletar serviço:", error);
      // Dica Educativa: Se o serviço já tiver agendamentos, o banco de dados bloqueia a exclusão
      // para não apagar o histórico de vendas. Por isso esta mensagem personalizada!
      res.status(400).json({ erro: "Não é possível deletar este serviço porque ele já possui agendamentos vinculados." });
    }
  }
};