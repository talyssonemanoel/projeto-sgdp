// Importar os módulos necessários
const express = require("express");
const cors = require("cors");
const path = require('path');
// Importar o dotenv e carregar as variáveis de ambiente do arquivo .env
require("dotenv").config();

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

app.use("/", loginRoutes);
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
const ipLocal = process.env.IP_LOCAL;

// Iniciar o servidor
app.listen(port, ipLocal, () => console.log(`Server running...${port}`));
