const errorHandler = (err, req, res, next) => {
  console.error('Error en API SMI:', err);
  const status = err.status || 500;

  res.status(status).json({
    message: err.message || 'Error interno del servidor (SMI)'
  });
};

module.exports = errorHandler;