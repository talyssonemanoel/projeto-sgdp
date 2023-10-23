// Importar os módulos necessários
const express = require("express");

// Criar uma instância do express.Router
const router = express.Router();

const { Database } = require('arangojs');

// Configurar a conexão com o ArangoDB
const db = new Database({
  url: 'https://lordi.uern.br', // URL do servidor do ArangoDB
  databaseName: 'prontuario',   // Nome do banco de dados
  auth: {                        // Credenciais de autenticação, se necessário
    username: 'prontuario',
    password: 'prontuario'
  }
});

const PESSOAS_COLLECTION = "Person";
const AGENDAMENTOS_COLLECTION = "Service";

// Usar a coleção
const agendamentos = db.collection(AGENDAMENTOS_COLLECTION);

// O restante do código permanece igual

// Criar uma rota para verificar o CPF do paciente
router.post("/verificarCPF", async (req, res) => {
  const { cpf } = req.body;

  try {
    // Criar uma consulta para buscar a pessoa pelo CPF e distinguir entre médicos e pacientes
    const query = `
      FOR pessoa IN ${PESSOAS_COLLECTION}
      FILTER pessoa.cpf == @cpf && !HAS(pessoa, "crmNumber")
      RETURN pessoa
    `;

    // Executar a consulta usando o método query do arangojs
    const cursor = await db.query(query, { cpf });
    let pessoa = undefined;
    if (cursor.hasNext) {
      // Obter o primeiro resultado da consulta usando o método next()
      pessoa = await cursor.next();
    }



    if (pessoa) {
      // Enviar uma resposta com os dados da pessoa
      res.json({
        exists: true,
        data: {
          nome: pessoa.nome,
          email: pessoa.email,
        },
      });
    } else {
      // Enviar uma resposta indicando que a pessoa não existe
      res.json({ exists: false });
    }
  } catch (error) {
    // Mostrar o erro no terminal e enviar uma resposta com uma mensagem de erro
    console.error(error);
    res.status(500).json({ error: "Ocorreu um erro na verificação do CPF." });
  }
});

// Criar uma rota para agendar uma consulta
router.post("/agendar", async (req, res) => {
  // Receber os dados do agendamento do corpo da requisição
  const { cpf, data, hora, crmNumber } = req.body;

  try {
    // Criar uma consulta para buscar o paciente pelo CPF
    const pacienteQuery = `
      FOR pessoa IN ${PESSOAS_COLLECTION}
      FILTER pessoa.cpf == @cpf && !HAS(pessoa, "crmNumber")
      RETURN pessoa
    `;

    // Executar a consulta usando o método query do arangojs
    const pacienteCursor = await db.query(pacienteQuery, { cpf });

    let paciente = undefined;
    if (pacienteCursor.hasNext) {
      paciente = await pacienteCursor.next();
    }

    if (!paciente) {
      // Se o paciente não existir, enviar uma resposta com uma mensagem de erro
      return res.status(404).json({ error: "Paciente não encontrado." });
    }

    // Criar uma consulta para buscar o médico pelo CRM
    const medicoQuery = `
      FOR pessoa IN ${PESSOAS_COLLECTION}
      FILTER pessoa.crmNumber == @crmNumber
      RETURN pessoa
    `;

    // Executar a consulta usando o método query do arangojs
    const medicoCursor = await db.query(medicoQuery, { crmNumber });

    let medico = undefined;
    if (medicoCursor.hasNext) {
      // Obter o próximo documento do cursor usando o método next()
      medico = await medicoCursor.next();
    }

    if (!medico) {
      // Se o médico não existir, enviar uma resposta com uma mensagem de erro
      return res.status(404).json({ error: "Médico não encontrado." });
    }

    // Criar um objeto com os dados do agendamento
    const agendamento = {
      data,
      hora,
      _doctor: medico.cpf, // CPF do médico
      _patient: paciente.cpf, // CPF do paciente
      _symptoms: [], // Valor inicial vazio para o campo _symptoms
      _orientations: [], // Valor inicial vazio para o campo _orientations
    };

    // Inserir o agendamento na coleção usando o método save do arangojs
    const result = await agendamentos.save(agendamento);

    // Enviar uma resposta com os dados do agendamento e o identificador gerado pelo ArangoDB
    res.json({
      message: "Agendamento realizado com sucesso.",
      data: {
        ...agendamento,
        _key: result._key,
      },
    });
  } catch (error) {
    // Mostrar o erro no terminal e enviar uma resposta com uma mensagem de erro
    console.error(error);
    res.status(500).json({ error: "Ocorreu um erro no agendamento." });
  }
});

router.put('/:id', async (req, res) => {
  try {
    // Obter o ID da atendimento a ser atualizada a partir dos parâmetros da requisição
    const atendimentoId = req.params.id;

    // Obter os dados da atendimento atualizados a partir do corpo da requisição
    const { _symptoms = [], _orientations = [] } = req.body;


    // Verificar se o ID é válido (por exemplo, se é um ID no formato correto)
    // Se não for válido, retornar um erro de requisição inválida
    if (!atendimentoId) {
      return res.status(400).json({ message: 'Invalid atendimento ID' });
    }

    // Verificar se a atendimento com o ID fornecido existe no banco de dados
    // Caso não exista, retornar um erro de "Not Found" (404)
    const atendimento = await db.collection('Service').document(atendimentoId);

    if (!atendimento) {
      return res.status(404).json({ message: 'atendimento not found' });
    }

    // Atualizar os dados da atendimento com os dados recebidos
    atendimento._symptoms = _symptoms
    atendimento._orientations = _orientations

    // Salvar a atendimento atualizada no banco de dados
    const result = await db.collection('Service').update(atendimentoId, atendimento);

    // Verificar se a atualização foi bem-sucedida e enviar a resposta
    if (result._id) {
      res.json({ message: 'atendimento updated successfully', atendimento: result });
    } else {
      res.status(500).json({ message: 'Failed to update atendimento' });
    }
  } catch (error) {
    console.error('Erro ao atualizar atendimento:', error);
    res.status(500).json({ message: 'Erro ao atualizar atendimento', error: error.message });
  }
});


// Exportar o router para ser usado em outro arquivo
module.exports = router;
