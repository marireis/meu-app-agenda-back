import { prisma } from '../config/database.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

export const AuthController = {
  async login(req, res) {
    const { slug, senha } = req.body;

    // Validação de configuração de ambiente
    if (!JWT_SECRET) {
      console.error("ERRO CRÍTICO: JWT_SECRET não configurado.");
      return res.status(500).json({ erro: "Erro de configuração do servidor." });
    }

    if (!slug || !senha) {
      return res.status(400).json({ erro: "Link (slug) e senha são obrigatórios." });
    }

    try {
      const empresa = await prisma.empresa.findUnique({ where: { slug } });

      if (!empresa) {
        return res.status(401).json({ erro: "Credenciais inválidas." });
      }

      // SEGURANÇA: Comparação rigorosa com Bcrypt. 
      // Removida a verificação de texto puro para evitar vulnerabilidades.
      const senhaValida = await bcrypt.compare(senha, empresa.senhaAdmin);

      if (!senhaValida) {
        return res.status(401).json({ erro: "Credenciais inválidas." });
      }

      // PAYLOAD: Informações essenciais para o Multi-tenancy
      const token = jwt.sign(
        { 
          empresaId: empresa.id, 
          slug: empresa.slug,
          role: 'ADMIN' // Útil para middlewares de permissão futuros
        }, 
        JWT_SECRET, 
        { expiresIn: '7d' } 
      );

      return res.json({
        mensagem: "Login efetuado com sucesso!",
        token,
        empresa: {
          id: empresa.id,
          nome: empresa.nome,
          slug: empresa.slug
        }
      });

    } catch (error) {
      console.error("Erro no login:", error);
      return res.status(500).json({ erro: "Erro interno ao processar o login." });
    }
  }
};