// src/controller/AuthController.js
import { prisma } from '../config/prismaClient.js'; // ou '../config/database.js' ajuste conforme seu projeto
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const AuthController = {
  async login(req, res, next) {
    try {
      const { email, senha } = req.body;

      // 1. Validação básica de entrada
      if (!email || !senha) {
        return res.status(400).json({ erro: "E-mail e senha são obrigatórios." });
      }

      // 2. Busca a empresa administradora pelo e-mail
      const empresa = await prisma.empresa.findUnique({
        where: { email }
      });

      if (!empresa) {
        return res.status(401).json({ erro: "E-mail ou senha incorretos." });
      }

      // 3. Valida a senha criptografada
      const senhaValida = await bcrypt.compare(senha, empresa.senhaAdmin);

      if (!senhaValida) {
        return res.status(401).json({ erro: "E-mail ou senha incorretos." });
      }

      // 4. Verifica se a conta SaaS não está bloqueada/suspensa
      if (empresa.statusSaaS !== 'ATIVO' && empresa.statusSaaS !== 'DEGUSTACAO') {
        return res.status(403).json({ erro: "Acesso bloqueado. Entre em contato com o suporte do SaaS." });
      }

      // 5. Gera o Token JWT contendo o ID da empresa no Payload (A mágica do Multi-tenant)
      const token = jwt.sign(
        { 
          empresaId: empresa.id,
          nome: empresa.nome,
          slug: empresa.slug
        },
        process.env.JWT_SECRET,
        { expiresIn: '1d' } // Token expira em 1 dia
      );

      // 6. Retorna o token e os dados públicos da empresa
      return res.json({
        token,
        empresa: {
          id: empresa.id,
          nome: empresa.nome,
          slug: empresa.slug,
          email: empresa.email
        }
      });

    } catch (error) {
      next(error);
    }
  }
};