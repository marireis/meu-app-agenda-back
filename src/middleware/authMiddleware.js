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

   console.log('empresaId do token:', req.empresaId);
  try {
    const decodificado = jwt.verify(token, JWT_SECRET);
    req.usuario = decodificado;
    req.empresaId = decodificado.empresaId; 
    next();
  } catch (error) {
    return res.status(401).json({ erro: "Token inválido ou expirado. Faça login novamente." });
  }
};