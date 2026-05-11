// src/controller/EmpresaController.js
import { prisma } from '../config/prismaClient.js';

export const EmpresaController = {
  // Adicionado 'next' aqui
  async criar(req, res, next) { 
    const { nome, slug, corPrincipal, descricao } = req.body;
    try {
      const novaEmpresa = await prisma.empresa.create({
        data: { nome, slug, corPrincipal, descricao }
      });
      res.status(201).json(novaEmpresa);
    } catch (error) {
      // Deixa o Middleware de Erro decidir o que responder
      next(error); 
    }
  },

  async buscarPorSlug(req, res, next) {
    try {
      const empresa = await prisma.empresa.findUnique({
        where: { slug: req.params.slug },
        include: { servicos: true, horarios: true }
      });
      
      if (!empresa) {
        // Você pode criar um erro customizado ou passar uma mensagem
        const error = new Error("Empresa não encontrada.");
        error.statusCode = 404;
        return next(error);
      }
      
      res.json(empresa);
    } catch (error) {
      next(error);
    }
  }
};