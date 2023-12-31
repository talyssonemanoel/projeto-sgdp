const express = require('express');
const app = express();
const router = express.Router();
const { Database, aql } = require('arangojs');
const jwt = require('jsonwebtoken');
const { verifySimplesAuth } = require('../../middlewares/authMiddleware'); // Importe o middleware de autenticação

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

// Rota para adicionar um paciente
router.post('/add', verifySimplesAuth, async (req, res) => {
    try {
        const {
            nome,
            dataDeNascimento,
            cartaoSus,
            rg,
            cpf,
            etnia,
            escolaridade,
            estadoCivil,
            ocupacao,
            nomeDaMae,
            logradouro,
            numeroEndereco,
            complementoEndereco,
            cidade,
            estado,
            email,
            telefone,
            whatsapp,
            contatoEmergencia,
            orientacaoSexual,
            identidadeDeGenero,
            ubsCadastrada,
            acompanhamentoDeSaude,
            observacoes
        } = req.body;


        const patientData = {
            nome,
            dataDeNascimento,
            cartaoSus,
            rg,
            cpf,
            etnia,
            escolaridade,
            estadoCivil,
            ocupacao,
            nomeDaMae,
            logradouro,
            numeroEndereco,
            complementoEndereco,
            cidade,
            estado,
            email,
            telefone,
            whatsapp,
            contatoEmergencia,
            orientacaoSexual,
            identidadeDeGenero,
            ubsCadastrada,
            acompanhamentoDeSaude,
            observacoes
        };

        // Insere os dados do paciente na coleção
        const result = await db.collection(collectionName).save(patientData);
        res.status(201).json({ message: 'Paciente adicionado com sucesso', result });
    } catch (error) {
        console.error('Erro ao adicionar paciente:', error);
        res.status(500).json({ error: 'Erro ao adicionar paciente' });
    }
});

// Rota para buscar todos os pacientes
router.get('/search', verifySimplesAuth, async (req, res) => {
    try {
        const query = aql`
        FOR person IN Person
          FILTER IS_NULL(person.residente) // Descarta médicos
          RETURN person
      `;

        const cursor = await db.query(query);
        const patients = await cursor.all();

        res.json(patients);
    } catch (error) {
        console.error('Erro ao buscar pacientes:', error);
        res.status(500).json({ error: 'Erro ao buscar pacientes' });
    }
});

router.get('/search/:query', verifySimplesAuth, async (req, res) => {
    try {
        const query = req.params.query; // Valor da busca na URL

        // Se a consulta de busca não foi fornecida, retornar um erro
        if (!query) {
            return res.status(400).json({ error: 'A consulta de busca é obrigatória.' });
        }

        // Buscar no banco de dados os pacientes cujos nomes contenham a consulta de busca
        // Usando LIKE e CONCAT para pesquisar nomes incompletos
        const attributeQuery = aql`
            FOR person IN Person
            FILTER IS_NULL(person.residente) &&
                (CONTAINS(LOWER(person.Nome), LOWER(${query})) || 
                 CONTAINS(LOWER(person.Nome), LOWER(CONCAT(${query}, "*"))) ||
                 person.cpf == ${query} ||
                 person.Telefone == ${query} ||
                 person.Sexo == ${query} ||
                 DATE_FORMAT(person.DataDeNascimento, "%Y") == ${query})
            RETURN person
        `;

        const cursor = await db.query(attributeQuery);
        const patients = await cursor.all();

        res.json(patients);
    } catch (error) {
        console.error('Erro ao buscar pacientes por atributos:', error);
        res.status(500).json({ error: 'Erro ao buscar pacientes por atributos' });
    }
});


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
            FILTER CONTAINS(LOWER(doc.nome), LOWER(${query}))
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

router.get('/livesearch-prontuario', async (req, res) => {
    try {
        const query = req.query.q;
        const ambulatorio = req.query.ambulatorio;

        if (!query || !ambulatorio) {
            return res.status(400).json({ error: 'A consulta de busca e o ambulatório são obrigatórios.' });
        }

        const cursor = await db.query(aql`
            FOR doc IN Person
            FILTER CONTAINS(LOWER(doc.nome), LOWER(${query}))
            LET relatedServices = (
                FOR service IN Service
                FILTER service.keyPaciente == doc._key && service.ambulatorio == ${ambulatorio}
                RETURN service
            )
            FILTER LENGTH(relatedServices) > 0
            RETURN doc
        `);

        const results = await cursor.all();

        res.json(results);
    } catch (error) {
        console.error('Erro ao buscar médicos:', error);
        res.status(500).json({ error: 'Erro ao buscar médicos' });
    }
});



router.put('/update/:id', verifySimplesAuth, async (req, res) => {
    try {
        const patientId = req.params.id;
        const autorID = req.user.id;
        const updatedData = req.body; // Os dados atualizados devem estar no corpo da requisição

        // Verifique se o paciente com o ID fornecido existe
        const patient = await db.collection(collectionName).document(patientId);

        if (!patient) {
            return res.status(404).json({ error: 'Paciente não encontrado' });
        }

        // Crie um campo "comentarios" no documento se ainda não existir
        if (!patient.comentarios) {
            patient.comentarios = [];
        }

        for (const key in updatedData) {
            if (updatedData.hasOwnProperty(key)) {
                // Obtenha o valor anterior
                const valorAnterior = patient[key];

                // Registre a alteração no campo "comentarios" do paciente
                patient.comentarios.push({
                    campo: key,
                    valorAnterior,
                    valorNovo: updatedData[key],
                    dataHora: new Date(),
                    autorAlteracao: autorID, // Suponha que você tenha informações sobre o autor da alteração na requisição.
                });

                // Atualize o valor do campo original
                patient[key] = updatedData[key];
            }
        }

        // Salve as atualizações na coleção
        const result = await db.collection(collectionName).update(patientId, patient);

        res.json({ message: 'Paciente atualizado com sucesso', result });
    } catch (error) {
        console.error('Erro ao atualizar paciente:', error);
        res.status(500).json({ error: 'Erro ao atualizar paciente' });
    }
});





router.get('/', async (req, res) => {
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
                FILTER doc._key == ${query}
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

router.get('/GetPatientByKey', async (req, res) => {
    try {
        // Obter o valor do parâmetro patientKey da consulta
        const patientKey = req.query.q;

        // Verifique se o parâmetro patientKey foi fornecido na consulta
        if (!patientKey) {
            return res.status(400).json({ error: 'O parâmetro patientKey é obrigatório.' });
        }

        // Construa uma consulta AQL para buscar documentos na coleção Atendimentos onde _from corresponde ao patientKey e ambulatorio corresponde ao valor fornecido
        const query = aql`
            FOR patient IN Person
            FILTER patient._key == ${patientKey}
            RETURN patient
        `;

        // Execute a consulta no banco de dados
        const cursor = await db.query(query);
        const paciente = await cursor.next();

        // Envie os documentos encontrados como resposta
        res.json(paciente);
    } catch (error) {
        console.error('Erro ao buscar paciente por patientKey:', error);
        res.status(500).json({ error: 'Erro ao buscar atendimentos por patientKey' });
    }
});


module.exports = router;
