const express = require('express');
const jwt = require('jsonwebtoken');
const { Database, aql } = require('arangojs');
// Importar as configurações do banco de dados
const { dbUrl, dbName, dbUser, dbPass, secret } = require('../config');
const { sendLoginCredentials, generateRandomPassword } = require('../src/routes/OtherFunctions');

// Criar uma instância do banco de dados ArangoDB
const db = new Database({
    url: dbUrl,
    databaseName: dbName,
    auth: { username: dbUser, password: dbPass },
});

const app = express();
const router = express.Router();
const { verifyTokenAndUser, verifyAdminPermission, getUserById} = require('./authMiddleware');

router.post('/reset-password', verifyTokenAndUser, async (req, res) => {
  try {
    // Gerar uma nova senha aleatória
    const newPassword = generateRandomPassword();

    // Hash da nova senha (se necessário)
    // ...

    // Atualizar a senha no banco de dados (se necessário)
    // ...

    // Obter o email do usuário com base no userId do token
    const userId = req.user.id;
    const user = await getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    
    // Envie a nova senha por email
    const email = user.email;
    await sendLoginCredentials(email, req.user.username, newPassword);

    res.json({ message: 'Senha redefinida com sucesso. Verifique seu email para a nova senha.' });
  } catch (error) {
    console.error('Erro ao redefinir a senha:', error);
    res.status(500).json({ error: 'Erro ao redefinir a senha' });
  }
});



router.get('/', verifyTokenAndUser, (req, res) => {
  // Retornar alguma informação sobre o usuário ou sobre o token
  res.json({ user: req.user, token: req.query.token });
});

router.get('/admin', verifyAdminPermission, (req, res) => {
  // Retornar alguma informação sobre o usuário ou sobre o token
  res.json({ user: req.user, token: req.query.token });
});


router.get('/get-nome', verifyTokenAndUser, async (req, res) => {
  try {
    const user = await getUserById(req.user.id);
    res.json({ nome: user.nome }); // Retorna o campo 'nome' do documento do usuário
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar o nome do usuário' });
  }
});

// Rota para obter os detalhes do usuário dono do token
router.get('/user-details', verifyTokenAndUser, async (req, res) => {
  try {
      const token = req.query.token;
      const decoded = jwt.verify(token, secret);
      const userId = decoded.sub;

      const user = await getUserById(req.user.id);

      if (user) {
          // Aqui você pode obter detalhes do usuário e de 'Person' usando as informações do usuário
          // Por exemplo, você pode usar o ID do médico vinculado ao usuário para obter detalhes de 'Person'

          // Suponha que você tenha o ID do médico no campo 'doctorId' do usuário
          const doctorId = user.doctorId;

          // Agora, você pode buscar detalhes de 'Person' usando o doctorId
          const personCollection = db.collection('Person');
          const personDetails = await personCollection.document(doctorId);

          // Remova a senha do objeto de usuário antes de retornar os detalhes
          delete user.password;

          // Retorne os detalhes do usuário e de 'Person' (sem a senha)
          res.json({ user, personDetails });
      } else {
          res.status(404).json({ error: 'Usuário não encontrado' });
      }
  } catch (error) {
      console.error('Erro ao obter detalhes do usuário:', error);
      res.status(500).json({ error: 'Erro ao obter detalhes do usuário' });
  }
});

// Rota para atualizar os detalhes do usuário e da pessoa dono do token
router.put('/user-details', verifyTokenAndUser, async (req, res) => {
  try {
      const token = req.query.token;
      const decoded = jwt.verify(token, secret);
      const userId = decoded.sub;

      // Obter os dados enviados no corpo da requisição
      const data = req.body;

      // Validar os dados (se necessário)
      // ...

      // Atualizar o documento do usuário no banco de dados usando o userId
      const userCollection = db.collection('usuarios');
      await userCollection.update(userId, data);

      // Obter o doctorId do usuário atualizado
      const user = await userCollection.document(userId);
      const doctorId = user.doctorId;

      // Atualizar o documento da pessoa no banco de dados usando o doctorId
      const personCollection = db.collection('Person');
      await personCollection.update(doctorId, data);

      // Retornar uma mensagem de sucesso
      res.json({ message: 'Detalhes do usuário e da pessoa atualizados com sucesso' });
  } catch (error) {
      console.error('Erro ao atualizar detalhes do usuário e da pessoa:', error);
      res.status(500).json({ error: 'Erro ao atualizar detalhes do usuário e da pessoa' });
  }
});




module.exports = router;