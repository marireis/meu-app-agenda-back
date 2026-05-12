import { z } from 'zod';

// Remove tudo que não é dígito (para validar CPF/CNPJ e telefone)
const apenasDigitos = (val) => val.replace(/\D/g, '');

const validarCPF = (cpf) => {
  const digits = apenasDigitos(cpf);
  if (digits.length !== 11) return false;
  if (/^(\d)\1+$/.test(digits)) return false; // Bloqueia 111.111.111-11

  let soma = 0;
  for (let i = 0; i < 9; i++) soma += parseInt(digits[i]) * (10 - i);
  let resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(digits[9])) return false;

  soma = 0;
  for (let i = 0; i < 10; i++) soma += parseInt(digits[i]) * (11 - i);
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  return resto === parseInt(digits[10]);
};

const validarCNPJ = (cnpj) => {
  const digits = apenasDigitos(cnpj);
  if (digits.length !== 14) return false;
  if (/^(\d)\1+$/.test(digits)) return false; // Bloqueia 11.111.111/1111-11

  const calcDigito = (digits, pesos) => {
    const soma = digits.split('').reduce((acc, d, i) => acc + parseInt(d) * pesos[i], 0);
    const resto = soma % 11;
    return resto < 2 ? 0 : 11 - resto;
  };

  const pesos1 = [5,4,3,2,9,8,7,6,5,4,3,2];
  const pesos2 = [6,5,4,3,2,9,8,7,6,5,4,3,2];

  const d1 = calcDigito(digits.slice(0, 12), pesos1);
  const d2 = calcDigito(digits.slice(0, 13), pesos2);

  return d1 === parseInt(digits[12]) && d2 === parseInt(digits[13]);
};

export const criarEmpresaSchema = z.object({
  nome: z
    .string()
    .min(2, "Nome deve ter ao menos 2 caracteres")
    .max(100, "Nome deve ter no máximo 100 caracteres"),

  slug: z
    .string()
    .min(2, "Slug deve ter ao menos 2 caracteres")
    .max(50, "Slug deve ter no máximo 50 caracteres")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug deve conter apenas letras minúsculas, números e hífens"),

  email: z
    .string()
    .email("E-mail inválido")
    .max(100, "E-mail deve ter no máximo 100 caracteres"),

  senha: z
    .string()
    .min(8, "Senha deve ter ao menos 8 caracteres")
    .max(64, "Senha deve ter no máximo 64 caracteres")
    .regex(/[A-Z]/, "Senha deve ter ao menos uma letra maiúscula")
    .regex(/[a-z]/, "Senha deve ter ao menos uma letra minúscula")
    .regex(/[0-9]/, "Senha deve ter ao menos um número")
    .regex(/[^A-Za-z0-9]/, "Senha deve ter ao menos um caractere especial"),

  documento: z
    .string()
    .refine((val) => {
      const digits = apenasDigitos(val);
      if (digits.length === 11) return validarCPF(val);
      if (digits.length === 14) return validarCNPJ(val);
      return false;
    }, "CPF ou CNPJ inválido"),

  telefone: z
    .string()
    .refine((val) => {
      const digits = apenasDigitos(val);
      return digits.length === 10 || digits.length === 11;
    }, "Telefone inválido — use (11) 91234-5678 ou (11) 3456-7890"),

  corPrincipal: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Cor inválida — use formato HEX ex: #ff69b4")
    .optional(),

  descricao: z
    .string()
    .max(500, "Descrição deve ter no máximo 500 caracteres")
    .optional(),
});