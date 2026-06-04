
import { Router } from 'express';

const router = Router();

// Rota temporária de teste para o Webhook
router.post('/asaas', (req, res) => {
  return res.json({ message: "Webhook do Asaas pronto para receber notificações!" });
});

export default router;