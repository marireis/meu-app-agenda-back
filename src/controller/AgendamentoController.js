// src/controller/AgendamentoController.js
import { prisma } from '../config/database.js';
import { AgendamentoService } from '../service/AgendamentoService.js';
import axios from 'axios';

export const AgendamentoController = {
  
  /**
   * 1. LISTAR DISPONIBILIDADE (Público)
   * GET /api/agendamentos/:slug/disponibilidade?data=YYYY-MM-DD&servicoId=...&profissionalId=...
   */
  async listarDisponibilidade(req, res, next) {
    try {
      const { slug } = req.params;
      const { data, servicoId, profesionalId } = req.query; // profissionalId recebido da tela

      if (!data || !servicoId || !profesionalId) {
        return res.status(400).json({ erro: "Parâmetros 'data', 'servicoId' e 'profissionalId' são obrigatórios." });
      }

      // Encontra a empresa dona da agenda através do slug da URL
      const empresa = await prisma.empresa.findUnique({ where: { slug } });
      if (!empresa) return res.status(404).json({ erro: "Empresa não encontrada." });

      // Chama o motor de agenda configurado na etapa anterior
      const horariosLivres = await AgendamentoService.buscarDisponibilidade(
        empresa.id,
        data,
        servicoId,
        profesionalId
      );

      return res.json(horariosLivres);
    } catch (error) {
      next(error);
    }
  },

  /**
   * 2. CRIAR AGENDAMENTO E GERAR PIX (Público)
   * POST /api/agendamentos
   */
  async criar(req, res, next) {
    try {
      const { slug, clienteNome, clienteEmail, clienteCpf, dataHora, servicoId, profissionalId } = req.body;

      // Validações de existência do ecossistema SaaS
      const empresa = await prisma.empresa.findUnique({ where: { slug } });
      if (!empresa) return res.status(404).json({ erro: "Empresa não encontrada." });

      const servico = await prisma.servico.findUnique({ where: { id: servicoId } });
      if (!servico) return res.status(404).json({ erro: "Serviço não encontrado." });

      // Cálculo automático do horário de término para blindagem de concorrência
      const inicio = new Date(dataHora);
      const fim = new Date(inicio.getTime() + servico.duracao * 60 * 1000);

      // Divisão exata de 50% do valor do serviço (Sinal de Reserva)
      const valorSinal = servico.preco / 2;

      let asaasPaymentId = null;
      let pixQrCode = null;
      let pixCopiaECola = null;

      try {
        // Comunicação Direta com o ambiente de Homologação (Sandbox) do Asaas
        const responseAsaas = await axios.post(
          'https://sandbox.asaas.com/api/v3/payments',
          {
            billingType: 'PIX',
            discount: { value: 0, type: 'FIXED' },
            value: valorSinal,
            dueDate: new Date(Date.now() + 30 * 60 * 1000).toISOString().split('T')[0], // Expira em 30 min
            name: clienteNome,
            cpfCnpj: clienteCpf.replace(/\D/g, ''), // Limpa caracteres especiais do CPF
            description: `Reserva de Horário: ${servico.nome} - ${empresa.nome}`
          },
          { headers: { access_token: process.env.ASAAS_API_KEY } }
        );

        asaasPaymentId = responseAsaas.data.id;

        // Requisição secundária ao Asaas para extrair a imagem do QR Code e a linha digitável (Copia e Cola)
        const responsePix = await axios.get(
          `https://sandbox.asaas.com/api/v3/payments/${asaasPaymentId}/pixQrCode`,
          { headers: { access_token: process.env.ASAAS_API_KEY } }
        );

        pixQrCode = responsePix.data.encodedImage; // String Base64 para renderizar a imagem direta no Front
        pixCopiaECola = responsePix.data.payload;   // Texto para o botão "Copiar Pix"

      } catch (err) {
        console.error("🚨 Erro de comunicação com a API do Asaas:", err.response?.data || err.message);
        return res.status(502).json({ erro: "O gateway de pagamentos recusou a operação ou está offline." });
      }

      // Salva o registro no banco de dados mantendo o status de segurança PENDENTE
      const agendamento = await prisma.agendamento.create({
        data: {
          clienteNome,
          clienteEmail,
          clienteCpf,
          dataHora: inicio,
          dataHoraFim: fim,
          valorTotal: servico.preco,
          valorSinal,
          asaasPaymentId,
          empresaId: empresa.id,
          servicoId,
          profissionalId
        }
      });

      // Retorna a resposta completa. O Front-end usará esses dados para abrir o modal do PIX
      return res.status(201).json({
        agendamento,
        checkout: {
          qrCodeBase64: pixQrCode,
          copiaECola: pixCopiaECola
        }
      });

    } catch (error) {
      next(error);
    }
  },

  /**
   * 3. WEBHOOK ASAAS (Público — Chamado pelo próprio Asaas)
   * POST /api/agendamentos/webhook/asaas
   */
  async webhookAsaas(req, res, next) {
    try {
      const { event, payment } = req.body;

      console.log(`🔔 [Webhook Asaas] Evento disparado: ${event} para o pagamento ${payment?.id}`);

      // Se o cliente pagou o Pix com sucesso
      if (event === 'PAYMENT_RECEIVED' || event === 'PAYMENT_CONFIRMED') {
        const agendamentoExistente = await prisma.agendamento.findUnique({
          where: { asaasPaymentId: payment.id }
        });

        if (agendamentoExistente) {
          // Atualiza a reserva liberando o horário como CONFIRMADO na agenda do profissional
          await prisma.agendamento.update({
            where: { asaasPaymentId: payment.id },
            data: {
              statusPagamento: 'PAGO',
              statusReserva: 'CONFIRMADO'
            }
          });
          console.log(`🎉 Sucesso! Agendamento ${agendamentoExistente.id} confirmado e liberado.`);
        }
      }

      // IMPORTANTE: Retornar HTTP 200 para o Asaas saber que recebemos a notificação
      return res.status(200).json({ received: true });
    } catch (error) {
      next(error);
    }
  },

  /**
   * 4. LISTAR AGENDA DO DIA (Protegido - Área Logada do Profissional)
   * GET /api/agendamentos/admin/agenda?data=YYYY-MM-DD
   */
  async listarAgendaDoDia(req, res, next) {
    try {
      const empresaId = req.empresaId; // Injetado pelo authMiddleware
      const { data } = req.query;

      if (!data) return res.status(400).json({ erro: "Informe a data para filtragem." });

      const agenda = await prisma.agendamento.findMany({
        where: {
          empresaId,
          dataHora: {
            gte: new Date(`${data}T00:00:00.000Z`),
            lte: new Date(`${data}T23:59:59.999Z`)
          }
        },
        include: {
          servico: true,
          profissional: true
        },
        orderBy: { dataHora: 'asc' }
      });

      return res.json(agenda);
    } catch (error) {
      next(error);
    }
  }
};