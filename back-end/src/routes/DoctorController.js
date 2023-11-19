const express = require('express');
const app = express();
const router = express.Router();
const { Database, aql } = require('arangojs');
const bcrypt = require('bcrypt');
const moment = require('moment'); // Importe a biblioteca 'moment' para trabalhar com datas e horas
const uuid = require('uuid');
const _ = require('lodash');

const { verifyAvancadoAuth, verifySimplesAuth } = require('../../middlewares/authMiddleware'); // Importe o middleware de autenticação
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

const collectionName = 'Employees';

// Rota para adicionar funcionários com verificação de autenticação
router.post('/add', verifyAvancadoAuth, async (req, res) => {
    try {
        const requiredFields = ['nome', 'CPF', 'ocupacaoAmbulatorio', 'Email'];
        for (const field of requiredFields) {
            if (!req.body[field]) {
                return res.status(400).json({ error: `Campo '${field}' é obrigatório.` });
            }
        }

        const { nome, endereco, ocupacaoAmbulatorio, CPF, nomeEspecialidade, Email } = req.body;

        let employeeData = {
            nome,
            endereco,
            ocupacaoAmbulatorio,
            CPF,
            nomeEspecialidade,
            Email, // Adicione o campo de email para Employees
        };

        // Gere o atributo 'username' com base no nome
        const username = await generateUniqueUsername(nome);

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
        await sendLoginCredentials(Email, username, password);
    } catch (error) {
        console.error('Erro ao adicionar funcionário:', error);
        res.status(500).json({ error: 'Erro ao adicionar funcionário' });
    }
});

router.get('/search', verifyAvancadoAuth, async (req, res) => {
    try {
        const query = aql`
            FOR employee IN Employees
            LET employeeData = UNSET(employee, "password")
            RETURN employeeData
        `;
        const cursor = await db.query(query);
        const employees = await cursor.all();

        res.json(employees);
    } catch (error) {
        console.error('Erro ao buscar funcionários:', error);
        res.status(500).json({ error: 'Erro ao buscar funcionários' });
    }
});

router.get('/search/:query', verifyAvancadoAuth, async (req, res) => {
    try {
        const queryValue = req.params.query; // Valor da busca na URL

        // Constrói a consulta AQL para buscar um funcionário por ID, Nome, CPF ou OcupacaoAmbulatorio
        const query = aql`
            FOR employee IN Employees
            FILTER employee._key == ${queryValue} ||
                   LIKE(employee.nome, CONCAT(${queryValue}, '%'), true) ||
                   employee.CPF == ${queryValue} ||
                   LIKE(employee.ocupacaoAmbulatorio, CONCAT(${queryValue}, '%'), true)
            RETURN employee
        `;

        const cursor = await db.query(query);
        const employees = await cursor.all();

        res.json(employees);
    } catch (error) {
        console.error('Erro ao buscar funcionário:', error);
        res.status(500).json({ error: 'Erro ao buscar funcionário' });
    }
});

//ROTA PARA APAGAR PROFISSIONAL COM SEGURANÇA DE LOG

router.delete('/:key', verifyAvancadoAuth, async (req, res) => {
    try {
        const key = req.params.key; // Obtém a chave a partir dos parâmetros da URL

        // Passo 1: Obter os detalhes atuais do especialista
        const query = `
            FOR doc IN ${collectionName}
            FILTER doc._key == @key
            RETURN doc
        `;

        const currentData = await db.query(query, { key }).then((cursor) => cursor.next());

        if (currentData) {
            // Passo 2: Inserir as informações atuais no 'logData'
            const logData = {
                _key: uuid.v4(),
                author: req.user.id, // Autor da modificação a partir do usuário autenticado
                timestamp: moment().format('YYYY-MM-DD HH:mm:ss'), // Hora e data da modificação
                oldData: currentData, // Dados atuais que foram excluídos
            };

            // Insira 'logData' na coleção 'logData'
            const logResult = await db.collection('logData').save(logData);

            // Passo 3: Excluir o especialista da coleção principal
            const deleteQuery = `
                FOR doc IN ${collectionName}
                FILTER doc._key == @key
                REMOVE doc IN ${collectionName}
                RETURN OLD
            `;

            const deleteResult = await db.query(deleteQuery, { key });

            if (deleteResult) {
                res.status(200).json({ message: 'Especialista excluído com sucesso' });
            } else {
                res.status(404).json({ error: 'Especialista não encontrado' });
            }
        } else {
            res.status(404).json({ error: 'Especialista não encontrado' });
        }
    } catch (error) {
        console.error('Erro ao excluir especialista:', error);
        res.status(500).json({ error: 'Erro ao excluir especialista' });
    }
});

