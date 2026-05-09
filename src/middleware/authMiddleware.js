import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

export const authMiddleware = (req, res, next) => {
  // 1. O cliente deve enviar a pulseira no (Header) da requisição
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ erro: "Acesso negado. Token não fornecido." });
  }

  // 2. O formato padrão do envio é "Bearer NOME_DO_TOKEN".
  const partes = authHeader.split(' ');
  
  if (partes.length !== 2 || partes[0] !== 'Bearer') {
    return res.status(401).json({ erro: "Erro no formato do token." });
  }

  const token = partes[1];

  try {
    // 3. Verifica se a pulseira é verdadeira e se não expirou
    const decodificado = jwt.verify(token, JWT_SECRET);
    
    // 4. Guarda os dados do administrador (empresaId, slug) dentro da requisição
    // Isto é super útil para usarmos lá no Controller depois!
    req.usuario = decodificado; 

    // 5. Deixa o usuário passar! Chama a próxima função (o Controller)
    next(); 
  } catch (error) {
    return res.status(401).json({ erro: "Token inválido ou expirado. Faça login novamente." });
  }
};