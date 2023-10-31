const express = require('express');
const app = express();
const router = express.Router();
const { Database, aql } = require('arangojs');
const bcrypt = require('bcrypt');

const jwt = require('jsonwebtoken');
const { verifyAdminPermission, verifySimplesAuth } = require('../../middlewares/authMiddleware'); // Importe o middleware de autenticação
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

// Rota para adicionar funcionários com verificação de autenticação
router.post('/add', verifyAdminPermission, async (req, res) => {
    try {
        const requiredFields = ['Nome', 'OcupacaoAmbulatorio', 'email'];
        for (const field of requiredFields) {
            if (!req.body[field]) {
                return res.status(400).json({ error: `Campo '${field}' é obrigatório.` });
            }
        }

        const { Nome, OcupacaoAmbulatorio, specialtyId, patientId, email } = req.body;

        let employeeData = {
            Nome,
            OcupacaoAmbulatorio,
            email, // Adicione o campo de email para Employees
        };

        if (OcupacaoAmbulatorio === 'Gerenciador') {
            employeeData.Privilegios = 'Avancado';
        } else if (OcupacaoAmbulatorio === 'Agendador') {
            employeeData.Privilegios = 'Intermediario';
        } else {
            // Para outros casos (Especialistas, Vacinacao, etc.)
            employeeData.Privilegios = 'Simples';
        }

        if (specialtyId) {
            employeeData.specialtyId = specialtyId;
        }

        if (patientId) {
            employeeData.patientId = patientId;
        }

        // Gere o atributo 'username' com base no nome
        const username = await generateUniqueUsername(Nome);

        // Gere uma senha aleatória
        const password = generateRandomPassword();

        // Crie um hash da senha usando bcrypt
        const hashedPassword = await bcrypt.hash(password, 10); // Use o valor de salt apropriado

        // Adicione 'username' e 'password' diretamente na coleção 'Employees'
        employeeData.username = username;
        employeeData.password = hashedPassword;

        // Insira os dados do funcionário na coleção 'Employees'
        const result = await db.collection('Employees').save(employeeData);

        res.status(201).json({ message: 'Funcionário adicionado com sucesso', result });

        // Envie um email com as credenciais de login
        await sendLoginCredentials(email, username, password);
    } catch (error) {
        console.error('Erro ao adicionar funcionário:', error);
        res.status(500).json({ error: 'Erro ao adicionar funcionário' });
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
router.get('/livesearch', verifySimplesAuth, async (req, res) => {
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
