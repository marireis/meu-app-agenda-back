import { Router } from 'express';
import { EmpresaController } from '../controller/EmpresaController.js';
import { prisma } from '../config/database.js'; // ou '../config/prismaClient.js'

const router = Router();

// Rota para cadastrar empresa (POST /api/empresas)
router.post('/', EmpresaController.criar);

// CORREÇÃO: Esta rota deve escutar o parâmetro :slug (GET /api/empresas/salao-bella)
router.get('/:slug', EmpresaController.buscarPorSlug);

// Rota pública dos profissionais
router.get('/:slug/profissionais-publicos', async (req, res, next) => {
  try {
    const { slug } = req.params;
    const profissionais = await prisma.profissional.findMany({
      where: { empresa: { slug }, estaAtivo: true },
      select: { id: true, nome: true }
    });
    return res.json(profissionais);
  } catch (error) {
    next(error);
  }
});

export default router;