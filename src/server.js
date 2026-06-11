require('dotenv').config();
const app = require('./app');
const connectDatabase = require('./config/db');

const PORT = process.env.PORT || 4000;

const startServer = async () => {
  await connectDatabase();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();
