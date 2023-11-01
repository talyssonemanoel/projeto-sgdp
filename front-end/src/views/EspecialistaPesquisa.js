import React, { useState, useEffect } from "react";
import { Modal, Button } from "react-bootstrap";
import { Link, useParams } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import api from "../services/api";
import "../css/EspecialistaPesquisa.css";

// INTRODUÇÃO

const EspecialistaPesquisa = () => {
  const [employees, setEmployees] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [noResultsMessage, setNoResultsMessage] = useState(""); // Mensagem de nenhum resultado
  const [formData, setFormData] = useState({
    Nome: "",
    CPF: "",
    Endereco: "",
    OcupacaoAmbulatorio: "",
    Email: "",
  });
  const [CPFIsValid, setCPFIsValid] = useState(true);

  // DECLARAÇÃO DE VARIÁVEIS

  const { query } = useParams;

  const debounce = (func, delay) => {
    let timeout;
    return function (...args) {
      const context = this;
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(context, args), delay);
    };
  };

  // VERIFICA CPF //

  // Função para formatar CPF no padrão brasileiro (###.###.###-##)
  const formatCPF = (cpf) => {
    cpf = cpf.replace(/\D/g, ''); // Remove caracteres não numéricos
    if (cpf.length !== 11) {
      return cpf; // Retorna o CPF como está se não tiver 11 dígitos
    }
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  // Função para validar CPF
  const validateCPF = (cpf) => {
    cpf = cpf.replace(/\D/g, ''); // Remove caracteres não numéricos
    if (cpf.length !== 11) {
      return false;
    }

    let sum = 0;
    let remainder;

    for (let i = 1; i <= 9; i++) {
      sum = sum + parseInt(cpf.substring(i - 1, i)) * (11 - i);
    }

    remainder = (sum * 10) % 11;

    if (remainder === 10 || remainder === 11) {
      remainder = 0;
    }

    if (remainder !== parseInt(cpf.substring(9, 10))) {
      return false;
    }

    sum = 0;
    for (let i = 1; i <= 10; i++) {
      sum = sum + parseInt(cpf.substring(i - 1, i)) * (12 - i);
    }

    remainder = (sum * 10) % 11;

    if (remainder === 10 || remainder === 11) {
      remainder = 0;
    }

    if (remainder !== parseInt(cpf.substring(10, 11))) {
      return false;
    }

    return true;
  };

  // FIM DO VERIFICA CPF //

  const handleShowModal = () => {
    setShowModal(true);
    // Limpe os campos do formulário ao abrir o modal
    setFormData({
      Nome: "",
      CPF: "",
      Endereco: "",
      OcupacaoAmbulatorio: "",
      Email: "",
    });
  };

  const handleCloseModal = () => {
    setShowModal(false);
    // Limpe os campos do formulário ao fechar o modal
    setFormData({
      Nome: "",
      CPF: "",
      Endereco: "",
      OcupacaoAmbulatorio: "",
      Email: "",
    });
  };


  const handleFormChange = (e) => {
    const { name, value } = e.target;

    if (name === "CPF") {
      const formattedCPF = formatCPF(value);
      setFormData({
        ...formData,
        [name]: formattedCPF,
      });

      // Verifique se o CPF é válido e atualize um estado de validação
      const isValidCPF = validateCPF(value);
      setCPFIsValid(isValidCPF);
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!CPFIsValid) {
      // Impedir o envio do formulário se o CPF não for válido
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await api.post(`/doctors/add?token=${token}`, formData);
      // Lide com a resposta da adição do funcionário, se necessário
      handleCloseModal(); // Feche o modal após o envio bem-sucedido

      // Após a adição bem-sucedida, atualize a lista de funcionários
      fetchEmployees(searchQuery);
    } catch (error) {
      console.error("Erro ao adicionar funcionário:", error);
      // Trate os erros apropriadamente
    }
  };


  // PESQUISA DE EMPREGADOS

  const fetchEmployees = async (query) => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      const response = await api.get(`/doctors/search/${query}?token=${token}`);
      const results = response.data;

      if (results.length === 0) {
        setNoResultsMessage("Não foram encontrados especialistas");
      } else {
        setNoResultsMessage("");
      }

      // Preencher campos vazios com 'Sem dados' em vermelho
      const employeesWithSemDados = results.map((employee) => ({
        ...employee,
        Nome: employee.Nome || <span style={{ color: "red" }}>Sem dados</span>,
        OcupacaoAmbulatorio: employee.OcupacaoAmbulatorio || (
          <span style={{ color: "red" }}>Sem dados</span>
        ),
        CPF: employee.CPF || <span style={{ color: "red" }}>Sem dados</span>,
        Email: employee.Email || (
          <span style={{ color: "red" }}>Sem dados</span>
        ),
        specialtyId: employee.specialtyId || (
          <span style={{ color: "red" }}>Sem dados</span>
        ),
        Privilegios: employee.Privilegios || (
          <span style={{ color: "red" }}>Sem dados</span>
        ),
        username: employee.username || (
          <span style={{ color: "red" }}>Sem dados</span>
        ),
      }));

      setEmployees(employeesWithSemDados);
    } catch (error) {
      console.error("Erro ao buscar funcionários:", error);
    } finally {
      setIsLoading(false);
    }
  };

  //PESQUISA EM TEMPO REAL

  const delayedSearch = debounce((query) => {
    fetchEmployees(query);
  }, 300);

  useEffect(() => {
    if (query) {
      fetchEmployees(query);
    } else {
      fetchEmployees("");
    }
  }, [query]);

  const handleSearch = (value) => {
    setSearchQuery(value);
    setNoResultsMessage("");
    delayedSearch(value);
  };

  // HTML DE VISUAL

  return (
    <div className="container-especialista">
      <h1 className="header-especialista">
        Página de Pesquisa de Especialistas
      </h1>
      <button className="button-especialista" onClick={handleShowModal}>
        Adicionar Funcionário
      </button>

      <div className="search-form">
        <input
          className="input-especialista"
          type="text"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Pesquisar..."
        />
      </div>

      <div className="results-especialista">
        <h2>Resultados da Pesquisa</h2>
        {isLoading ? (
          <div className="loading-container">
            <div className="loading"></div>
          </div>
        ) : employees.length === 0 ? (
          <p>{noResultsMessage}</p>
        ) : (
          <table className="specialist-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Ocupação no Ambulatório</th>
                <th>CPF</th>
                <th>Email</th>
                <th>Especialidade</th>
                <th>Privilégios</th>
                <th>Nome de Usuário</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((employee) => (
                <tr key={employee._id}>
                  <td>{employee.Nome}</td>
                  <td>{employee.OcupacaoAmbulatorio}</td>
                  <td>{employee.CPF}</td>
                  <td>{employee.Email}</td>
                  <td>{employee.specialtyId}</td>
                  <td>{employee.Privilegios}</td>
                  <td>{employee.username}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Adicionar Funcionário</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleFormSubmit}>
            <div className="form-group">
              <label htmlFor="Nome">Nome</label>
              <input
                type="text"
                name="Nome"
                id="Nome"
                className="form-control"
                value={formData.Nome}
                onChange={handleFormChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="CPF">CPF</label>
              <input
                type="text"
                name="CPF"
                id="CPF"
                className={`form-control ${CPFIsValid ? '' : 'is-invalid'}`}
                value={formData.CPF}
                onChange={handleFormChange}
                required
              />
              {!CPFIsValid && (
                <div className="invalid-feedback">
                  O CPF inserido não é válido.
                </div>
              )}
            </div>
            <div className="form-group">
              <label htmlFor="Endereco">Endereço</label>
              <input
                type="text"
                name="Endereco"
                id="Endereco"
                className="form-control"
                value={formData.Endereco}
                onChange={handleFormChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="OcupacaoAmbulatorio">Função no Ambulatório</label>
              <input
                type="text"
                name="OcupacaoAmbulatorio"
                id="OcupacaoAmbulatorio"
                className="form-control"
                value={formData.OcupacaoAmbulatorio}
                onChange={handleFormChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="Email">Email</label>
              <input
                type="email"
                name="Email"
                id="Email"
                className="form-control"
                value={formData.Email}
                onChange={handleFormChange}
                required
              />
            </div>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleCloseModal}>
                Fechar
              </Button>
              <Button variant="primary" type="submit">
                Adicionar Funcionário
              </Button>
            </Modal.Footer>
          </form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default EspecialistaPesquisa;
