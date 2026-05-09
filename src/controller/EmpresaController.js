import { prisma } from '../config/database.js';

export const EmpresaController = {
  async criar(req, res) {
    const { nome, slug, descricao, logoUrl, corPrincipal } = req.body;
    try {
      const novaEmpresa = await prisma.empresa.create({ 
        data: { nome, slug, descricao, logoUrl, corPrincipal } 
      });
      res.json(novaEmpresa);
    } catch (error) {
      res.status(400).json({ erro: "Erro ao criar empresa", detalhes: error.message });
    }
  },

  async buscarPorSlug(req, res) {
    const { slug } = req.params;
    try {
      const empresa = await prisma.empresa.findUnique({
        where: { slug },
        include: { servicos: true } // Já traz os serviços para a página
      });
      if (!empresa) return res.status(404).json({ erro: "Empresa não encontrada" });
      res.json(empresa);
    } catch (error) {
      res.status(500).json({ erro: "Erro ao buscar empresa" });
    }
  }
};