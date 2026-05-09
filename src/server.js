import express from 'express';
import 'dotenv/config';
import empresaRoutes from './routes/EmpresaRoutes.js';
import agendamentoRoutes from './routes/AgendamentoRoutes.js';


const app = express();
app.use(express.json());

// Uso das Rotas
app.use('/api', empresaRoutes);
app.use('/api', agendamentoRoutes);

const PORTA = process.env.PORT || 3000;
app.listen(PORTA, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORTA}`);
});