//ROTA PARA ATUALIZAR INFORMAÇÕES DO PROFISSIONAL COM SEGURANÇA DE LOG

router.put('/:key', verifyAvancadoAuth, async (req, res) => {
    try {
        const key = req.params.key; // Obtém o _key a partir dos parâmetros da URL
        const updatedData = req.body; // Dados atualizados a partir do corpo da requisição

        // Passo 1: Obter os detalhes atuais do especialista
        const query = `
            FOR doc IN ${collectionName}
            FILTER doc._key == @key
            RETURN doc
        `;

        const currentData = await db.query(query, { key }).then((cursor) => cursor.next());

        if (currentData) {
            // Passo 2: Determinar as informações alteradas
            const changes = {};

            for (const key in updatedData) {
                if (!_.isEqual(updatedData[key], currentData[key])) {
                    changes[key] = currentData[key];
                }
            }

            // Passo 3: Inserir as informações antigas alteradas em 'logData'
            if (Object.keys(changes).length > 0) {
                const logData = {
                    _key: uuid.v4(),
                    author: req.user.id, // Autor da modificação a partir do usuário autenticado
                    timestamp: moment().format('YYYY-MM-DD HH:mm:ss'), // Hora e data da modificação
                    oldData: changes, // Dados antigos que foram alterados
                };

                // Insira 'logData' na coleção 'logData'
                const logResult = await db.collection('logData').save(logData);
            }

            // Passo 4: Atualizar os detalhes do especialista na coleção principal
            const updateQuery = `
                FOR doc IN ${collectionName}
                FILTER doc._key == @key
                UPDATE doc WITH @updatedData IN ${collectionName} OPTIONS { keepNull: false }
                RETURN NEW
            `;

            const updateResult = await db.query(updateQuery, { key, updatedData });

            if (updateResult) {
                res.status(200).json({ message: 'Especialista atualizado com sucesso' });
            } else {
                res.status(404).json({ error: 'Especialista não encontrado' });
            }
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
            FOR doc IN Employees
            FILTER CONTAINS(LOWER(doc.nome), LOWER(${query})) && doc.ocupacaoAmbulatorio == "Especialista"
            RETURN doc
        `);

        // Converter o cursor em um array de resultados
        const results = await cursor.all();

        // Enviar os resultados para o cliente
        res.json(results);
    } catch (error) {
        console.error('Erro ao buscar médicos1:', error);
        res.status(500).json({ error: 'Erro ao buscar médicos2' });
    }
});

router.get('/livesearchspecialty', async (req, res) => {
    try {
        // Obter a consulta de busca do parâmetro de consulta 'q'
        const query = req.query.q;
        const query2 = req.query.specialty;

        console.log(query2)

        // Se a consulta de busca não foi fornecida, retornar um erro
        if (!query) {
            return res.status(400).json({ error: 'A consulta de busca é obrigatória.' });
        }

        if (!query2) {
            return res.status(400).json({ error: 'A consulta de busca é obrigatória.' });
        }

        // Buscar no banco de dados os médicos cujos nomes correspondem à consulta de busca
        // Aqui estamos usando uma consulta AQL para buscar no ArangoDB
        const cursor = await db.query(aql`
            FOR doc IN Employees
            FILTER CONTAINS(LOWER(doc.nome), LOWER(${query})) && doc.ocupacaoAmbulatorio == "Especialista" && doc.nomeEspecialidade == ${query2}
            RETURN doc
        `);

        // Converter o cursor em um array de resultados
        const results = await cursor.all();

        // Enviar os resultados para o cliente
        res.json(results);
    } catch (error) {
        console.error('Erro ao buscar médicos1:', error);
        res.status(500).json({ error: 'Erro ao buscar médicos2' });
    }
});



module.exports = router;
