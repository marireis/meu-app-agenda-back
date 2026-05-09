import { Router } from 'express';

import { EmpresaController } from '../controller/EmpresaController.js'; 

const router = Router();

router.post('/empresas', EmpresaController.criar);
router.get('/empresas/:slug', EmpresaController.buscarPorSlug);

export default router;