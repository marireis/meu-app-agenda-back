import { AgendamentoService } from '../service/AgendamentoService.js';
import { prisma } from '../config/database.js'; // Adicionamos a importação do Prisma aqui
import { AsaasService } from '../service/AsaasService.js'; // Importe o serviço do Asaas

export const AgendamentoController = {
  
  async listarDisponibilidade(req, res) {
    const { empresaId, data, servicoId } = req.query; 

    if (!empresaId || !data || !servicoId) {
      return res.status(400).json({ erro: "Faltam parâmetros na busca." });
    }

    try {
      const livres = await AgendamentoService.buscarDisponibilidade(empresaId, data, servicoId);
      res.json(livres);
    } catch (error) {
      res.status(500).json({ erro: "Erro ao buscar disponibilidade", detalhes: error.message });
    }
  },

  // NOVA FUNÇÃO: Criar a reserva no banco de dados
  async criar(req, res) {
    const { clienteNome, clienteEmail, clienteCpf, dataHora, valorTotal, empresaId, servicoId } = req.body;

    try {
      // 1. Gera a cobrança Pix de 50% via Asaas
      const dadosPix = await AsaasService.gerarCobrancaPix(clienteNome, clienteCpf, valorTotal);

      // 2. Cria a reserva no banco de dados com o ID do Asaas
      const novoAgendamento = await prisma.agendamento.create({
        data: {
          clienteNome,
          clienteEmail,
          clienteCpf,
          dataHora: new Date(dataHora),
          valorTotal,
          empresaId,
          servicoId,
          statusReserva: "AGUARDANDO_PAGAMENTO",
          statusPagamento: "PENDENTE",
          asaasPaymentId: dadosPix.asaasPaymentId // Guardamos o ID para atualizar depois!
        }
      });

      // 3. Retorna o sucesso e os dados do PIX para o Front-end exibir a tela de pagamento
      res.status(201).json({ 
        mensagem: "Horário reservado por 10 minutos! Efetue o pagamento para confirmar.", 
        agendamentoId: novoAgendamento.id,
        pix: {
          copiaECola: dadosPix.payload,
          qrCodeBase64: dadosPix.encodedImage
        }
      });
    } catch (error) {
      console.error("Erro ao criar agendamento:", error);
      res.status(400).json({ erro: "Erro ao processar a reserva. Verifique a integração com o financeiro." });
    }
  },

  // NOVA FUNÇÃO: Receber o aviso de pagamento do Asaas
  async webhookAsaas(req, res) {
    // O Asaas envia um objeto grande, mas só precisamos saber qual foi o "evento" e os dados do "pagamento"
    const { event, payment } = req.body;

    // Queremos ouvir apenas os eventos de pagamento recebido/confirmado
    if (event === 'PAYMENT_RECEIVED' || event === 'PAYMENT_CONFIRMED') {
      try {
        // Vai ao banco de dados, procura a reserva que tem este ID do Asaas e atualiza!
        await prisma.agendamento.update({
          where: { asaasPaymentId: payment.id }, 
          data: {
            statusReserva: 'CONFIRMADO',
            statusPagamento: 'PAGO'
          }
        });
        
        console.log(`✅ SUCESSO: O pagamento ${payment.id} foi confirmado e a reserva está garantida!`);
      } catch (error) {
        // Se der erro (ex: não achou o ID no banco), o catch não deixa o servidor cair
        console.error("❌ Erro ao atualizar a reserva via webhook:", error);
      }
    }

    // REGRA DE OURO DOS WEBHOOKS: Temos que responder com "200 OK" super rápido, 
    // senão o Asaas acha que o nosso servidor está offline e fica tentando enviar de novo.
    res.status(200).send('Webhook Recebido');
  }
  
};

