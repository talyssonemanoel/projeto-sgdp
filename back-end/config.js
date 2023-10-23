// Arquivo config.js
require('dotenv').config({ path: __dirname + '/keys.env' });

// Configurações do banco de dados ArangoDB
const dbUrl = process.env.DB_URL;
const dbName = process.env.DB_NAME;
const dbUser = process.env.DB_USER;
const dbPass = process.env.DB_PASS;
const userMail = process.env.USER_MAIL;
const passMail = process.env.PASS_MAIL;

// Configurações do JWT
const secret = process.env.SECRET;
const expiresIn = process.env.EXPIRES_IN;

// Configurações do servidor Express
const port = process.env.PORT || 3000;

// Exportar as configurações para serem usadas em outros arquivos
module.exports = {
  dbUrl,
  dbName,
  dbUser,
  dbPass,
  secret,
  expiresIn,
  port,
  userMail,
  passMail,
};
