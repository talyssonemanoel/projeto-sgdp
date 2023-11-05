// Arquivo services/authMiddleware.js
const express = require('express');
const jwt = require('jsonwebtoken');
const { Database } = require('arangojs');
const router = express.Router();

// Importar as configurações do banco de dados e do JWT
const { dbUrl, dbName, dbUser, dbPass, secret } = require('../config');

// Criar uma instância do banco de dados ArangoDB
const db = new Database({
  url: dbUrl,
  databaseName: dbName,
  auth: { username: dbUser, password: dbPass },
});

const invalidTokens = new Set();

// Função para adicionar um token à lista de tokens inválidos (revogar o token)
function revokeToken(token) {
  invalidTokens.add(token);
}

// Função para verificar se um token está na lista de tokens inválidos (foi revogado)
function isTokenRevoked(token) {
  return invalidTokens.has(token);
}

async function verifySimplesAuth(req, res, next) {
  const token = req.query.token;

  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido!' });
  }

  // Verifica se o token não foi revogado (está na lista de tokens inválidos)
  if (isTokenRevoked(token)) {
    return res.status(401).json({ error: 'Token inválido ou expirado!' });
  }

  try {
    const decoded = jwt.verify(token, secret);
    const userId = decoded.sub;

    const user = await getUserById(userId);

    if (user && (user.Privilegios === 'Simples' || user.Privilegios === 'Intermediario' || user.Privilegios === 'Avancado')) {
      req.user = {
        id: userId,
        // Outras informações do usuário, se necessário
      };
      next();
    } else {
      return res.status(403).json({ error: 'Acesso não autorizado para este nível de privilégios!' });
    }
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido ou expirado!' });
  }
}

async function verifyMedioAuth(req, res, next) {
  const token = req.query.token;

  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido!' });
  }

  // Verifica se o token não foi revogado (está na lista de tokens inválidos)
  if (isTokenRevoked(token)) {
    return res.status(401).json({ error: 'Token inválido ou expirado!' });
  }

  try {
    const decoded = jwt.verify(token, secret);
    const userId = decoded.sub;

    const user = await getUserById(userId);

    if (user && (user.Privilegios === 'Avancado' || user.Privilegios === 'Intermediario')) {
      req.user = {
        id: userId,
        // Outras informações do usuário, se necessário
      };
      next();
    } else {
      return res.status(403).json({ error: 'Acesso não autorizado para este nível de privilégios!' });
    }
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido ou expirado!' });
  }
}



async function getUserById(userId) {
  try {
    const usuarios = db.collection('Employees');
    const user = await usuarios.document(userId);
    return user; // Retorna o documento completo do usuário
  } catch (error) {
    throw error;
  }
}

async function verifyAvancadoAuth(req, res, next) {
  const token = req.query.token;

  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido!' });
  }

  // Verifica se o token não foi revogado (está na lista de tokens inválidos)
  if (isTokenRevoked(token)) {
    return res.status(401).json({ error: 'Token inválido ou expirado!' });
  }

  try {
    const decoded = jwt.verify(token, secret);
    const userId = decoded.sub;

    const user = await getUserById(userId);

    if (user && user.Privilegios === 'Avancado') {
      // Se o usuário tiver o atributo 'Privilegios' igual a 'Avancado', continue para a próxima função de middleware
      next();
    } else {
      return res.status(403).json({ error: 'Acesso não autorizado!' });
    }
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido ou expirado!' });
  }
}

router.get('/', verifySimplesAuth, (req, res) => {
  // Retornar alguma informação sobre o usuário ou sobre o token
  res.json({ user: req.user, token: req.query.token });
});


module.exports = {
  verifySimplesAuth,
  getUserById,
  revokeToken,
  isTokenRevoked,
  verifyAvancadoAuth,
  verifyMedioAuth,
  router
};
