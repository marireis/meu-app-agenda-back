import { prisma } from '../config/database.js';

export const EmpresaController = {
  async criar(req, res) {
    // Removemos 'corPrincipal' e adicionamos 'endereco'
    const { nome, slug, descricao, logoUrl, endereco } = req.body; 
    
    try {
      const novaEmpresa = await prisma.empresa.create({ 
        data: { 
          nome, 
          slug, 
          descricao, 
          logoUrl, 
          endereco // O Prisma salvará como null se não for enviado
        } 
      });
      res.status(201).json(novaEmpresa);
    } catch (error) {
      // Se o erro for de slug duplicado, mandamos uma mensagem amigável
      if (error.code === 'P2002') {
        return res.status(400).json({ erro: "Este link já está em uso por outra empresa." });
      }
      res.status(400).json({ erro: "Erro ao criar empresa", detalhes: error.message });
    }
  },

  async buscarPorSlug(req, res) {
    const { slug } = req.params;
    try {
      const empresa = await prisma.empresa.findUnique({
        where: { slug },
        include: { 
          servicos: true,
          horarios: true // Importante para o front montar a agenda
        } 
      });
      
      if (!empresa) return res.status(404).json({ erro: "Empresa não encontrada" });
      res.json(empresa);
    } catch (error) {
      res.status(500).json({ erro: "Erro ao buscar empresa" });
    }
  }
};