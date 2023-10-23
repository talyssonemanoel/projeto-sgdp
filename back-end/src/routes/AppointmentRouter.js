const express = require('express');
const app = express();
const router = express.Router();
const { Database , aql } = require('arangojs');
const { verifyTokenAndUser } = require('../../middlewares/authMiddleware');
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
        const { ambulatorio, doctorKey, patientKey, date } = req.body;

        // Verifica se os campos obrigatórios foram fornecidos
        if (!ambulatorio || !doctorKey || !patientKey || !date) {
            return res.status(400).json({ error: 'Todos os campos são obrigatórios para agendar uma consulta.' });
        }


        // Busca o _id do médico (somente se for um médico real) e do paciente pelo CPF
        const doctorId = await getIdForRealDoctorByKey('Person', doctorKey);
        if (!doctorId) {
            return res.status(400).json({ error: 'Erro ao encontrar doutor pelo ID informado' });
        }

        const patient = await getPersonByKey('Person', patientKey);
        if (!patient) {
            return res.status(400).json({ error: 'Erro ao encontrar paciente' });
        }
        const patientId = patient._id
        const patientName = patient.name
        if (!patientId) {
            return res.status(400).json({ error: 'CPF de paciente inválido ou não encontrado.' });
        }

        // Estabele uma relaçãod e aresta entre paciente e doutor
        const _from = patientId;
        const _to = doctorId;

        // Busca o _id da especialidade pelo nome
        

        const appointmentData = {
            _from,
            _to,
            ambulatorio,
            doctorId,
            patientId,
            patientName,
            date,
        };

        // Insere os dados da consulta na coleção
        const result = await db.collection(collectionName).save(appointmentData);
        res.status(201).json({ message: 'Consulta agendada com sucesso', result });
    } catch (error) {
        console.error('Erro ao agendar consulta:', error);
        res.status(500).json({ error: 'Erro ao agendar consulta' });
    }
});

router.get('/all', verifyTokenAndUser, async (req, res) => {
    try {
        const query = aql`
            FOR appointment IN Service
            FILTER appointment.status == 'ativo'
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
router.get('/search', verifyTokenAndUser, async (req, res) => {
    try {
        const { key, cpf, date, specialtyId, name } = req.query;

        // Verifica se algum dos parâmetros foi fornecido
        if (!key && !cpf && !date && !specialtyId && !name) {
            return res.status(400).json({ error: 'É necessário fornecer pelo menos um dos parâmetros: key, cpf, date, name ou specialtyId.' });
        }

        // Cria uma variável para armazenar o filtro da consulta
        let filter = '';
        let filter2 = 'appointment.status == "ativo"';

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
router.put('/cancel/:appointmentId', verifyTokenAndUser, async (req, res) => {
    try {
        const { appointmentId } = req.params;

        // Verifica se o ID do agendamento é válido
        if (!appointmentId) {
            return res.status(400).json({ error: 'ID de agendamento inválido.' });
        }

        // Atualiza o status do agendamento para "inativo"
        const query = aql`
            UPDATE ${appointmentId} WITH { status: 'inativo' } IN Service
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
router.get('/GetServicesByDoctorKey', async (req, res) => {
    try {
        // Obter o valor do parâmetro doctorId da consulta
        const doctorKey = `Person/${req.query.doctorKey}`;

        // Verifique se o parâmetro doctorId foi fornecido na consulta
        if (!doctorKey) {
            return res.status(400).json({ error: 'O parâmetro doctorId é obrigatório.' });
        }

        // Construa uma consulta AQL para buscar documentos na coleção Service com o doctorId correspondente
        const query = aql`
            FOR service IN Service
            FILTER service.doctorId == ${doctorKey}
            RETURN service
        `;

        // Execute a consulta no banco de dados
        const cursor = await db.query(query);
        const services = await cursor.all();
        console.log(services)
        // Envie os documentos encontrados como resposta
        res.json(services);
    } catch (error) {
        console.error('Erro ao buscar serviços por doctorId:', error);
        res.status(500).json({ error: 'Erro ao buscar serviços por doctorId' });
    }
});



module.exports = router;
