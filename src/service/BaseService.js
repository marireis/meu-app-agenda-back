export class BaseService {
  /**
   * @param {Object} model - O modelo do Prisma (ex: prisma.servico, prisma.agendamento)
   */
  constructor(model) {
    this.model = model;
  }

  // Busca todos os registros da empresa logada
  async findAll(empresaId, query = {}) {
    return await this.model.findMany({
      ...query,
      where: {
        ...query.where,
        empresaId: empresaId // Blindagem Multi-tenant
      }
    });
  }

  // Busca um registro específico garantindo que pertença à empresa
  async findById(id, empresaId) {
  console.log('🔍 findById chamado com:', { id, empresaId });
  
  const registro = await this.model.findFirst({
    where: { id, empresaId }
  });

  console.log('📦 Resultado:', registro);
  
  if (!registro) {
    const error = new Error("Registro não encontrado ou acesso negado.");
    error.status = 404;
    throw error;
  }
  return registro;
}

  // Cria um registro vinculando-o automaticamente à empresa do Token
  async create(empresaId, data) {
    return await this.model.create({
      data: {
        ...data,
        empresaId: empresaId
      }
    });
  }

  // Atualiza um registro apenas se ele pertencer à empresa
  async update(id, empresaId, data) {
    // Primeiro validamos se o registro pertence à empresa
    await this.findById(id, empresaId);

    return await this.model.update({
      where: { id },
      data
    });
  }

  // Deleta um registro com verificação de posse
  async delete(id, empresaId) {
    await this.findById(id, empresaId);
    return await this.model.delete({
      where: { id }
    });
  }
}