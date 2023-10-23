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

  async function createMedicalRecordCollection() {
    const medicalRecordCollection = db.collection('MedicalRecord');
    if (!await medicalRecordCollection.exists()) {
      await medicalRecordCollection.create();
    }
  }

const medicalRecordController = {

  // Retorna todas os pacientes
  getMedicalRecord: async (req, res) => {
    createMedicalRecordCollection()
    try {
        const patientId = req.params.id;
        // Construir a consulta AQL para obter apenas doutors sem specialtyId e com healthPlan definido
        const query = `
        FOR medicalRecord IN MedicalRecord
            FILTER medicalRecord._patientId == @patientId
            RETURN medicalRecord
        `;
    
        // Executar a consulta AQL e obter os resultados
        const cursor = await db.query(query, { patientId });
    
        // Transformar o cursor em uma lista de doutors
        const doctorsList = await cursor.all();
    
        // Enviar a lista de doutors como resposta
        res.json(doctorsList);
      } catch (error) {
        console.error('Erro ao obter a lista de doutores:', error);
        res.status(500).json({ message: 'Erro ao obter a lista de doutores' });
      }
  }
};



module.exports = patientController;
