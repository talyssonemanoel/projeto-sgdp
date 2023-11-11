const express = require('express');
const app = express();
const router = express.Router();
const { Database , aql } = require('arangojs');
const { verifySimplesAuth } = require('../../middlewares/authMiddleware');
const { getPersonByKey, getIdForRealDoctorByKey, getSpecialtyIdByName } = require('./OtherFunctions');

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

const collectionName = 'Service';

// Rota para agendar consultas
router.post('/add', async (req, res) => {
    try {
        const { ambulatorio, especialidade, tipo, keyEspecialista, keyPaciente, data, horaInicio, horaFim } = req.body;

        // Verifica se os campos obrigatórios foram fornecidos
        if (!ambulatorio || !especialidade || !tipo || !keyEspecialista || !keyPaciente || !data || !horaInicio || !horaFim) {
            return res.status(400).json({ error: 'Todos os campos são obrigatórios para agendar uma consulta.' });
        }


        // Busca o _id do médico (somente se for um médico real) e do paciente pelo CPF
        const idEspecialista = await getIdForRealDoctorByKey('Employees', keyEspecialista);
        if (!idEspecialista) {
            return res.status(400).json({ error: 'Erro ao encontrar doutor pelo ID informado' });
        }
        
        const paciente = await getPersonByKey('Person', keyPaciente);
        if (!paciente) {
            return res.status(400).json({ error: 'Erro ao encontrar paciente pelo ID informado' });
        }
        const idPaciente = paciente._id
        const nomePaciente = paciente.nome

        if (!idPaciente) {
            return res.status(400).json({ error: 'ID de paciente inválido ou não encontrado.' });
        }

        // Estabele uma relação de aresta entre paciente e doutor
        const _from = idPaciente
        const _to = idEspecialista
        const status = "agendado"
        const info = ""
        const infoPrivado = ""

        // Busca o _id da especialidade pelo nome
        

        const appointmentData = {
            _from,
            _to,
            ambulatorio,
            especialidade,
            tipo,
            keyEspecialista,
            keyPaciente,
            nomePaciente,
            data,
            horaInicio,
            horaFim,
            info,
            infoPrivado,
            status
        };

        // Insere os dados da consulta na coleção
        const result = await db.collection(collectionName).save(appointmentData);
        res.status(201).json({ message: 'Consulta agendada com sucesso', result });
    } catch (error) {
        console.error('Erro ao agendar consulta:', error);
        res.status(500).json({ error: 'Erro ao agendar consulta' });
    }
});

router.get('/all', verifySimplesAuth, async (req, res) => {
    try {
        const query = aql`
            FOR appointment IN Service
            FILTER appointment.status == 'agendado'
            RETURN appointment
        `;

        const cursor = await db.query(query);
        const appointments = await cursor.all();

        res.json(appointments);
    } catch (error) {
        console.error('Erro ao buscar agendamentos:', error);
        res.status(500).json({ error: 'Erro ao buscar agendamentos' });
    }
});

