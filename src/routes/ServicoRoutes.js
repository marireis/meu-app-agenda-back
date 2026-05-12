import { Router } from 'express';
import { ServicoController } from '../controller/ServicoController.js';
import { authMiddleware } from '../middleware/AuthMiddleware.js';

const router = Router();

router.use(authMiddleware); // ← aplica em todas as rotas de uma vez

router.get('/', ServicoController.listar);
router.post('/', ServicoController.criar);
router.put('/:id', ServicoController.atualizar);
router.delete('/:id', ServicoController.deletar);

export default router;