import { Router } from 'express';
import { HorarioController } from '../controller/HorarioController.js';

const router = Router();

router.put('/', HorarioController.configurar);
router.get('/:empresaId', HorarioController.listarPorEmpresa);

export default router;