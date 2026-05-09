import { Router } from 'express';
import { AgendamentoController } from '../controller/AgendamentoController.js';

const router = Router();

router.get('/disponibilidade', AgendamentoController.listarDisponibilidade);
router.post('/agendamentos', AgendamentoController.criar);

export default router;