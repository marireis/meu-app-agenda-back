import { z } from 'zod';

export const criarServicoSchema = z.object({
  nome: z.string().min(2, "Nome deve ter ao menos 2 caracteres"),
  preco: z.number().positive("Preço deve ser maior que zero"),
  duracao: z.number().int().positive("Duração deve ser um número inteiro positivo"),
});

export const atualizarServicoSchema = z.object({
  nome: z.string().min(2).optional(),
  preco: z.number().positive().optional(),
  duracao: z.number().int().positive().optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: "Informe ao menos um campo para atualizar"
});