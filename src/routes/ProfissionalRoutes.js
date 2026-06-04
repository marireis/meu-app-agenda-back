// src/routes/ProfissionalRoutes.js
import { Router } from 'express';
import { ProfissionalController } from '../controller/ProfissionalController.js';
import { authMiddleware } from '../middleware/AuthMiddleware.js';

const router = Router();

// 🔒 Proteção SaaS: Todas as rotas abaixo exigem a "pulseira" JWT no Header da requisição
router.use(authMiddleware);

// Rota para cadastrar um novo profissional e vincular seus serviços de uma vez só
// POST /api/profissionais
router.post('/', ProfissionalController.criar);

// Rota para listar todos os profissionais da empresa logada
// GET /api/profissionais
router.get('/', ProfissionalController.listar);

// Rota para criar um bloqueio administrativo na agenda do profissional (ex: almoço, médico, folga)
// POST /api/profissionais/bloqueios
router.post('/bloqueios', ProfissionalController.criarBloqueio);

export default router;