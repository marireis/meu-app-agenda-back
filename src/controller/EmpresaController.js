import { prisma } from '../config/database.js';
import bcrypt from 'bcryptjs';


export const EmpresaController = {
async criar(req, res) {
    // Agora recebemos a senha também!
    const { nome, slug, descricao, logoUrl, endereco, senha } = req.body; 
    
    try {
      // Criptografa a senha antes de salvar no banco! (Se não enviar senha, usa "123456" como padrão)
      const senhaParaSalvar = senha ? senha : "123456";
      const senhaCriptografada = await bcrypt.hash(senhaParaSalvar, 10);

      const novaEmpresa = await prisma.empresa.create({ 
        data: { 
          nome, 
          slug, 
          descricao, 
          logoUrl, 
          endereco,
          senhaAdmin: senhaCriptografada // Salva a senha protegida!
        } 
      });
      res.status(201).json(novaEmpresa);
    } catch (error) {
      if (error.code === 'P2002') {
        return res.status(400).json({ erro: "Este link já está em uso por outra empresa." });
      }
      res.status(400).json({ erro: "Erro ao criar empresa", detalhes: error.message });
    }
  },
  /**
   * @openapi
   * /api/config/{slug}:
   *   get:
   *     summary: Recupera configurações da empresa
   *     description: "O link único da empresa (ex: bellamariastudio)"
   *     parameters:
   *       - name: slug
   *         in: path
   *         required: true
   *         description: "O link único da empresa (ex: bellamariastudio)"
   *         schema:
   *           type: string
 */
  async buscarPorSlug(req, res) {
    const { slug } = req.params;
    try {
      const empresa = await prisma.empresa.findUnique({
        where: { slug },
        include: { 
          servicos: true,
          horarios: true // Importante para o front montar a agenda
        } 
      });
      
      if (!empresa) return res.status(404).json({ erro: "Empresa não encontrada" });
      res.json(empresa);
    } catch (error) {
      res.status(500).json({ erro: "Erro ao buscar empresa" });
    }
  }
};