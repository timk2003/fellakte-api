// server.js
require('dotenv').config();
const express = require('express');
const chalk = require('chalk');
const figlet = require('figlet');
const path = require('path');

// Utils
const { startupAnimation } = require('./utils/startup');

const app = express();
app.use(express.json());

// Middleware (z.B. Auth)
const { jwtAuth } = require('./middleware/auth');
app.use(jwtAuth);

// Routen
const documentRoutes = require('./routes/documents');
app.use('/api/documents', documentRoutes);

const PORT = process.env.PORT || 3000;

figlet('fellakte-api', (err, data) => {
  if (err) {
    console.log('Banner konnte nicht angezeigt werden.');
  } else {
    console.log(chalk.cyan(data));
  }
  startupAnimation()
    .then(() => {
      app.listen(PORT, () => {
        console.log(chalk.green(`\n🚀 Server läuft auf Port ${PORT}`));
      });
    })
    .catch((e) => {
      console.error(chalk.red('Startup fehlgeschlagen:'), e);
      process.exit(1);
    });
}); 