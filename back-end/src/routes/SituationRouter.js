const express = require('express');
const router = express.Router();
const { Database } = require('arangojs');
const { verifyTokenAndUser } = require('../../middlewares/authMiddleware');

// Importar as configurações do banco de dados
const { dbUrl, dbName, dbUser, dbPass } = require('../../config');

// Criar uma instância do banco de dados ArangoDB
const db = new Database({
    url: dbUrl,
    databaseName: dbName,
    auth: { username: dbUser, password: dbPass },
});

// Middleware para permitir o uso do JSON no corpo da requisição
router.use(express.json());

const collectionName = 'Situation';

// Rota para adicionar uma folha de estado associada a um agendamento
router.post('/add/:appointmentId', verifyTokenAndUser, async (req, res) => {
    try {
        const { appointmentId } = req.params;
        const { description, medications } = req.body;

        // Verifica se os campos obrigatórios foram fornecidos
        if (!appointmentId || !description || !medications) {
            return res.status(400).json({ error: 'Agendamento, descrição do estado e medicamentos são obrigatórios.' });
        }

        // Verifica se o agendamento com o ID fornecido existe no banco de dados
        const appointment = await db.collection('Service').document(appointmentId);
        if (!appointment) {
            return res.status(404).json({ error: 'Agendamento não encontrado.' });
        }

        const situationData = {
            appointmentId,
            description,
            medications,
        };

        // Insere os dados da folha de estado na coleção
        const result = await db.collection(collectionName).save(situationData);
        res.status(201).json({ message: 'Folha de estado adicionada com sucesso', result });
    } catch (error) {
        console.error('Erro ao adicionar folha de estado:', error);
        res.status(500).json({ error: 'Erro ao adicionar folha de estado' });
    }
});

module.exports = router;
