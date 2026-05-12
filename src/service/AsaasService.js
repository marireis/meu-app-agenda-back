// src/service/AsaasService.js
const ASAAS_URL = 'https://sandbox.asaas.com/api/v3'; 
const ASAAS_KEY = process.env.ASAAS_API_KEY; 

export const AsaasService = {
  
  /**
   * Função principal para gerar a reserva com PIX de 50%
   */
  async gerarCobrancaPix(clienteNome, clienteCpf, valorTotal) {
    // Calcula os 50% de sinal
    const valorSinal = valorTotal / 2;

    try {
      // PASSO 1: Criar o cliente dinamicamente no Asaas
      // Isso evita o erro de "Customer inválido"
      const customerId = await this.buscarOuCriarCliente(clienteNome, clienteCpf);

      // PASSO 2: Criar a cobrança vinculada ao novo customerId
      const response = await fetch(`${ASAAS_URL}/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'access_token': ASAAS_KEY
        },
        body: JSON.stringify({
          customer: customerId, // ID dinâmico gerado no Passo 1
          billingType: 'PIX',
          value: valorSinal,
          dueDate: new Date().toISOString().split('T')[0], // Vence hoje
          description: `Sinal (50%) de Agendamento - ${clienteNome}`,
        })
      });

      const paymentData = await response.json();
      if (!response.ok) throw new Error(paymentData.errors?.[0]?.description || "Erro ao criar pagamento");

      // PASSO 3: Buscar o QR Code e o código "Copia e Cola"
      const pixResponse = await fetch(`${ASAAS_URL}/payments/${paymentData.id}/pixQrCode`, {
        headers: { 'access_token': ASAAS_KEY }
      });
      const pixData = await pixResponse.json();

      return {
        asaasPaymentId: paymentData.id,
        payload: pixData.payload,
        encodedImage: pixData.encodedImage
      };

    } catch (error) {
      console.error("Erro detalhado no AsaasService:", error.message);
      throw error;
    }
  },

  /**
   * Função auxiliar para cadastrar o cliente e retornar o ID
   */
  async buscarOuCriarCliente(name, cpfCnpj) {
    const response = await fetch(`${ASAAS_URL}/customers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'access_token': ASAAS_KEY
      },
      body: JSON.stringify({ name, cpfCnpj })
    });

    const data = await response.json();

    if (!response.ok) {
      // Se o cliente já existir, o Asaas pode retornar erro, 
      // mas em Sandbox ele geralmente permite avançar ou retorna o erro específico.
      throw new Error(data.errors?.[0]?.description || "Erro ao cadastrar cliente");
    }

    return data.id; // Retorna o 'cus_XXXXXXXX'
  }
};