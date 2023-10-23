const express = require('express');
const Service = require('../models/Service'); // Importe o modelo do atendimento
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

// Rota para filtrar pacientes com base no ID do paciente, CPF do paciente e intervalo de datas de atendimento
// Rota para obter os serviços de um paciente (GET)
router.get('/prontuario/:patientIdNumber', async (req, res) => {
  const patientIdNumber = req.params.patientIdNumber.toString()
  try {
    
    const cursor = await db.query(`
      for s in Service
        filter s._patient == @patientIdNumber
        return s
    `, {"patientIdNumber":patientIdNumber})

    //let servicesList = listPerson._result
    let servicesList = []
    await cursor.forEach((service) => {
        servicesList.push(service)
    });

    // Verificar se foi encontrado um paciente com o ID fornecido
    if (servicesList.length === 0) {
      return res.status(404).json({ message: 'Service not found' });
    }

    res.json(servicesList);

  } catch (error) {
    console.error('Erro ao obter os serviços do paciente:', error);
    res.status(500).json({ message: 'Erro ao obter os serviços do paciente' });
  }
});



//Salvar atendimento
router.post('/', async (req, res) => {
  try {
    // Obter os dados do paciente a partir do corpo da requisição
    const { doctorId, patientId } = req.body;

    // Criar uma nova instância da classe Service com os dados recebidos
    const newService = new Service(doctorId, patientId); // Use a classe Service ou a classe que representa os serviços
 
    const serviceCollection = db.collection('Service');

    // Inserir o novo serviço no banco de dados
    const result = await serviceCollection.save(newService);

    // Verificar se a inserção foi bem-sucedida e enviar a resposta
    if (result._id) {
      res.status(201).json({ message: 'Service created successfully', service: result });
    } else {
      res.status(500).json({ message: 'Failed to create service' });
    }
  } catch (error) {
    console.error('Erro ao criar atendimento:', error);
    res.status(500).json({ message: 'Erro ao criar atendimento' });
  }
});

module.exports = router;
