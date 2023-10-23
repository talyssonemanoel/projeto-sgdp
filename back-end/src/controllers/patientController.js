const Patient = require('../models/Patient');
const { Database, aql } = require('arangojs');
const db = new Database({
    url: 'https://lordi.uern.br', // URL do servidor do ArangoDB
    databaseName: 'prontuario',   // Nome do banco de dados
    auth: {                        // Credenciais de autenticação, se necessário
      username: 'prontuario',
      password: 'prontuario'
    }
  });

  async function generateRandomId() {
    // Gerar um número aleatório entre 0 e 999999 (inclusivo)
    const randomNumber = Math.floor(Math.random() * 1000000);
  
    // Converter o número para uma string com exatamente 6 dígitos, preenchendo com zeros à esquerda, se necessário
    const idNumber = randomNumber.toString().padStart(6, '0');
  
    // Certificar-se de que o número começa com o dígito "1"
    return '1' + idNumber.substring(1);
  }

const patientController = {

  // Retorna todas os pacientes
  getAllPatients: async (req, res) => {
    try {
        // Construir a consulta AQL para obter apenas pacientes sem specialtyId e com healthPlan definido
        const query = `
          FOR person IN Person
            FILTER person.healthPlan != NULL && !HAS(person, "specialtyId")
            RETURN person
        `;
    
        // Executar a consulta AQL e obter os resultados
        const cursor = await db.query(query);
    
        // Transformar o cursor em uma lista de pacientes
        const patientsList = await cursor.all();
    
        // Enviar a lista de pacientes como resposta
        res.json(patientsList);
      } catch (error) {
        console.error('Erro ao obter a lista de pacientes:', error);
        res.status(500).json({ message: 'Erro ao obter a lista de pacientes' });
      }
  },

  // retorna um paciente por id
  getPatientById: async (req, res) => {
    try {
        // Obter o ID do paciente a partir dos parâmetros da requisição
        const patientId = req.params.id;
    
        // Verificar se o ID é válido (por exemplo, se é um ID no formato correto)
        if (!patientId) {
          return res.status(400).json({ message: 'Invalid patient ID' });
        }
    
        // Construir a consulta AQL para obter o paciente pelo ID
        const query = `
          FOR patient IN Person
            FILTER patient.healthPlan != NULL && patient.idNumber == @patientId
            RETURN patient
        `;
    
        // Executar a consulta AQL e obter o resultado
        const cursor = await db.query(query, { patientId });
    
        // Transformar o cursor em uma lista de pacientes (deverá conter apenas um paciente)
        const patientsList = await cursor.all();
    
        // Verificar se foi encontrado um paciente com o ID fornecido
        if (patientsList.length === 0) {
          return res.status(404).json({ message: 'Patient not found' });
        }
    
        // Enviar o paciente encontrado como resposta
        res.json(patientsList[0]);
      } catch (error) {
        console.error('Erro ao obter paciente pelo ID:', error);
        res.status(500).json({ message: 'Erro ao obter paciente pelo ID' });
      }
  },

  // Publica um paciente
  savePatient: async (req, res) => {
    try {
        // Obter os dados do paciente a partir do corpo da requisição
        const { name, cpf, address, phone, email, dateOfBirth, sex, healthPlan } = req.body;
    
        // Gerar um novo idNumber único
        const idNumber = await generateRandomId();
    
        // Criar uma nova instância da classe Patient com os dados recebidos
        const newPatient = new Patient(idNumber, name, cpf, address, phone, email, dateOfBirth, sex, healthPlan);
    
        // Inserir o novo paciente diretamente na coleção
        const result = await db.collection('Person').save(newPatient);
    
        // Verificar se a inserção foi bem-sucedida e enviar a resposta
        if (result._id) {
          res.status(201).json({ message: 'Patient created successfully', patient: result });
        } else {
          res.status(500).json({ message: 'Failed to create patient' });
        }
      } catch (error) {
        console.error('Erro ao criar paciente:', error);
        res.status(500).json({ message: 'Erro ao criar paciente' });
      }
  },

  // Deleta uma tarefa
  updatePatient: async (req, res) => {
    try {
        // Obter o ID da pessoa a ser atualizada a partir dos parâmetros da requisição
        const patientId = req.params.id;
    
        // Obter os dados da pessoa atualizados a partir do corpo da requisição
        const { name, cpf, address, phone, email, dateOfBirth, sex, healthPlan } = req.body;
    
        // Verificar se o ID é válido (por exemplo, se é um ID no formato correto)
        // Se não for válido, retornar um erro de requisição inválida
        if (!patientId) {
          return res.status(400).json({ message: 'Invalid patient ID' });
        }
    
        // Verificar se a pessoa com o ID fornecido existe no banco de dados
        // Caso não exista, retornar um erro de "Not Found" (404)
        const patient = await db.collection('Person').document(patientId);
    
        if (!patient) {
          return res.status(404).json({ message: 'patient not found' });
        }
    
        // Atualizar os dados da pessoa com os dados recebidos
        patient.name = name
        patient.cpf = cpf
        patient.address = address
        patient.phone = phone
        patient.email = email
        patient.dateOfBirth = dateOfBirth
        patient.sex = sex
        patient.healthPlan = healthPlan 
    
        // Salvar a pessoa atualizada no banco de dados
        const result = await db.collection('Person').update(patientId, patient);
    
        // Verificar se a atualização foi bem-sucedida e enviar a resposta
        if (result._id) {
          res.json({ message: 'patient updated successfully', patient: result });
        } else {
          res.status(500).json({ message: 'Failed to update patient' });
        }
      } catch (error) {
        console.error('Erro ao atualizar pessoa:', error);
        res.status(500).json({ message: 'Erro ao atualizar pessoa', error: error.message });
      }
  },

  removePatient: async (req, res) => {
    try {
        // Obter o ID do paciente a ser excluído a partir dos parâmetros da requisição
        const patientId = req.params.id;
    
        // Verificar se o ID é válido (por exemplo, se é um ID no formato correto)
        // Se não for válido, retornar um erro de requisição inválida
        if (!patientId) {
          return res.status(400).json({ message: 'Invalid patient ID' });
        }
    
        // Verificar se o paciente com o ID fornecido existe no banco de dados
        // Caso não exista, retornar um erro de "Not Found" (404)
        const patient = await db.collection('Person').document(patientId);
        if (!patient) {
          return res.status(404).json({ message: 'Patient not found' });
        }
    
        // Excluir o paciente do banco de dados
        await db.collection('Person').remove(patientId);
    
        // Verificar se a exclusão foi bem-sucedida e enviar a resposta
        res.json({ message: 'Patient deleted successfully' });
      } catch (error) {
        console.error('Erro ao excluir paciente:', error);
        res.status(500).json({ message: 'Erro ao excluir paciente' });
      }
  }
};



module.exports = patientController;
