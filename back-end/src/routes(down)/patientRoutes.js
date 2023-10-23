const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');

// Rota para obter a lista de pacientes (GET)
router.get('/', patientController.getAllPatients);

// Rota para obter um paciente pelo ID (GET)
router.get('/:id', patientController.getPatientById);

// Rota para criar um paciente (POST)
router.post('/', patientController.savePatient);

// Rota para atualizar um paciente (PUT/PATCH)
router.put('/:id', patientController.updatePatient);

// Rota para excluir um paciente (DELETE)
router.delete('/:id', patientController.removePatient);

module.exports = router;
