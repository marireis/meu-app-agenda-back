import { prisma } from '../config/database.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';


const JWT_SECRET = process.env.JWT_SECRET;

export const AuthController = {
  
  async login(req, res) {
    const { slug, senha } = req.body;

    if (!JWT_SECRET) {
      console.error("ERRO CRÍTICO: JWT_SECRET não configurado no .env");
      return res.status(500).json({ erro: "Erro interno de configuração de segurança." });
    }

    if (!slug || !senha) {
      return res.status(400).json({ erro: "Por favor, informe o link (slug) e a senha." });
    }

    try {
      // 1. Procurar a empresa no banco de dados
      const empresa = await prisma.empresa.findUnique({ where: { slug } });

      if (!empresa) {
        return res.status(401).json({ erro: "Empresa não encontrada ou credenciais inválidas." });
      }

      // 2. Verificar se a senha está correta
      // Como ainda não criptografámos senhas antigas, vamos fazer uma verificação dupla (texto puro ou criptografada)
      const senhaValida = await bcrypt.compare(senha, empresa.senhaAdmin) || senha === empresa.senhaAdmin;

      if (!senhaValida) {
        return res.status(401).json({ erro: "Senha incorreta." });
      }

      // 3. Criar a "pulseira VIP" (Token JWT)
      const token = jwt.sign(
        { empresaId: empresa.id, slug: empresa.slug }, // Dados guardados dentro do token
        JWT_SECRET, 
        { expiresIn: '7d' } // A pulseira é válida por 7 dias
      );

      // 4. Retornar o token para o Front-end
      res.json({
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
      res.status(500).json({ erro: "Erro interno ao processar o login." });
    }
  }
};