const express = require('express');
const app = express();
const router = express.Router();
const { Database } = require('arangojs');
const { verifySimplesAuth } = require('../../middlewares/authMiddleware');
const { extractAuthorId } = require('./OtherFunctions');
const jwt = require("jsonwebtoken");
const aql = require('arangojs').aql;

// Importar as configurações do banco de dados
const { dbUrl, dbName, dbUser, dbPass, secret } = require('../../config');

// Criar uma instância do banco de dados ArangoDB
const db = new Database({
  url: dbUrl,
  databaseName: dbName,
  auth: { username: dbUser, password: dbPass },
});

router.put('/:id', verifySimplesAuth, async (req, res) => {
  try {
    // Obter o ID do agendamento a ser atualizado a partir dos parâmetros da requisição
    const agendamentoId = req.params.id;

    // Obter os dados dos sintomas e orientações a partir do corpo da requisição
    const { _symptoms = [], _orientations = [] } = req.body;

    // Verificar se o ID do agendamento é válido
    if (!agendamentoId) {
      return res.status(400).json({ message: 'Invalid agendamento ID' });
    }

    // Verificar se o agendamento com o ID fornecido existe no banco de dados
    const agendamento = await db.collection('Service').document(agendamentoId);

    if (!agendamento) {
      return res.status(404).json({ message: 'Agendamento not found' });
    }

    // Atualizar os dados do agendamento com os dados de sintomas e orientações recebidos
    agendamento._symptoms = _symptoms;
    agendamento._orientations = _orientations;

    // Salvar o agendamento atualizado no banco de dados
    const result = await db.collection('Service').update(agendamentoId, agendamento);

    // Verificar se a atualização foi bem-sucedida e enviar a resposta
    if (result._id) {
      res.json({ message: 'Agendamento updated successfully', agendamento: result });
    } else {
      res.status(500).json({ message: 'Failed to update agendamento' });
    }
  } catch (error) {
    console.error('Erro ao atualizar agendamento:', error);
    res.status(500).json({ message: 'Erro ao atualizar agendamento', error: error.message });
  }
});
// Rota para adicionar mensagens
router.post("/messages", verifySimplesAuth, async (req, res) => {
  const { mensagem } = req.body;
  const autor = req.user.id; // Obtenha o token JWT do cabeçalho Authorization

  try {
    // Crie um documento com a mensagem no banco de dados
    const messagesCollection = db.collection("Messages");
    const dataHora = new Date().toISOString();

    const messageDocument = {
      mensagem,
      autor,
      dataHora,
    };

    const result = await messagesCollection.save(messageDocument);
    res.status(201).json(result);
  } catch (error) {
    console.error("Erro ao adicionar mensagem:", error);
    res.status(500).json({ error: "Erro ao adicionar mensagem" });
  }
});

router.get('/messages', verifySimplesAuth, async (req, res) => {
  try {
    const query = aql`
      FOR message IN Messages
      LIMIT 10
      LET author = (FOR user IN Employees
                    FILTER user._key == message.autor
                    RETURN user.Nome)[0]
      LET authorParts = SPLIT(author, ' ')
      LET firstName = authorParts[0]
      LET lastName = authorParts[-1]
      RETURN {
        mensagem: message.mensagem,
        autor: CONCAT(firstName, ' ', lastName),
        dataHora: message.dataHora
      }
    `;
    
    const cursor = await db.query(query);
    const messages = await cursor.all();

    res.json({ messages });
  } catch (error) {
    console.error('Erro ao buscar mensagens:', error);
    res.status(500).json({ message: 'Erro ao buscar mensagens', error: error.message });
  }
});




module.exports = router;