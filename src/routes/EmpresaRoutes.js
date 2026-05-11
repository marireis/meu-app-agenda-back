import { Router } from 'express';
import { EmpresaController } from '../controller/EmpresaController.js';

const router = Router();

router.post('/', EmpresaController.criar);
router.get('/:slug', EmpresaController.buscarPorSlug);

export default router;