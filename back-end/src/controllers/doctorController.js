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
    return '2' + idNumber.substring(1);
  }

const patientController = {

  // Retorna todas os pacientes
  getAllDoctors: async (req, res) => {
    try {
        // Construir a consulta AQL para obter apenas doutors sem specialtyId e com healthPlan definido
        const query = `
          FOR person IN Person
            FILTER HAS(person, "specialtyId")
            RETURN person
        `;
    
        // Executar a consulta AQL e obter os resultados
        const cursor = await db.query(query);
    
        // Transformar o cursor em uma lista de doutors
        const doctorsList = await cursor.all();
    
        // Enviar a lista de doutors como resposta
        res.json(doctorsList);
      } catch (error) {
        console.error('Erro ao obter a lista de doutores:', error);
        res.status(500).json({ message: 'Erro ao obter a lista de doutores' });
      }
  },

  // retorna um paciente por id
  getDoctorById: async (req, res) => {
    try {
        // Obter o ID do doutor a partir dos parâmetros da requisição
        const doctorId = req.params.id;
    
        // Verificar se o ID é válido (por exemplo, se é um ID no formato correto)
        if (!doctorId) {
          return res.status(400).json({ message: 'Invalid doctor ID' });
        }
    
        // Construir a consulta AQL para obter o doutor pelo ID
        const query = `
          FOR doctor IN Person
            FILTER HAS(doctor, "specialtyId") && doctor.idNumber == @doctorId
            RETURN doctor
        `;
    
        // Executar a consulta AQL e obter o resultado
        const cursor = await db.query(query, { doctorId });
    
        // Transformar o cursor em uma lista de doutores (deverá conter apenas um doutor)
        const doctorsList = await cursor.all();
    
        // Verificar se foi encontrado um doutor com o ID fornecido
        if (doctorsList.length === 0) {
          return res.status(404).json({ message: 'Doctor not found' });
        }
    
        // Enviar o doutor encontrado como resposta
        res.json(doctorsList[0]);
      } catch (error) {
        console.error('Erro ao obter doutor pelo ID:', error);
        res.status(500).json({ message: 'Erro ao obter doutor pelo ID' });
      }
  },

  // Publica um paciente
  saveDoctor: async (req, res) => {
    try {
        // Obter os dados do doutor a partir do corpo da requisição
        const { name, cpf, address, phone, email, dateOfBirth, sex, healthPlan, crmNumber, specialtyId, startTime, endTime  } = req.body;
    
        // Gerar um novo idNumber único
        const idNumber = await generateRandomId();
    
        // Criar uma nova instância da classe Doctor com os dados recebidos
        const newDoctor = new Doctor(idNumber, name, cpf, address, phone, email, dateOfBirth, sex, healthPlan, crmNumber, specialtyId, startTime, endTime );
    
        // Inserir o novo doutor diretamente na coleção
        const result = await db.collection('Person').save(newDoctor);
    
        // Verificar se a inserção foi bem-sucedida e enviar a resposta
        if (result._id) {
          res.status(201).json({ message: 'Doctor created successfully', doctor: result });
        } else {
          res.status(500).json({ message: 'Failed to create doctor' });
        }
      } catch (error) {
        console.error('Erro ao criar doutor:', error);
        res.status(500).json({ message: 'Erro ao criar doutor' });
      }
  },

  // Deleta uma tarefa
  updateDoctor: async (req, res) => {
    try {
        // Obter o ID da pessoa a ser atualizada a partir dos parâmetros da requisição
        const doctorId = req.params.id;
    
        // Obter os dados da pessoa atualizados a partir do corpo da requisição
        const { name, cpf, address, phone, email, dateOfBirth, sex, healthPlan, crmNumber, specialtyId, startTime, endTime } = req.body;
    
        // Verificar se o ID é válido (por exemplo, se é um ID no formato correto)
        // Se não for válido, retornar um erro de requisição inválida
        if (!doctorId) {
          return res.status(400).json({ message: 'Invalid doctor ID' });
        }
    
        // Verificar se a pessoa com o ID fornecido existe no banco de dados
        // Caso não exista, retornar um erro de "Not Found" (404)
        const doctor = await db.collection('Person').document(doctorId);
    
        if (!doctor) {
          return res.status(404).json({ message: 'doctor not found' });
        }
    
        // Atualizar os dados da pessoa com os dados recebidos
        doctor.name = name;
        doctor.cpf = cpf
        doctor.address = address
        doctor.phone = phone
        doctor.email = email
        doctor.crmNumber = crmNumber
        doctor.dateOfBirth = dateOfBirth
        doctor.sex = sex
        doctor.healthPlan = healthPlan
        doctor.crmNumber = crmNumber
        doctor.specialtyId = specialtyId
        doctor.startTime = startTime
        doctor.endTime = endTime 
    
        // Salvar a pessoa atualizada no banco de dados
        const result = await db.collection('Person').update(doctorId, doctor);
    
        // Verificar se a atualização foi bem-sucedida e enviar a resposta
        if (result._id) {
          res.json({ message: 'doctor updated successfully', doctor: result });
        } else {
          res.status(500).json({ message: 'Failed to update doctor' });
        }
      } catch (error) {
        console.error('Erro ao atualizar pessoa:', error);
        res.status(500).json({ message: 'Erro ao atualizar pessoa', error: error.message });
      }
  },

  removeDoctor: async (req, res) => {
    try {
        // Obter o ID do doutor a ser excluído a partir dos parâmetros da requisição
        const doctorId = req.params.id;
    
        // Verificar se o ID é válido (por exemplo, se é um ID no formato correto)
        // Se não for válido, retornar um erro de requisição inválida
        if (!doctorId) {
          return res.status(400).json({ message: 'Invalid doctor ID' });
        }
    
        // Verificar se o doutor com o ID fornecido existe no banco de dados
        // Caso não exista, retornar um erro de "Not Found" (404)
        const doctor = await db.collection('Person').document(doctorId);
        if (!doctor) {
          return res.status(404).json({ message: 'Doctor not found' });
        }
    
        // Excluir o doutor do banco de dados
        await db.collection('Person').remove(doctorId);
    
        // Verificar se a exclusão foi bem-sucedida e enviar a resposta
        res.json({ message: 'Doctor deleted successfully' });
      } catch (error) {
        console.error('Erro ao excluir doutor:', error);
        res.status(500).json({ message: 'Erro ao excluir doutor' });
      }
  }
};



module.exports = patientController;
