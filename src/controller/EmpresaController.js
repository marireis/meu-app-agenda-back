
import { prisma } from '../config/prismaClient.js';
import bcrypt from 'bcryptjs';
import { criarEmpresaSchema } from '../validato/EmpresaSchema.js';


export const EmpresaController = {
  async criar(req, res, next) {
    
    // Validação completa com Zod
    const resultado = criarEmpresaSchema.safeParse(req.body);
    if (!resultado.success) {
      return res.status(400).json({
        erro: "Dados inválidos",
        detalhes: resultado.error.flatten().fieldErrors
      });
    }

    const { nome, slug, email, senha, documento, telefone, corPrincipal, descricao } = resultado.data;

    try {
      const senhaHash = await bcrypt.hash(senha, 10);

      const novaEmpresa = await prisma.empresa.create({
        data: {
          nome,
          slug,
          email,
          senhaAdmin: senhaHash,
          documento,
          telefone,
          corPrincipal,
          descricao
        }
      });

      // Nunca retorna a senha
      const { senhaAdmin, ...empresaSemSenha } = novaEmpresa;
      return res.status(201).json(empresaSemSenha);

    } catch (error) {
      // Trata erro de campos únicos duplicados (slug, email, documento)
      if (error.code === 'P2002') {
        const campo = error.meta?.target?.[0] || 'campo';
        return res.status(409).json({
          erro: `Este ${campo} já está cadastrado.`
        });
      }
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
        const error = new Error("Empresa não encontrada.");
        error.statusCode = 404;
        return next(error);
      }

      const { senhaAdmin, documento, ...empresaSemSenha } = empresa;
      return res.json(empresaSemSenha);

    } catch (error) {
      next(error);
    }
  }
};