import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger.js'; 
import { prisma } from "./config/prismaClient.js";
import { errorMiddleware } from './middleware/errorMiddleware.js';
import { ServicoController } from './controller/ServicoController.js';
import { HorarioController } from './controller/HorarioController.js';
import { AgendamentoController } from './controller/AgendamentoController.js';
import { AuthController } from './controller/AuthController.js';
import { authMiddleware } from './middleware/authMiddleware.js';


const app = express();


// Middlewares Globais (Configurações de segurança e formato de dados)
app.use(cors()); // Permite que o seu React (Front-end) converse com esta API
app.use(express.json()); // Diz para o Express entender dados no formato JSON

// Rota da Documentação - Unificada para evitar erros de declaração
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.post('/api/servicos', ServicoController.criar);
app.put('/api/servicos/:id', authMiddleware, ServicoController.atualizar); 
app.delete('/api/servicos/:id', authMiddleware, ServicoController.deletar);
app.get('/api/servicos/:empresaId', ServicoController.listarPorEmpresa);
// Rotas de Agenda (O Empreendedor configurando seus horários de trabalho)
app.put('/api/horarios', HorarioController.configurar);
app.get('/api/horarios/:empresaId', HorarioController.listarPorEmpresa);
// Rotas de Agendamento
app.get('/api/disponibilidade', AgendamentoController.listarDisponibilidade);
app.post('/api/agendamentos', AgendamentoController.criar); 
// Rota do Webhook (O "Telefone" do Asaas)
app.post('/api/webhook/asaas', AgendamentoController.webhookAsaas);
// Autenticação
app.post('/api/auth/login', AuthController.login);
// Antes estava assim:
// app.get('/api/admin/agenda', AgendamentoController.listarAgendaDoDia);

// Agora fica assim (O Segurança vem antes do Controller):
app.get('/api/admin/agenda', authMiddleware, AgendamentoController.listarAgendaDoDia);

// O Middleware de Erro deve ser SEMPRE o último antes do app.listen
app.use(errorMiddleware);


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

const PORTA = process.env.PORT || 3001;
app.listen(PORTA, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORTA}`);
  console.log(`📑 Swagger: http://localhost:${PORTA}/api-docs`);
});