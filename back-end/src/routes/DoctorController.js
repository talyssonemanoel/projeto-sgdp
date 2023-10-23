const express = require('express');
const app = express();
const router = express.Router();
const { Database, aql } = require('arangojs');
const bcrypt = require('bcrypt');

const jwt = require('jsonwebtoken');
const { verifyAdminPermission } = require('../../middlewares/authMiddleware'); // Importe o middleware de autenticação
const { generateUniqueUsername, generateRandomPassword, sendLoginCredentials } = require('./OtherFunctions');

// Importar as configurações do banco de dados
const { dbUrl, dbName, dbUser, dbPass } = require('../../config');

// Criar uma instância do banco de dados ArangoDB
const db = new Database({
    url: dbUrl,
    databaseName: dbName,
    auth: { username: dbUser, password: dbPass },
});

// Middleware para permitir o uso do JSON no corpo da requisição
app.use(express.json());

const collectionName = 'Person';

// Rota para adicionar médicos com verificação de autenticação
router.post('/add', verifyAdminPermission, async (req, res) => {
    try {
        const requiredFields = [];
        for (const field of requiredFields) {
            if (!req.body[field]) {
                return res.status(400).json({ error: `Campo '${field}' é obrigatório.` });
            }
        }

        const doctorData = {
            name: req.body.name,
            cpf: req.body.cpf,
            phone: req.body.phone,
            crm: req.body.crm || '',
            specialtyId: req.body.specialtyId, // Vincula o _id da especialidade
            address: req.body.address || '',
            email: req.body.email || '',
            dateOfBirth: req.body.dateOfBirth || '',
            sex: req.body.sex || '',
            healthPlan: req.body.healthPlan || '',
            startTime: req.body.startTime || '',
            endTime: req.body.endTime || '',
            residente: req.body.residente, // Novo campo residente
        };

        // Insere os dados do médico na coleção
        const result = await db.collection(collectionName).save(doctorData);

        // Obtém o _id do médico criado
        const doctorId = result._id;
        
        // Gerar o atributo 'username' com base no nome
        const username = await generateUniqueUsername(req.body.name);

        // Gerar uma senha aleatória
        const password = generateRandomPassword();

        // Criar um hash da senha usando bcrypt
        const hashedPassword = await bcrypt.hash(password, 10); // Use o valor de salt apropriado

        // Dados do usuário a serem inseridos na coleção 'usuarios'
        const userData = {
            nome: req.body.name,
            username: username,
            password: hashedPassword, // Salva o hash da senha
            email: req.body.email, // Email do especialista
            doctorId: doctorId, // Vincula o _id do médico
        };

        // Insere os dados do usuário na coleção 'usuarios'
        const userResult = await db.collection('usuarios').save(userData);

        // Atualize o atributo 'personId' na coleção 'Person' para vincular ao _id do usuário
        const personUpdateResult = await db.collection(collectionName).update(doctorId, {
            personId: userResult._id
        });

        res.status(201).json({ message: 'Especialista adicionado com sucesso', result });

        // Envie um email com as credenciais de login
        await sendLoginCredentials(req.body.email, username, password);
    } catch (error) {
        console.error('Erro ao adicionar especialista:', error);
        res.status(500).json({ error: 'Erro ao adicionar especialista' });
    }
});


// Rota para buscar todos os médicos
router.get('/search', verifyAdminPermission, async (req, res) => {
    try {
        const query = aql`
        FOR doctor IN Person
        FILTER !IS_NULL(doctor.residente)
          RETURN doctor
      `;
        const cursor = await db.query(query);
        const doctors = await cursor.all();

        res.json(doctors);
    } catch (error) {
        console.error('Erro ao buscar médicos:', error);
        res.status(500).json({ error: 'Erro ao buscar médicos' });
    }
});

