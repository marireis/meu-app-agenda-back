// src/services/AgendamentoService.js
import { prisma } from '../config/database.js';

export const AgendamentoService = {
  
  async buscarDisponibilidade(empresaId, data, servicoId, profissionalId) {
    // 1. Validar entradas obrigatórias do SaaS
    if (!profissionalId) throw new Error("É necessário selecionar um profissional para checar a agenda.");

    // 2. Buscar as informações do serviço (duração em minutos)
    const servico = await prisma.servico.findUnique({ where: { id: servicoId } });
    if (!servico) throw new Error("Serviço não encontrado");

    // 3. Descobrir o dia da semana da data solicitada (0=Dom, 1=Seg...)
    // Garantindo o parsing correto da data local sem fuso horário indesejado
    const [ano, mes, dia] = data.split('-').map(Number);
    const dataConsulta = new Date(ano, mes - 1, dia);
    const diaSemana = dataConsulta.getDay();

    // 4. Buscar a regra de horário (Tenta achar o específico do profissional, se não houver, pega o geral da empresa)
    let regra = await prisma.horarioFuncionamento.findFirst({
      where: {
        empresaId,
        profissionalId,
        diaSemana,
        estaAtivo: true
      }
    });

    if (!regra) {
      // Se não tem regra pro profissional, busca a configuração global da empresa para aquele dia
      regra = await prisma.horarioFuncionamento.findFirst({
        where: {
          empresaId,
          profissionalId: null,
          diaSemana,
          estaAtivo: true
        }
      });
    }

    // Se ninguém atende nesse dia, retorna vazio
    if (!regra) return []; 

    // 5. Gerar todos os "slots" potenciais do dia baseado na duração do serviço
    const slots = [];
    let atual = regra.abertura; // Ex: "09:00"
    const fim = regra.fechamento; // Ex: "18:00"

    while (atual < fim) {
      slots.push(atual);
      
      let [hora, min] = atual.split(':').map(Number);
      min += servico.duracao;
      
      while (min >= 60) { hora += 1; min -= 60; }
      atual = `${String(hora).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
    }

    // 6. Buscar os agendamentos ocupados por ESSE profissional neste dia
    const dezMinutosAtras = new Date(Date.now() - 10 * 60 * 1000);
    const inicioDia = new Date(`${data}T00:00:00.000Z`);
    const fimDia = new Date(`${data}T23:59:59.999Z`);

    const agendamentosOcupados = await prisma.agendamento.findMany({
      where: { 
        empresaId,
        profissionalId,
        dataHora: { gte: inicioDia, lte: fimDia },
        OR: [
          { statusReserva: "CONFIRMADO" },
          { 
            statusReserva: "AGUARDANDO_PAGAMENTO",
            criadoEm: { gte: dezMinutosAtras }
          }
        ]
      }
    });

    // 7. NOVO: Buscar os bloqueios de agenda do profissional neste dia (Almoço, folgas, médicos)
    const bloqueios = await prisma.bloqueioAgenda.findMany({
      where: {
        empresaId,
        profissionalId,
        dataInicio: { lte: fimDia },
        dataFim: { gte: inicioDia }
      }
    });

    // 8. Filtrar os slots eliminando colisões com Agendamentos E Bloqueios
    const disponiveis = slots.filter(slot => {
      // Converte o texto do slot atual para um objeto Date real para comparação matemática pontual
      const [slotHora, slotMin] = slot.split(':').map(Number);
      const dataHoraSlotInicio = new Date(ano, mes - 1, dia, slotHora, slotMin);
      const dataHoraSlotFim = new Date(dataHoraSlotInicio.getTime() + servico.duracao * 60 * 1000);

      // Regra A: Checa se colide com algum agendamento feito (cruzando os intervalos completos!)
      const colideComAgendamento = agendamentosOcupados.some(agendado => {
        const agendadoInicio = new Date(agendado.dataHora).getTime();
        const agendadoFim = new Date(agendado.dataHoraFim).getTime();
        
        return (
          dataHoraSlotInicio.getTime() < agendadoFim && 
          dataHoraSlotFim.getTime() > agendadoInicio
        );
      });

      // Regra B: Checa se colide com algum bloqueio administrativo do profissional
      const colideComBloqueio = bloqueios.some(bloqueio => {
        const bloqueioInicio = new Date(bloqueio.dataInicio).getTime();
        const bloqueioFim = new Date(bloqueio.dataFim).getTime();

        return (
          dataHoraSlotInicio.getTime() < bloqueioFim && 
          dataHoraSlotFim.getTime() > bloqueioInicio
        );
      });

      // O slot só está livre se não colidir com nenhum dos dois
      return !colideComAgendamento && !colideComBloqueio;
    });

    return disponiveis;
  }
};