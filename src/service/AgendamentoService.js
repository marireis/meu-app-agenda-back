import { prisma } from '../config/database.js';

export const AgendamentoService = {
  
  async buscarDisponibilidade(empresaId, data, servicoId) {
    // 1. Buscar as informações do serviço (precisamos saber a duração dele em minutos!)
    const servico = await prisma.servico.findUnique({ where: { id: servicoId } });
    if (!servico) throw new Error("Serviço não encontrado");

    // 2. Descobrir qual é o dia da semana da data solicitada (0=Domingo, 1=Segunda, etc.)
    const dataConsulta = new Date(`${data}T00:00:00`);
    const diaSemana = dataConsulta.getDay();

    // 3. Buscar se a empresa abre nesse dia específico
    const regra = await prisma.horarioFuncionamento.findUnique({
      where: { empresaId_diaSemana: { empresaId, diaSemana } }
    });

    // Se não existir regra no banco ou se o dia estiver desligado (estaAtivo: false), retorna vazio
    if (!regra || !regra.estaAtivo) return []; 

    // 4. Gerar os "slots" (espaços de tempo) do dia com base na duração do serviço
    const slots = [];
    let atual = regra.abertura; // Exemplo: "08:00"
    const fim = regra.fechamento; // Exemplo: "18:00"

    while (atual < fim) {
      slots.push(atual);
      // Pega na hora atual e soma a duração do serviço
      let [hora, min] = atual.split(':').map(Number);
      min += servico.duracao;
      
      // Ajusta o relógio (se os minutos passarem de 60, adiciona 1 hora)
      while (min >= 60) { hora += 1; min -= 60; }
      
      // Formata de volta para o formato de texto "HH:MM"
      atual = `${String(hora).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
    }

    // 5. Buscar os agendamentos que já existem neste dia
    // Calcula que horas eram exatamente há 10 minutos atrás
    const dezMinutosAtras = new Date(Date.now() - 10 * 60 * 1000);

    const ocupados = await prisma.agendamento.findMany({
      where: { 
        empresaId: empresaId,
        dataHora: {
          gte: new Date(`${data}T00:00:00Z`), // Início do dia
          lte: new Date(`${data}T23:59:59Z`)  // Fim do dia
        },
        // A MÁGICA DA RESERVA: Considera o horário ocupado se estiver CONFIRMADO
        // ou se estiver AGUARDANDO_PAGAMENTO há MENOS de 10 minutos.
        OR: [
          { statusReserva: "CONFIRMADO" },
          { 
            statusReserva: "AGUARDANDO_PAGAMENTO",
            criadoEm: { gte: dezMinutosAtras } // gte = greater than or equal (maior ou igual a 10 mins atrás)
          }
        ]
      }
    });

    // 6. Filtrar: Só deixa passar os horários gerados que NÃO estão na lista de ocupados
    const disponiveis = slots.filter(slot => 
      !ocupados.some(agendado => agendado.dataHora.toISOString().includes(slot))
    );

    return disponiveis;
  }
};