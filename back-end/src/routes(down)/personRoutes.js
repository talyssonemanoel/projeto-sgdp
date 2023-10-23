const express = require('express');
const Person = require('../models/Person');
const router = express.Router();
const { Database, aql } = require('arangojs');

// Configurar a conexão com o ArangoDB
const db = new Database({
  url: 'https://lordi.uern.br', // URL do servidor do ArangoDB
  databaseName: 'prontuario',   // Nome do banco de dados
  auth: {                        // Credenciais de autenticação, se necessário
    username: 'prontuario',
    password: 'prontuario'
  }
});

// Função para criar a coleção 'Person' se ela não existir
async function createPersonCollection() {
  const personCollection = db.collection('Person');
  if (!await personCollection.exists()) {
    await personCollection.create();
  }
}
// Cria a coleção 'Person' antes de definir as rotas
createPersonCollection();
// Rota para obter pessoas cadastradas (GET)
router.get('/', async (req, res) => {
  try {
    // Obter a coleção de pessoas
    const personCollection = db.collection('Person');

    // Executar uma consulta para obter todas as pessoas
    const cursor = await personCollection.all();

    // Converter o resultado da consulta para um array
    const personList = await cursor.all();

    // Enviar a lista de pessoas como resposta
    res.json(personList);
  } catch (error) {
    console.error('Erro ao obter a lista de pessoas:', error);
    res.status(500).json({ message: 'Erro ao obter a lista de pessoas' });
  }
});

// Rota para criar uma pessoa (POST)
router.post('/', async (req, res) => {
  // Cria a coleção 'Person' antes de definir as rotas
  createPersonCollection();
  try {
    // Obter os dados da pessoa a partir do corpo da requisição
    const { idNumber, name, cpf } = req.body;

    // Criar uma nova instância da classe Person com os dados recebidos
    const newPerson = new Person(idNumber, name, cpf);

    // Obter a coleção de pessoas
    const personCollection = db.collection('Person');

    // Inserir a nova pessoa no banco de dados
    const result = await personCollection.save(newPerson);

    // Verificar se a inserção foi bem-sucedida e enviar a resposta
    if (result._id) {
      res.status(201).json({ message: 'Person created successfully', person: result });
    } else {
      res.status(500).json({ message: 'Failed to create person' });
    }
  } catch (error) {
    console.error('Erro ao criar pessoa:', error);
    res.status(500).json({ message: 'Erro ao criar pessoa' });
  }
});


// Rota para atualizar uma pessoa (PUT/PATCH)
router.put('/:id', async (req, res) => {
  try {
    // Obter a coleção de pessoas
    const personCollection = db.collection('Person');
    // Obter o ID da pessoa a ser atualizada a partir dos parâmetros da requisição
    const personId = req.params.id;

    // Obter os dados da pessoa atualizados a partir do corpo da requisição
    const { idNumber, name, cpf } = req.body;

    // Verificar se o ID é válido (por exemplo, se é um ID no formato correto)
    // Se não for válido, retornar um erro de requisição inválida
    if (!personId) {
      return res.status(400).json({ message: 'Invalid person ID' });
    }

    // Verificar se a pessoa com o ID fornecido existe no banco de dados
    // Caso não exista, retornar um erro de "Not Found" (404)
    const person = await personCollection.document(personId);
    if (!person) {
      return res.status(404).json({ message: 'Person not found' });
    }

    // Atualizar os dados da pessoa com os dados recebidos
    person.idNumber = idNumber;
    person.name = name;
    person.cpf = cpf;

    // Salvar a pessoa atualizada no banco de dados
    const result = await personCollection.update(personId, person);

    // Verificar se a atualização foi bem-sucedida e enviar a resposta
    if (result._id) {
      res.json({ message: 'Person updated successfully', person: result });
    } else {
      res.status(500).json({ message: 'Failed to update person' });
    }
  } catch (error) {
    console.error('Erro ao atualizar pessoa:', error);
    res.status(500).json({ message: 'Erro ao atualizar pessoa' });
  }
});


// Rota para excluir uma pessoa (DELETE)
router.delete('/:id', async (req, res) => {
  try {
    // Obter a coleção de pessoas
    const personCollection = db.collection('Person');
    // Obter o ID da pessoa a ser excluída a partir dos parâmetros da requisição
    const personId = req.params.id;

    // Verificar se o ID é válido (por exemplo, se é um ID no formato correto)
    // Se não for válido, retornar um erro de requisição inválida
    if (!personId) {
      return res.status(400).json({ message: 'Invalid person ID' });
    }

    // Verificar se a pessoa com o ID fornecido existe no banco de dados
    // Caso não exista, retornar um erro de "Not Found" (404)
    const person = await personCollection.document(personId);
    if (!person) {
      return res.status(404).json({ message: 'Person not found' });
    }

    // Excluir a pessoa do banco de dados
    await personCollection.remove(personId);

    // Verificar se a exclusão foi bem-sucedida e enviar a resposta
    res.json({ message: 'Person deleted successfully' });
  } catch (error) {
    console.error('Erro ao excluir pessoa:', error);
    res.status(500).json({ message: 'Erro ao excluir pessoa' });
  }
});

module.exports = router;