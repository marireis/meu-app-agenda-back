/**
 * @swagger
 * tags:
 *   - name: Autenticação
 *     description: Login do administrador
 *   - name: Empresas
 *     description: Cadastro e consulta de empresas
 *   - name: Serviços
 *     description: Gerenciamento de serviços
 *   - name: Horários
 *     description: Configuração de horários de trabalho
 *   - name: Agendamentos
 *     description: Criação e consulta de agendamentos
 */

// ============================================================
// AUTENTICAÇÃO
// ============================================================

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login do administrador da empresa
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - slug
 *               - senha
 *             properties:
 *               slug:
 *                 type: string
 *                 example: bella-marina
 *               senha:
 *                 type: string
 *                 example: minhasenha123
 *     responses:
 *       200:
 *         description: Retorna o token JWT
 *       400:
 *         description: Slug ou senha não informados
 *       401:
 *         description: Credenciais inválidas
 */

// ============================================================
// EMPRESAS
// ============================================================

/**
 * @swagger
 * /api/empresas:
 *   post:
 *     summary: Cadastra uma nova empresa
 *     tags: [Empresas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nome
 *               - slug
 *             properties:
 *               nome:
 *                 type: string
 *                 example: Salão Bella Marina
 *               slug:
 *                 type: string
 *                 example: bella-marina
 *               corPrincipal:
 *                 type: string
 *                 example: "#ff69b4"
 *               descricao:
 *                 type: string
 *                 example: Salão especializado em coloração
 *     responses:
 *       201:
 *         description: Empresa criada com sucesso
 *       400:
 *         description: Slug já em uso ou dados inválidos
 */

/**
 * @swagger
 * /api/config/{slug}:
 *   get:
 *     summary: Busca os dados públicos de uma empresa pelo slug
 *     tags: [Empresas]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         example: bella-marina
 *     responses:
 *       200:
 *         description: Dados da empresa com serviços e horários
 *       404:
 *         description: Empresa não encontrada
 */

// ============================================================
// SERVIÇOS
// ============================================================

/**
 * @swagger
 * /api/servicos:
 *   post:
 *     summary: Cria um novo serviço
 *     tags: [Serviços]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nome
 *               - preco
 *               - duracao
 *               - empresaId
 *             properties:
 *               nome:
 *                 type: string
 *                 example: Corte de cabelo
 *               preco:
 *                 type: number
 *                 example: 50.00
 *               duracao:
 *                 type: integer
 *                 example: 60
 *               empresaId:
 *                 type: string
 *                 example: clx123abc
 *     responses:
 *       201:
 *         description: Serviço criado com sucesso
 *       400:
 *         description: Dados inválidos
 */

/**
 * @swagger
 * /api/servicos/{empresaId}:
 *   get:
 *     summary: Lista os serviços de uma empresa
 *     tags: [Serviços]
 *     parameters:
 *       - in: path
 *         name: empresaId
 *         required: true
 *         schema:
 *           type: string
 *         example: clx123abc
 *     responses:
 *       200:
 *         description: Lista de serviços
 *       500:
 *         description: Erro interno
 */

/**
 * @swagger
 * /api/servicos/{id}:
 *   put:
 *     summary: Atualiza um serviço
 *     tags: [Serviços]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *               preco:
 *                 type: number
 *               duracao:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Serviço atualizado com sucesso
 *       400:
 *         description: ID inválido
 *   delete:
 *     summary: Remove um serviço
 *     tags: [Serviços]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Serviço removido com sucesso
 *       400:
 *         description: Serviço possui agendamentos vinculados
 */

// ============================================================
// HORÁRIOS
// ============================================================

/**
 * @swagger
 * /api/horarios:
 *   put:
 *     summary: Configura os horários de trabalho da empresa
 *     tags: [Horários]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               empresaId:
 *                 type: string
 *                 example: clx123abc
 *               diaSemana:
 *                 type: integer
 *                 example: 1
 *               horaInicio:
 *                 type: string
 *                 example: "08:00"
 *               horaFim:
 *                 type: string
 *                 example: "18:00"
 *     responses:
 *       200:
 *         description: Horários configurados com sucesso
 */

/**
 * @swagger
 * /api/horarios/{empresaId}:
 *   get:
 *     summary: Lista os horários de uma empresa
 *     tags: [Horários]
 *     parameters:
 *       - in: path
 *         name: empresaId
 *         required: true
 *         schema:
 *           type: string
 *         example: clx123abc
 *     responses:
 *       200:
 *         description: Lista de horários
 */

// ============================================================
// AGENDAMENTOS
// ============================================================

/**
 * @swagger
 * /api/disponibilidade:
 *   get:
 *     summary: Lista horários disponíveis para agendamento
 *     tags: [Agendamentos]
 *     parameters:
 *       - in: query
 *         name: empresaId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: servicoId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: data
 *         required: true
 *         schema:
 *           type: string
 *         example: "2026-05-15"
 *     responses:
 *       200:
 *         description: Lista de horários disponíveis
 */

/**
 * @swagger
 * /api/agendamentos:
 *   post:
 *     summary: Cria um novo agendamento
 *     tags: [Agendamentos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - empresaId
 *               - servicoId
 *               - nomeCliente
 *               - data
 *               - hora
 *             properties:
 *               empresaId:
 *                 type: string
 *               servicoId:
 *                 type: string
 *               nomeCliente:
 *                 type: string
 *                 example: João Silva
 *               data:
 *                 type: string
 *                 example: "2026-05-15"
 *               hora:
 *                 type: string
 *                 example: "14:00"
 *     responses:
 *       201:
 *         description: Agendamento criado com sucesso
 *       400:
 *         description: Dados inválidos ou horário indisponível
 */

/**
 * @swagger
 * /api/admin/agenda:
 *   get:
 *     summary: Lista a agenda do dia (somente admin)
 *     tags: [Agendamentos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: data
 *         schema:
 *           type: string
 *         example: "2026-05-10"
 *     responses:
 *       200:
 *         description: Lista de agendamentos do dia
 *       401:
 *         description: Token inválido ou ausente
 */