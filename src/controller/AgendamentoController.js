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
  const { clienteNome, clienteEmail, clienteCpf, dataHora, empresaId, servicoId } = req.body;

  try {
    // 1. Validação básica: verifica se todos os campos vieram na requisição
    if (!clienteNome || !clienteCpf || !dataHora || !servicoId) {
       return res.status(400).json({ erro: "Campos obrigatórios ausentes no corpo da requisição." });
    }

    // 2. Busca o preço real do serviço
    const servico = await prisma.servico.findUnique({ where: { id: servicoId } });
    if (!servico) {
      return res.status(404).json({ erro: "Serviço não encontrado no banco de dados." });
    }

    const valorTotal = servico.preco;

    // 3. Chamada ao Asaas (Ponto crítico de erro)
    let dadosPix;
    try {
      dadosPix = await AsaasService.gerarCobrancaPix(clienteNome, clienteCpf, valorTotal);
    } catch (asaasError) {
      console.error("❌ Erro na Integração Asaas:", asaasError.message);
      return res.status(424).json({ 
        erro: "Falha na comunicação com o provedor de pagamento.", 
        detalhes: asaasError.message 
      });
    }

    // 4. Criação no Prisma
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
        asaasPaymentId: dadosPix.asaasPaymentId
      }
    });

    res.status(201).json({ 
      mensagem: "Horário reservado! Efetue o pagamento.", 
      agendamentoId: novoAgendamento.id,
      pix: {
        copiaECola: dadosPix.payload,
        qrCodeBase64: dadosPix.encodedImage
      }
    });

  } catch (error) {
    // Esse log no console é fundamental para você ler o erro real no terminal
    console.error("❌ Erro Completo no Controller:", error);
    
    res.status(500).json({ 
      erro: "Erro interno ao processar agendamento.",
      mensagem: error.message // Temporariamente exibindo para debug
    });
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
  },

  // NOVA FUNÇÃO: Visão do Administrador
  async listarAgendaDoDia(req, res) {
    const empresaId = req.empresaId; // ← vem do token
    const { data } = req.query;      // ← só a data vem da URL

    if (!empresaId || !data) {
      return res.status(400).json({ erro: " data são obrigatórios." });
    }

    try {
      const agenda = await prisma.agendamento.findMany({
        where: {
          empresaId: empresaId,
          dataHora: {
            // Filtra agendamentos entre o início e o fim do dia escolhido
            gte: new Date(`${data}T00:00:00Z`),
            lte: new Date(`${data}T23:59:59Z`)
          }
        },
        include: {
          servico: true // Traz os detalhes do serviço (nome, preço, duração)
        },
        orderBy: {
          dataHora: 'asc' // Ordena do horário mais cedo para o mais tarde
        }
      });

      res.json(agenda);
    } catch (error) {
      console.error("Erro ao listar agenda:", error);
      res.status(500).json({ erro: "Erro ao buscar a agenda do dia." });
    }
  }
  
};

