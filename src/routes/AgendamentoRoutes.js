import { Router } from 'express';
import { AgendamentoController } from '../controller/AgendamentoController.js';
import { authMiddleware } from '../middleware/AuthMiddleware.js';

const router = Router();

router.get('/disponibilidade', AgendamentoController.listarDisponibilidade);
router.post('/', AgendamentoController.criar);
router.post('/webhook/asaas', AgendamentoController.webhookAsaas);
router.get('/admin/agenda', authMiddleware, AgendamentoController.listarAgendaDoDia);

export default router;