// server.js
require('dotenv').config();
const express = require('express');
const chalk = require('chalk');
const figlet = require('figlet');
const path = require('path');
const cors = require('cors');

// Utils
const { startupAnimation } = require('./utils/startup');

const app = express();

app.use(cors({
  origin: ['https://app.fellakte.de', 'http://localhost:5173'],
  credentials: true
}));

// Preflight-Requests für alle Routen abfangen
app.options('*', cors());

app.use(express.json());

// Middleware (z.B. Auth)
const { jwtAuth } = require('./middleware/auth');
app.use(jwtAuth);

// Routen
const documentRoutes = require('./routes/documents');
app.use('/api/documents', documentRoutes);
const petRoutes = require('./routes/pets');
app.use('/api/pets', petRoutes);
const medicationRoutes = require('./routes/medications');
app.use('/api/medications', medicationRoutes);
const reminderRoutes = require('./routes/reminders');
app.use('/api/reminders', reminderRoutes);

const PORT = process.env.PORT || 3000;

figlet('fellakte-api', (err, data) => {
  if (err) {
    console.log('Banner konnte nicht angezeigt werden.');
  } else {
    console.log(chalk.cyan(data));
  }
  startupAnimation()
    .then(() => {
      app.listen(PORT, '0.0.0.0', () => {
        console.log(chalk.green(`\n🚀 Server läuft auf Port ${PORT} und ist von außen erreichbar.`));
      });
    })
    .catch((e) => {
      console.error(chalk.red('Startup fehlgeschlagen:'), e);
      process.exit(1);
    });
}); 