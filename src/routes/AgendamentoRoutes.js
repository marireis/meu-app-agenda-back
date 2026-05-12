import { Router } from 'express';
import { AgendamentoController } from '../controller/AgendamentoController.js';
import { authMiddleware } from '../middleware/AuthMiddleware.js';

const router = Router();

// Acessível em: GET /api/agendamentos/disponibilidade
router.get('/disponibilidade', AgendamentoController.listarDisponibilidade);

// Acessível em: POST /api/agendamentos
// (O '/' aqui se soma ao '/api/agendamentos' do server.js)
router.post('/', AgendamentoController.criar);

// Acessível em: POST /api/agendamentos/webhook/asaas
router.post('/webhook/asaas', AgendamentoController.webhookAsaas);

// Acessível em: GET /api/agendamentos/admin/agenda
router.get('/admin/agenda', authMiddleware, AgendamentoController.listarAgendaDoDia);

export default router;