// src/middleware/errorMiddleware.js
export const errorMiddleware = (err, req, res, next) => {
  console.error('❌ Erro detectado:', err);

  // Erro de registro duplicado no Prisma (ex: mesmo e-mail ou slug)
  if (err.code === 'P2002') {
    return res.status(400).json({
      error: 'Conflito de dados',
      message: `O valor do campo ${err.meta.target} já existe.`
    });
  }

  res.status(err.statusCode || 500).json({
    error: err.name || 'Internal Server Error',
    message: err.message || 'Ocorreu um erro inesperado.'
  });
};