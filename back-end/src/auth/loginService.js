// Arquivo services/loginService.js
require('dotenv').config();
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { Database } = require('arangojs');
const path = require('path');
const rootDir = path.join(__dirname, '../../');

// Importar as configurações do banco de dados e do JWT
const { dbUrl, dbName, dbUser, dbPass, secret, expiresIn } = require('../../config');

// Criar uma instância do banco de dados ArangoDB
const db = new Database({
  url: dbUrl,
  databaseName: dbName,
  auth: { username: dbUser, password: dbPass },
});

// Criar uma função para exibir a página de login
function showLoginPage(req, res) {
  res.sendFile(rootDir + 'public/login.html');
}

// Criar uma função para autenticar um usuário no banco de dados e gerar um token JWT
async function loginUsuario(req, res) {
  const { username, password } = req.body;

  try {
    await db.login(dbUser, dbPass); // Fazer o login no banco de dados ArangoDB

    const usuarios = db.collection('usuarios');
    const user = await usuarios.firstExample({ username });

    if (!user) {
      return res.status(401).json({ error: 'Usuário não encontrado!' });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({ error: 'Senha incorreta!' });
    }

    const token = jwt.sign({ sub: user._key }, secret, { expiresIn });
    // Armazenar o token no localStorage
    res.cookie('token', token); // Usando cookies para armazenar o token de forma segura
    // Redirecionar para a página home com o token no URL
    res.status(200).json({ token });
  } catch (err) {
    console.error('Erro ao fazer login no banco de dados:', err);
    return res.status(401).json({ error: 'Esse usuário não existe' });
  }
}

// Definir as rotas para exibir a página de login e autenticar o usuário
router.get('/', showLoginPage);
router.post('/login', loginUsuario);

// Exportar o router para ser usado no arquivo routes.js
module.exports = router;
