require('dotenv').config();
const express = require('express');
const cors = require('cors');

const dashboardRoutes = require('./routes/dashboardRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');
const maquinariaRoutes = require('./routes/maquinariaRoutes');
const tecnicosRoutes = require('./routes/tecnicosRoutes');
const mantenimientoRoutes = require('./routes/mantenimientoRoutes');
const ordenesRoutes = require('./routes/ordenesRoutes');

const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());

// Rutas principales
app.use('/api', dashboardRoutes);
app.use('/api', usuarioRoutes);
app.use('/api', maquinariaRoutes);
app.use('/api', tecnicosRoutes);
app.use('/api', mantenimientoRoutes);
app.use('/api', ordenesRoutes);

// Healthcheck
app.get('/', (req, res) => {
  res.json({ message: 'API SMI (Sistema de Mantenimiento) funcionando' });
});

// Middleware de errores
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend escuchando en http://localhost:${PORT}`);
});