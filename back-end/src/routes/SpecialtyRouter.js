const express = require('express');
const app = express();
const router = express.Router();
const { Database, aql } = require('arangojs');
const { verifyTokenAndUser } = require('../../middlewares/authMiddleware');
const { getSpecialtyIdByName, getSpecialtyNameById} = require('./OtherFunctions');
const jwt = require('jsonwebtoken');

// Importar as configurações do banco de dados
const { dbUrl, dbName, dbUser, dbPass } = require('../../config');

// Criar uma instância do banco de dados ArangoDB
const db = new Database({
    url: dbUrl,
    databaseName: dbName,
    auth: { username: dbUser, password: dbPass },
});

// Defina a coleção 'Specialties'
const specialtiesCollection = db.collection('Specialties');

// Rota para adicionar uma especialidade
router.post('/addSpecialty', verifyTokenAndUser, async (req, res) => {
    try {
        const { name, description } = req.body;

        // Verifique se o nome da especialidade já existe
        const query = aql`
            FOR specialty IN Specialties
            FILTER specialty.name == ${name}
            LIMIT 1
            RETURN specialty
        `;

        const cursor = await db.query(query);
        const existingSpecialty = await cursor.next();

        if (existingSpecialty) {
            return res.status(400).json({ error: 'A especialidade já existe.' });
        }

        // Se não existir uma especialidade com o mesmo nome, insira a nova especialidade na coleção 'Specialties'
        const newSpecialty = await specialtiesCollection.save({ name, description });

        res.json({ message: 'Especialidade adicionada com sucesso!', newSpecialty });
    } catch (error) {
        console.error('Erro ao adicionar especialidade:', error);
        res.status(500).json({ error: 'Ocorreu um erro ao adicionar a especialidade.' });
    }
});



// Rota para buscar o ID da especialidade pelo nome
router.get('/SpecialtyIdByName/:name', verifyTokenAndUser, async (req, res) => {
    const { name } = req.params;
    try {
        const specialtyId = await getSpecialtyIdByName(name);
        if (specialtyId) {
            res.json({ specialtyId });
        } else {
            res.status(404).json({ error: 'Especialidade não encontrada.' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Ocorreu um erro ao buscar a especialidade.' });
    }
});
/* 
// Rota para buscar o nome da especialidade pelo ID
router.get('/SpecialtyNameById/:id', verifyTokenAndUser, async (req, res) => {
    const { id } = req.params;
    try {
        const specialtyName = await getSpecialtyNameById(id);
        if (specialtyName) {
            res.json({ specialtyName });
        } else {
            res.status(404).json({ error: 'Especialidade não encontrada.' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Ocorreu um erro ao buscar a especialidade.' });
    }
}); */

router.get('/all', verifyTokenAndUser, async (req, res) => {
    try {
        const query = aql`
        FOR Specialties IN Specialties
          RETURN Specialties
      `;

        const cursor = await db.query(query);
        const specialtyy = await cursor.all();

        res.json(specialtyy);
    } catch (error) {
        console.error('Erro ao buscar especialidades:', error);
        res.status(500).json({ error: 'Erro ao buscar especialidades' });
    }
});

router.get('/specialists/:specialtyId', verifyTokenAndUser, async (req, res) => {
    let { specialtyId } = req.params;

    // Adicione o prefixo 'Specialties/' ao parâmetro specialtyId
    specialtyId = `Specialties/${specialtyId}`;

    try {
        const query = aql`
            FOR person IN Person
            FILTER person.specialtyId == ${specialtyId}
            RETURN person
        `;

        const cursor = await db.query(query);
        const specialists = await cursor.all();

        res.json(specialists);
    } catch (error) {
        console.error('Erro ao buscar especialistas da especialidade:', error);
        res.status(500).json({ error: 'Erro ao buscar especialistas da especialidade' });
    }
});




module.exports = router;