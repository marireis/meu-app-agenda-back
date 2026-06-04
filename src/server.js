// src/server.js
import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger.js';
import { errorMiddleware } from './middleware/ErrorMiddleware.js';

import profissionalRoutes from './routes/ProfissionalRoutes.js';
import webhookRoutes from './routes/WebhookRoutes.js';
import empresaRoutes from './routes/EmpresaRoutes.js';
import servicoRoutes from './routes/ServicoRoutes.js';
import horarioRoutes from './routes/HorarioRoutes.js';
import agendamentoRoutes from './routes/AgendamentoRoutes.js';
import authRoutes from './routes/AuthRoutes.js';

const app = express();

app.use('/api/webhooks', webhookRoutes);
// Middlewares globais
app.use(cors());
app.use(express.json());

// Documentação
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Rotas
app.use('/api/empresas', empresaRoutes);
app.use('/api/servicos', servicoRoutes);
app.use('/api/horarios', horarioRoutes);
app.use('/api/agendamentos', agendamentoRoutes);
app.use('/api/auth', authRoutes);

// Middleware de erro (sempre por último)
app.use(errorMiddleware);


const PORTA = process.env.PORT || 3001;
app.listen(PORTA, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORTA}`);
  console.log(`📑 Swagger: http://localhost:${PORTA}/api-docs`);
});

