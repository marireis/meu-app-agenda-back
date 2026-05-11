import { Router } from 'express';
import { ServicoController } from '../controller/ServicoController.js';
import { authMiddleware } from '../middleware/AuthMiddleware.js';

const router = Router();

router.post('/', ServicoController.criar);
router.get('/:empresaId', ServicoController.listar);
router.put('/:id', authMiddleware, ServicoController.atualizar);
router.delete('/:id', authMiddleware, ServicoController.deletar);

export default router;