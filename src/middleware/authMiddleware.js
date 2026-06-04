// src/middleware/AuthMiddleware.js
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
    // 3. Valida e decodifica a pulseira (token)
    const decodificado = jwt.verify(token, JWT_SECRET);
    
    // Proteção SaaS: Se por acaso o token for válido mas não tiver o ID da empresa no payload, barra o acesso
    if (!decodificado.empresaId) {
      return res.status(401).json({ erro: "Token inválido: identificador da empresa ausente." });
    }

    // 4. Injeta as informações na requisição para uso dos Controllers e Services
    req.usuario = decodificado;
    req.empresaId = decodificado.empresaId; 

    // Agora o log vai funcionar perfeitamente mostrando qual empresa está acessando a rota!
    console.log(`🔑 [SaaS Auth] Empresa autenticada: ${req.empresaId} acessando ${req.method} ${req.url}`);

    next();
  } catch (error) {
    return res.status(401).json({ erro: "Token inválido ou expirado. Faça login novamente." });
  }
};