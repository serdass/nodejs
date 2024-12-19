// Importar librerías necesarias
const express = require('express');
require('dotenv').config(); // Carga las variables de entorno

// Crear una aplicación Express
const app = express();

// Configuración básica
const PORT = process.env.PORT || 3000;

// Middleware para analizar JSON
app.use(express.json());

// Rutas
app.get('/', (req, res) => {
  res.send('¡La aplicación Node.js está funcionando correctamente! una vez más');
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('¡Algo salió mal!');
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});