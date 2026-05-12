// src/controller/HorarioController.js
import { prisma } from '../config/database.js';
import { z } from 'zod';

const horarioSchema = z.object({
  diaSemana: z.number().int().min(0).max(6),
  abertura: z.string().regex(/^\d{2}:\d{2}$/, "Formato inválido, use HH:MM"),
  fechamento: z.string().regex(/^\d{2}:\d{2}$/, "Formato inválido, use HH:MM"),
  estaAtivo: z.boolean().default(true),
});

const loteSchema = z.object({
  horarios: z.array(horarioSchema).min(1, "Envie ao menos um horário"),
});

export const HorarioController = {

  async configurar(req, res) {
    // empresaId vem do token — nunca do body
    const empresaId = req.empresaId;

    const resultado = loteSchema.safeParse(req.body);
    if (!resultado.success) {
      return res.status(400).json({ erro: resultado.error.flatten().fieldErrors });
    }

    const { horarios } = resultado.data;

    try {
      const operacoes = horarios.map(h =>
        prisma.horarioFuncionamento.upsert({
          where: {
            empresaId_diaSemana: { empresaId, diaSemana: h.diaSemana }
          },
          update: {
            abertura: h.abertura,
            fechamento: h.fechamento,
            estaAtivo: h.estaAtivo
          },
          create: {
            diaSemana: h.diaSemana,
            abertura: h.abertura,
            fechamento: h.fechamento,
            estaAtivo: h.estaAtivo,
            empresaId
          }
        })
      );

      await Promise.all(operacoes);
      return res.json({ mensagem: "Horários configurados com sucesso!" });
    } catch (error) {
      console.error("Erro ao configurar horários:", error);
      return res.status(500).json({ erro: "Erro interno ao salvar os horários." });
    }
  },

  async listar(req, res) {
    // empresaId vem do token — não da URL
    try {
      const horarios = await prisma.horarioFuncionamento.findMany({
        where: { empresaId: req.empresaId },
        orderBy: { diaSemana: 'asc' }
      });
      return res.json(horarios);
    } catch (error) {
      return res.status(500).json({ erro: "Erro ao buscar horários." });
    }
  }
};