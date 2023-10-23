const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');

// Rota para obter a lista de doutores (GET)
router.get('/', doctorController.getAllDoctors);

// Rota para obter um doutor pelo ID (GET)
router.get('/:id', doctorController.getDoctorById);

// Rota para adicionar um médico
router.post('/', doctorController.saveDoctor);

// Rota para atualizar um especialista (PUT/PATCH)
router.put('/:id', doctorController.updateDoctor);

// Rota para excluir um especialista (DELETE)
router.delete('/:id', doctorController.removeDoctor);

module.exports = router;