// Rota para obter agendamentos por _key ou cpf do paciente ou data ou id da especialidade médica
router.get('/search', verifySimplesAuth, async (req, res) => {
    try {
        const { key, cpf, date, specialtyId, name } = req.query;

        // Verifica se algum dos parâmetros foi fornecido
        if (!key && !cpf && !date && !specialtyId && !name) {
            return res.status(400).json({ error: 'É necessário fornecer pelo menos um dos parâmetros: key, cpf, date, name ou specialtyId.' });
        }

        // Cria uma variável para armazenar o filtro da consulta
        let filter = '';
        let filter2 = 'appointment.status == "agendado"';

        if (name) {
            const patientId = await getIdByNameOrCpf('Person', name);
            if (!patientId) {
                return res.status(400).json({ error: 'Nome de paciente inválido ou não encontrado.' });
            }
            filter += `appointment.patientId == '${patientId}'`;
        }

        // Se o parâmetro key foi fornecido, adiciona ao filtro
        if (key) {
            filter += `appointment._key == '${key}'`;
        }

        // Se o parâmetro cpf foi fornecido, busca o _id do paciente pelo CPF e adiciona ao filtro
        if (cpf) {
            const patientId = await getIdByNameOrCpf('Person', cpf);
            if (!patientId) {
                return res.status(400).json({ error: 'CPF de paciente inválido ou não encontrado.' });
            }
            filter += `appointment.patientId == '${patientId}'`;
        }

        // Se o parâmetro date foi fornecido, adiciona ao filtro
        if (date) {
            filter += `appointment.date == '${date}'`;
        }

        // Se o parâmetro specialtyId foi fornecido, adiciona ao filtro
        if (specialtyId) {
            filter += `appointment.specialtyId == '${specialtyId}'`;
        }

        // Cria a consulta usando o filtro
        const query = aql`
            FOR appointment IN Service
            FILTER (${aql.literal(filter)}) && (${aql.literal(filter2)})
            RETURN appointment
        `;

        // Executa a consulta e retorna os resultados
        const cursor = await db.query(query);
        const appointments = await cursor.all();

        res.json(appointments);
    } catch (error) {
        console.error('Erro ao buscar agendamentos:', error);
        res.status(500).json({ error: 'Erro ao buscar agendamentos' });
    }
});
router.put('/cancel/:appointmentId', verifySimplesAuth, async (req, res) => {
    try {
        const { appointmentId } = req.params;

        // Verifica se o ID do agendamento é válido
        if (!appointmentId) {
            return res.status(400).json({ error: 'ID de agendamento inválido.' });
        }

        // Atualiza o status do agendamento para "cancelado"
        const query = aql`
            UPDATE ${appointmentId} WITH { status: 'cancelado' } IN Service
            RETURN NEW
        `;

        const cursor = await db.query(query);
        const updatedAppointment = await cursor.next();

        if (!updatedAppointment) {
            return res.status(404).json({ error: 'Agendamento não encontrado.' });
        }

        res.json({ message: 'Agendamento cancelado com sucesso', appointment: updatedAppointment });
    } catch (error) {
        console.error('Erro ao cancelar agendamento:', error);
        res.status(500).json({ error: 'Erro ao cancelar agendamento' });
    }
});

// Rota para buscar todos os documentos da coleção Service por doctorId
router.get('/GetServicesBySpecialistKey', async (req, res) => {
    try {
        // Obter o valor do parâmetro doctorId da consulta
        const doctorKey = req.query.doctorKey

        // Verifique se o parâmetro doctorId foi fornecido na consulta
        if (!doctorKey) {
            return res.status(400).json({ error: 'O parâmetro doctorId é obrigatório.' });
        }

        // Construa uma consulta AQL para buscar documentos na coleção Service com o doctorId correspondente
        const query = aql`
            FOR service IN Service
            FILTER service.keyEspecialista == ${doctorKey}
            RETURN service
        `;

        // Execute a consulta no banco de dados
        const cursor = await db.query(query);
        const services = await cursor.all();
        // Envie os documentos encontrados como resposta
        res.json(services);
    } catch (error) {
        console.error('Erro ao buscar serviços por doctorId:', error);
        res.status(500).json({ error: 'Erro ao buscar serviços por doctorId' });
    }
});

router.get('/GetServicesByPatientKey', async (req, res) => {
    try {
        // Obter o valor do parâmetro patientKey da consulta
        const patientID = req.query.q;
        const ambulatorio = req.query.ambulatorio;

        // Verifique se o parâmetro patientKey foi fornecido na consulta
        if (!patientID) {
            return res.status(400).json({ error: 'O parâmetro patientID é obrigatório.' });
        }

        // Verifique se o valor do ambulatorio é 'geral' ou 'LGBT'
        if (ambulatorio !== 'Geral' && ambulatorio !== 'LGBT') {
            return res.status(400).json({ error: 'O valor do ambulatório é inválido. Deve ser "geral" ou "LGBT".' });
        }

        // Construa uma consulta AQL para buscar documentos na coleção Atendimentos onde _from corresponde ao patientKey e ambulatorio corresponde ao valor fornecido
        const query = aql`
            FOR atendimento IN Service
            FILTER atendimento.patientId == ${patientID} && atendimento.ambulatorio == ${ambulatorio}
            RETURN atendimento
        `;

        // Execute a consulta no banco de dados
        const cursor = await db.query(query);
        const atendimentos = await cursor.all();

        // Envie os documentos encontrados como resposta
        res.json(atendimentos);
    } catch (error) {
        console.error('Erro ao buscar atendimentos por patientKey:', error);
        res.status(500).json({ error: 'Erro ao buscar atendimentos por patientKey' });
    }
});


module.exports = router;
