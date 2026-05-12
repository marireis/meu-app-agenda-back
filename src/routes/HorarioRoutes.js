// src/routes/HorarioRoutes.js
import { Router } from 'express';
import { HorarioController } from '../controller/HorarioController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

// Todas as rotas de horário exigem autenticação
router.use(authMiddleware);

router.get('/', HorarioController.listar);
router.put('/', HorarioController.configurar);

export default router;