const { Database, aql } = require('arangojs');
const nodemailer = require('nodemailer');

// Importar as configurações do banco de dados
const { dbUrl, dbName, dbUser, dbPass, userMail, passMail } = require('../../config');

// Criar uma instância do banco de dados ArangoDB
const db = new Database({
    url: dbUrl,
    databaseName: dbName,
    auth: { username: dbUser, password: dbPass },
});

// Função para enviar um email com as credenciais de login
async function sendLoginCredentials(email, username, password) {
    const transporter = nodemailer.createTransport({
        host: 'smtp-relay.sendinblue.com',
        port: 587,
        secure: false, // Use false para a porta 587
        auth: {
            user: 'lucaspraxlt@gmail.com', // Seu endereço de email
            pass: '6yd0mM9OEIjH5Wn7', // Sua chave SMTP
        },
    });

    const mailOptions = {
        from: 'm94883020@gmail.com', // Seu endereço de email
        to: email,
        subject: 'Credenciais de login',
        text: `Sua credencial de login:\nUsername: ${username}\nSenha: ${password}`,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email enviado: ', info.response);
    } catch (error) {
        console.error('Erro ao enviar o email:', error);
    }
}

// Função para gerar uma senha aleatória
function generateRandomPassword() {
    // Gere uma senha aleatória como preferir, por exemplo, usando caracteres alfanuméricos
    const length = 10; // Defina o comprimento desejado para a senha
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let password = "";

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        password += charset.charAt(randomIndex);
    }

    return password;
}

// Função para gerar um username único
async function generateUniqueUsername(nome) {
    let username = nome.toLowerCase().replace(/\s+/g, ''); // Remove espaços e converte para minúsculas
    let count = 1;

    // Verifica se o username já existe na coleção 'usuarios'
    while (await isUsernameTaken(username)) {
        username = nome.toLowerCase().replace(/\s+/g, '') + count; // Adiciona um número para torná-lo único
        count++;
    }

    return username;
}

// Função para verificar se um username já está em uso
async function isUsernameTaken(username) {
    const query = aql`
        FOR user IN usuarios
        FILTER user.username == ${username}
        RETURN user
    `;

    const cursor = await db.query(query);
    const users = await cursor.all();

    return users.length > 0;
}

// Função para buscar o _id do médico real pelo CPF
async function getIdForRealDoctorByKey(collection, _key) {
    try {
        const query = aql`
        FOR doc IN ${db.collection(collection)}
          FILTER doc._key == ${_key} && doc.ocupacaoAmbulatorio == "Especialista"
          RETURN doc._id
      `;
        const cursor = await db.query(query);
        const result = await cursor.next();
        return result;
    } catch (error) {
        throw error;
    }
}

// Função para buscar o _id pelo nome ou CPF
async function getPersonByKey(collection, _key) {
    try {
        const query = aql`
        FOR person IN ${db.collection(collection)}
          FILTER person._key == ${_key}
          RETURN person
      `;
        const cursor = await db.query(query);
        const result = await cursor.next();
        return result;
    } catch (error) {
        throw error;
    }
}

// Adicione este método à sua lógica existente para buscar o _id da especialidade pelo nome
async function getSpecialtyIdByName(specialtyName) {
    try {
        const query = aql`
        FOR specialty IN Specialties
          FILTER specialty.name == ${specialtyName}
          RETURN specialty._id
      `;
        const cursor = await db.query(query);
        const result = await cursor.next();
        return result;
    } catch (error) {
        throw error;
    }
}

// Adicione esta função à sua lógica existente para buscar o nome da especialidade pelo _id
async function getSpecialtyNameById(specialtyId) {
    try {
        const query = aql`
        FOR specialty IN Specialties
          FILTER specialty._key == ${specialtyId}
          RETURN specialty.name
      `;
        const cursor = await db.query(query);
        const result = await cursor.next();
        return result;
    } catch (error) {
        throw error;
    }
}

module.exports = {
    getPersonByKey, generateUniqueUsername, sendLoginCredentials, isUsernameTaken, getIdForRealDoctorByKey, getSpecialtyIdByName, getSpecialtyNameById, generateRandomPassword
};