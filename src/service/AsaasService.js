const ASAAS_URL = 'https://sandbox.asaas.com/api/v3'; 
const ASAAS_KEY = process.env.ASAAS_API_KEY; 

export const AsaasService = {
  async gerarCobrancaPix(clienteNome, clienteCpf, valorTotal) {
    // Calcula os 50% de sinal
    const valorSinal = valorTotal / 2;

    try {
      // 1. Criar a cobrança no Asaas
      const response = await fetch(`${ASAAS_URL}/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'access_token': ASAAS_KEY
        },
        body: JSON.stringify({
          customer: process.env.ASAAS_DEFAULT_CUSTOMER, // Dica: Crie um cliente genérico no Asaas para agendamentos avulsos
          billingType: 'PIX',
          value: valorSinal,
          dueDate: new Date().toISOString().split('T')[0], // Vence hoje
          description: `Sinal (50%) de Agendamento - ${clienteNome}`,
        })
      });

      const paymentData = await response.json();

      if (!response.ok) throw new Error(paymentData.errors?.[0]?.description || "Erro no Asaas");

      // 2. Pegar o "Copia e Cola" e o QR Code dessa cobrança gerada
      const pixResponse = await fetch(`${ASAAS_URL}/payments/${paymentData.id}/pixQrCode`, {
        headers: { 'access_token': ASAAS_KEY }
      });
      const pixData = await pixResponse.json();

      return {
        asaasPaymentId: paymentData.id,
        payload: pixData.payload, // O código "Copia e Cola"
        encodedImage: pixData.encodedImage // O QR Code em Base64
      };
    } catch (error) {
      console.error("Erro ao gerar PIX:", error);
      throw error;
    }
  }
};