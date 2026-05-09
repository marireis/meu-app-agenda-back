import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

// Inicializa o Prisma e o Express
const prisma = new PrismaClient();
const app = express();

// Middlewares Globais (Configurações de segurança e formato de dados)
app.use(cors()); // Permite que o seu React (Front-end) converse com esta API
app.use(express.json()); // Diz para o Express entender dados no formato JSON

// ==============================================================================
// ROTAS DE CONFIGURAÇÃO (ADMIN - O Empreendedor configurando sua loja)
// ==============================================================================

// 1. Criar uma nova Empresa (Signup do Microempreendedor)
app.post('/api/empresas', async (req, res) => {
  const { nome, slug, corPrincipal, descricao } = req.body;
  try {
    const novaEmpresa = await prisma.empresa.create({
      data: { nome, slug, corPrincipal, descricao }
    });
    res.status(201).json(novaEmpresa);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: "Esse link (slug) já está em uso ou os dados são inválidos." });
  }
});

// ==============================================================================
// ROTAS PÚBLICAS (CLIENTE FINAL - O cliente acessando o link do salão)
// ==============================================================================

// 2. Buscar a página da empresa pelo link (Ex: /api/config/bellamarina)
// É esta rota que o seu Front-end vai chamar quando o cliente abrir a página!
app.get('/api/config/:slug', async (req, res) => {
  try {
    const empresa = await prisma.empresa.findUnique({
      where: { slug: req.params.slug }, // Busca pelo nome na URL
      include: { 
        servicos: true, 
        horarios: true 
      } // Já traz os serviços e horários daquele salão específico
    });

    if (!empresa) {
      return res.status(404).json({ error: "Empresa não encontrada. Verifique o link." });
    }

    res.json(empresa);
  } catch (error) {
  console.error("ERRO DETALHADO DO PRISMA:", error); // Isso vai mostrar o erro no terminal
  res.status(500).json({ error: "Erro interno ao buscar a empresa." });
}
});

// Inicialização do Servidor
const PORTA = process.env.PORT || 3001;
app.listen(PORTA, () => {
  console.log(`🚀 Servidor SaaS rodando na porta ${PORTA}`);
  console.log(`🌐 Teste a rota: http://localhost:${PORTA}/api/config/SEU-SLUG`);
});