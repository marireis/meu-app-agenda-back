// src/routes/AgendamentoRoutes.js
import { Router } from 'express';
import { AgendamentoController } from '../controller/AgendamentoController.js';
import { authMiddleware } from '../middleware/AuthMiddleware.js';

const router = Router();

// Rota pública de consulta (Parâmetro de slug na URL)
router.get('/:slug/disponibilidade', AgendamentoController.listarDisponibilidade);

// Rota pública para criar o agendamento
router.post('/', AgendamentoController.criar);

// Rota pública para receber o Webhook do Asaas (Sem authMiddleware!)
router.post('/webhook/asaas', AgendamentoController.webhookAsaas);

// Rota Administrativa Protegida (Exige a pulseira JWT no Header)
router.get('/admin/agenda', authMiddleware, AgendamentoController.listarAgendaDoDia);

export default router;