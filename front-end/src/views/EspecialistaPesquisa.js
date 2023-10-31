import React, { useState, useEffect } from "react";
import { Modal, Button } from "react-bootstrap";
import { Link, useParams } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import api from "../services/api";
import "../css/EspecialistaPesquisa.css";

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

  const { query } = useParams;

  const debounce = (func, delay) => {
    let timeout;
    return function (...args) {
      const context = this;
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(context, args), delay);
    };
  };

  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const response = await api.post("/doctors/add", { ...formData, token });
      // Lide com a resposta da adição do funcionário, se necessário
      handleCloseModal(); // Feche o modal após o envio bem-sucedido
    } catch (error) {
      console.error("Erro ao adicionar funcionário:", error);
      // Trate os erros apropriadamente
    }
  };

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
                  <td>{employee.email}</td>
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
                className="form-control"
                value={formData.CPF}
                onChange={handleFormChange}
                required
              />
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
          </form>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Fechar
          </Button>
          <Button variant="primary" type="submit">
            Adicionar Funcionário
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default EspecialistaPesquisa;
