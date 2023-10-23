const express = require('express');
const app = express();
const router = express.Router();
const { Database, aql } = require('arangojs');
const jwt = require('jsonwebtoken');
const { verifyTokenAndUser } = require('../../middlewares/authMiddleware'); // Importe o middleware de autenticação

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
router.post('/add', verifyTokenAndUser, async (req, res) => {
    try {
        const {
            Nome, // Modifique 'name' para 'Nome'
            DataDeNascimento, // Modifique 'dateOfBirth' para 'Data de Nascimento'
            Ocupacao, // Adicione 'Ocupação'
            IdentidadeDeGenero, // Adicione 'Identidade de Gênero'
            OrientacaoSexual, // Adicione 'Orientação Sexual'
            CarteiraNacionalDeSaude, // Adicione 'Carteira Nacional de Saúde'
            UBScadastrada, // Adicione 'UBS cadastrada'
            Endereco, // Modifique 'address' para 'Endereço'
            Bairro, // Adicione 'Bairro'
            Telefone // Adicione 'Telefone'
        } = req.body;


        const patientData = {
            Nome,
            DataDeNascimento,
            Ocupacao,
            IdentidadeDeGenero,
            OrientacaoSexual,
            CarteiraNacionalDeSaude,
            UBScadastrada,
            Endereco,
            Bairro,
            Telefone,
            // Se quiser manter os outros atributos do paciente, você pode adicioná-los aqui.
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
router.get('/search', verifyTokenAndUser, async (req, res) => {
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

router.get('/search/:query', verifyTokenAndUser, async (req, res) => {
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
            FILTER CONTAINS(LOWER(doc.Nome), LOWER(${query}))
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
// Rota para atualizar um paciente por ID
router.put('/update/:id', verifyTokenAndUser, async (req, res) => {
    try {
        const patientId = req.params.id;
        const updatedData = req.body; // Os dados atualizados devem estar no corpo da requisição

        // Verifique se o paciente com o ID fornecido existe
        const patient = await db.collection(collectionName).document(patientId);

        if (!patient) {
            return res.status(404).json({ error: 'Paciente não encontrado' });
        }

        // Atualize os atributos do paciente com os dados fornecidos
        const updatedPatient = Object.assign(patient, updatedData);

        // Salve as atualizações na coleção
        const result = await db.collection(collectionName).update(patientId, updatedPatient);

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

module.exports = router;