router.get('/search/:query', verifyAdminPermission, async (req, res) => {
    try {
        const queryValue = req.params.query; // Valor da busca na URL

        // Constrói a consulta AQL para buscar um médico por ID, nome, CPF, CRM ou residente
        const query = aql`
        FOR doctor IN Person
          FILTER doctor._key == ${queryValue} ||
          LIKE(doctor.name, CONCAT(${queryValue}, '%'), true) ||
                 doctor.cpf == ${queryValue} ||
                 doctor.crm == ${queryValue} ||
                 doctor.residente == ${queryValue}
          RETURN doctor
      `;

        const cursor = await db.query(query);
        const doctors = await cursor.all();

        res.json(doctors);
    } catch (error) {
        console.error('Erro ao buscar médico:', error);
        res.status(500).json({ error: 'Erro ao buscar médico' });
    }
});

// Rota para excluir um especialista por _key
router.delete('/:key', verifyAdminPermission, async (req, res) => {
    try {
        const key = req.params.key; // Obtém o _key a partir dos parâmetros da URL

        // Primeiro, obtenha o médico da coleção 'Person' para obter o 'personId'
        const doctor = await db.collection(collectionName).document(key);

        if (!doctor) {
            return res.status(404).json({ error: 'Especialista não encontrado' });
        }

        // Obtenha o 'personId' do médico
        const personId = doctor.personId;

        // Remova o médico da coleção 'Person'
        const resultPerson = await db.collection(collectionName).remove(key);

        // Verifique se a operação de remoção na coleção 'Person' foi bem-sucedida
        if (!resultPerson) {
            return res.status(404).json({ error: 'Especialista não encontrado' });
        }

        // Em seguida, remova o usuário da coleção 'usuarios' usando o 'personId'
        const user = await db.collection('usuarios').document(personId);

        if (user) {
            const resultUser = await db.collection('usuarios').remove(personId);
            if (!resultUser) {
                return res.status(500).json({ error: 'Erro ao excluir o usuário vinculado' });
            }
        }

        res.status(204).json({ message: 'Especialista excluído com sucesso' });
    } catch (error) {
        console.error('Erro ao excluir especialista:', error);
        res.status(500).json({ error: 'Erro ao excluir especialista' });
    }
});

// Rota para editar um especialista por _key
router.put('/:key', verifyAdminPermission, async (req, res) => {
    try {
        const key = req.params.key; // Obtém o _key a partir dos parâmetros da URL
        const updatedData = req.body; // Dados atualizados a partir do corpo da requisição

        // Atualiza os detalhes do especialista com base no _key
        const result = await db.collection(collectionName).update(key, updatedData);

        if (result) {
            res.status(200).json({ message: 'Especialista atualizado com sucesso' });
        } else {
            res.status(404).json({ error: 'Especialista não encontrado' });
        }
    } catch (error) {
        console.error('Erro ao editar especialista:', error);
        res.status(500).json({ error: 'Erro ao editar especialista' });
    }
});

// Rota para buscar médicos ao vivo
router.get('/livesearch', async (req, res) => {
    try {
        // Obter a consulta de busca do parâmetro de consulta 'q'
        const query = req.query.q;

        // Se a consulta de busca não foi fornecida, retornar um erro
        if (!query) {
            return res.status(400).json({ error: 'A consulta de busca é obrigatória.' });
        }

        // Buscar no banco de dados os médicos cujos nomes correspondem à consulta de busca
        // Aqui estamos usando uma consulta AQL para buscar no ArangoDB
        const cursor = await db.query(aql`
            FOR doc IN Person
            FILTER CONTAINS(LOWER(doc.Nome), LOWER(${query})) && HAS(doc, "specialtyId")
            RETURN doc
        `);

        // Converter o cursor em um array de resultados
        const results = await cursor.all();

        // Enviar os resultados para o cliente
        res.json(results);
    } catch (error) {
        console.error('Erro ao buscar médicos:', error);
        res.status(500).json({ error: 'Erro ao buscar médicos' });
    }
});



module.exports = router;
