import express from 'express';
import 'dotenv/config';
import empresaRoutes from './routes/EmpresaRoutes.js';
import agendamentoRoutes from './routes/AgendamentoRoutes.js';


const express = require('express');
const { PrismaClient } = require('@prisma/client');
const cors = require('cors');

const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json());

// --- ROTAS DE CONFIGURAÇÃO (ADMIN) ---

// 1. Criar uma nova Empresa (SaaS Signup)
app.post('/api/empresas', async (req, res) => {
  const { nome, slug, corPrincipal, descricao } = req.body;
  try {
    const novaEmpresa = await prisma.empresa.create({
      data: { nome, slug, corPrincipal, descricao }
    });
    res.json(novaEmpresa);
  } catch (error) {
    res.status(400).json({ error: "Slug já existe ou dados inválidos." });
  }
});

// 2. Upsert de Horários (Configurar a Agenda)
app.put('/api/admin/horarios', async (req, res) => {
  const { empresaId, horarios } = req.body; // horarios = [{diaSemana: 1, abertura: "08:00", ...}]
  try {
    const operacoes = horarios.map(h => 
      prisma.horarioFuncionamento.upsert({
        where: { empresaId_diaSemana: { empresaId, diaSemana: h.diaSemana } },
        update: { abertura: h.abertura, fechamento: h.fechamento, estaAtivo: h.estaAtivo },
        create: { ...h, empresaId }
      })
    );
    await Promise.all(operacoes);
    res.json({ message: "Horários atualizados!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. Adicionar Serviços
app.post('/api/servicos', async (req, res) => {
  const { nome, preco, duracao, empresaId } = req.body;
  const servico = await prisma.servico.create({
    data: { nome, preco, duracao, empresaId }
  });
  res.json(servico);
});

// --- ROTAS PÚBLICAS (CLIENTE FINAL) ---

// 4. Buscar configuração da página por Slug
app.get('/api/config/:slug', async (req, res) => {
  const empresa = await prisma.empresa.findUnique({
    where: { slug: req.params.slug },
    include: { servicos: true, horarios: true }
  });
  if (!empresa) return res.status(404).json({ error: "Empresa não encontrada" });
  res.json(empresa);
});

// 5. Lógica de Horários Disponíveis (O Motor)
app.get('/api/disponibilidade', async (req, res) => {
  const { slug, data, servicoId } = req.query; // data: "2024-05-10"

  const empresa = await prisma.empresa.findUnique({
    where: { slug },
    include: { horarios: true }
  });

  const servico = await prisma.servico.findUnique({ where: { id: servicoId } });
  
  // 1. Descobrir o dia da semana da data enviada
  const dataConsulta = new Date(data);
  const diaSemana = dataConsulta.getDay();

  // 2. Pegar a regra de horário para esse dia
  const regra = empresa.horarios.find(h => h.diaSemana === diaSemana);
  if (!regra || !regra.estaAtivo) return res.json([]);

  // 3. Gerar slots baseados na duração do serviço (ex: 30 em 30 min)
  const slots = [];
  let atual = regra.abertura; // "08:00"
  const fim = regra.fechamento; // "18:00"

  while (atual < fim) {
    slots.push(atual);
    // Soma a duração do serviço ao horário atual
    let [hora, min] = atual.split(':').map(Number);
    min += servico.duracao;
    if (min >= 60) { hora += 1; min -= 60; }
    atual = `${String(hora).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
  }

  // 4. Filtrar agendamentos existentes (Simplificado para o teste)
  const ocupados = await prisma.agendamento.findMany({
    where: { 
      empresaId: empresa.id,
      dataHora: {
        gte: new Date(`${data}T00:00:00Z`),
        lte: new Date(`${data}T23:59:59Z`)
      }
    }
  });

  // Retorna apenas os slots que não coincidem com o início de um agendamento ocupado
  const disponiveis = slots.filter(s => 
    !ocupados.some(o => o.dataHora.toISOString().includes(s))
  );

  res.json(disponiveis);
});

app.listen(3001, () => console.log("Servidor SaaS rodando na porta 3001"));