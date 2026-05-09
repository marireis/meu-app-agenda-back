import { prisma } from '../config/database.js';
import { AgendamentoService } from '../service/AgendamentoService.js';

export const AgendamentoController = {
  async listarDisponibilidade(req, res) {
    const { data, empresaId } = req.query;
    try {
      const livres = await AgendamentoService.buscarDisponibilidade(empresaId, data);
      res.json(livres);
    } catch (error) {
      res.status(500).json({ erro: "Erro ao buscar disponibilidade" });
    }
  },

  async criar(req, res) {
    const { clienteNome, clienteEmail, clienteCpf, dataHora, empresaId, servicoId, valorTotal } = req.body;
    const dataDesejada = new Date(dataHora);

    try {
      const conflito = await AgendamentoService.verificarConflito(empresaId, dataDesejada);
      if (conflito) return res.status(400).json({ erro: "Horário ocupado." });

      const novoAgendamento = await prisma.agendamento.create({
        data: {
          clienteNome,
          clienteEmail, // Adicionado conforme o schema
          clienteCpf,   // Adicionado conforme o schema
          dataHora: dataDesejada,
          empresaId,
          servicoId,    // Adicionado conforme o schema
          valorTotal,
          valorPago: 0,
          statusReserva: "AGUARDANDO_PAGAMENTO",
          statusPagamento: "PENDENTE"
        }
      });

      // LÓGICA DO ASAAS (Simulada por enquanto)
      // Aqui você chamaria uma função: await AsaasService.gerarCobranca(novoAgendamento)
      
      res.json({
        mensagem: "Reservado! Pague o sinal.",
        reservaId: novoAgendamento.id,
        pixCopiaECola: "00020101021226102...PIX_REAL_ASAAS", 
        expiraEm: "10 minutos"
      });
    } catch (error) {
      res.status(400).json({ erro: "Erro ao processar reserva", detalhes: error.message });
    }
  }
};