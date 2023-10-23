// Importar os módulos necessários
const express = require("express");
const cors = require("cors");
const path = require('path');
// Importar o dotenv e carregar as variáveis de ambiente do arquivo .env
require("dotenv").config();

// Importar os arquivos de rotas
//const index = require("./src/routes/index");
/* const personRoutes = require("./src/routes/personRoutes");
const doctorRoutes = require("./src/routes/doctorRoutes");
const patientRoutes = require("./src/routes/patientRoutes");
const service = require("./src/routes/serviceRoutes");
const atendimentoRoutes = require("./src/routes/atendimentoRoutes"); */
const patient = require("./src/routes/PatientRouter");
const loginRoutes = require("./src/auth/loginService"); 
const doctors = require("./src/routes/DoctorController");
const verify = require('./middlewares/verifyrouter');
const appoint = require('./src/routes/AppointmentRouter');
const prontuario = require('./src/routes/ServiceRouter');
const situacao = require('./src/routes/SituationRouter');
const specialty = require('./src/routes/SpecialtyRouter')
const logout = require('./middlewares/logout');

// Criar uma instância do express
const app = express();

// Usar os middlewares necessários
app.use(express.json());
app.use(cors());

// Montar os routers na aplicação Express
app.use("/", loginRoutes);
/* app.use("/people", personRoutes);
app.use("/doctors", doctorRoutes);

app.use("/service", service);
app.use("/atendimento", atendimentoRoutes); */
app.use("/situacao", situacao);
app.use("/especialidade", specialty);
app.use("/prontuario", prontuario);
app.use("/agendar", appoint);
app.use("/patients", patient);
app.use("/doctors", doctors);
app.use("/verify", verify);
app.use("/logout", logout);
app.use(express.static('public'));

app.set('views', path.join(__dirname, 'src', 'views'));
app.set('view engine', 'ejs'); // Define a engine de template como EJS

// Definir a porta do servidor usando a variável de ambiente PORT ou o valor padrão 3001
const port = process.env.PORT || 3001;

// Iniciar o servidor
app.listen(port, () => console.log(`Server running...${port}`));
