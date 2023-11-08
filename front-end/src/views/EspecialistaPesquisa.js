import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit } from "@fortawesome/free-solid-svg-icons";
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
  const [editEmployee, setEditEmployee] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingFields, setEditingFields] = useState({
    nome: false,
    CPF: false,
    endereco: false,
    ocupacaoAmbulatorio: false,
    Email: false,
    specialtyId: false,
    username: false,
  });

  const [selectedOccupation, setSelectedOccupation] =
    useState("Escolha uma função");
  const [showSpecialtyDropdown, setShowSpecialtyDropdown] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [noResultsMessage, setNoResultsMessage] = useState(""); // Mensagem de nenhum resultado
  const [specialties, setSpecialties] = useState([]); // Para armazenar as opções de especialidade
  const [selectedSpecialty, setSelectedSpecialty] = useState("");

  const [occupations, setOccupations] = useState([
    "Administrador",
    "Assistente",
    "Especialista",
    "Outro",
  ]);
  const [formData, setFormData] = useState({
    nome: "",
    CPF: "",
    endereco: "",
    ocupacaoAmbulatorio: "",
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
    cpf = cpf.replace(/\D/g, ""); // Remove caracteres não numéricos
    if (cpf.length !== 11) {
      return cpf; // Retorna o CPF como está se não tiver 11 dígitos
    }
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  };

  // Função para validar CPF
  const validateCPF = (cpf) => {
    cpf = cpf.replace(/\D/g, ""); // Remove caracteres não numéricos
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

  // DITA O MODAL E FUNÇÕES DE EDIÇÃO

  const handleEditEmployee = (employee) => {
    setEditEmployee(employee);
    setShowEditModal(true);
  };

  const handleEditFieldSelection = (e) => {
    const fieldName = e.target.name;
    const isChecked = e.target.checked;
    setEditingFields((prevEditingFields) => ({
      ...prevEditingFields,
      [fieldName]: isChecked,
    }));
  };

  const handleSaveEdit = async () => {
    try {
      const token = localStorage.getItem("token");
      // Realize a requisição PUT ou POST para atualizar os detalhes do profissional no backend
      // Utilize o estado 'editEmployee' para obter os dados do profissional que está sendo editado
      const response = await api.put(
        `/doctors/${editEmployee._key}?token=${token}`,
        editEmployee
      );
      // Lide com a resposta da atualização, se necessário

      // Feche o modal de edição após a atualização bem-sucedida
      setShowEditModal(false);

      // Atualize a lista de funcionários para refletir as alterações no frontend
      fetchEmployees(searchQuery);
    } catch (error) {
      console.error("Erro ao salvar as alterações:", error);
      // Trate os erros apropriadamente
    }
  };

  // BUSCA DE ESPECIALIDADES

  useEffect(() => {
    // Função para buscar especialidades
    const fetchSpecialties = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await api.get(`/especialidade/all?token=${token}`);
        const specialtyOptions = response.data;
        setSpecialties(specialtyOptions);
      } catch (error) {
        console.error("Erro ao buscar especialidades:", error);
      }
    };

    // Chame a função de busca de especialidades
    fetchSpecialties();
  }, []);

  // OUTROS

  const handleShowModal = () => {
    setShowModal(true);
    // Limpe os campos do formulário ao abrir o modal
    setFormData({
      nome: "",
      CPF: "",
      endereco: "",
      ocupacaoAmbulatorio: "",
      Email: "",
    });
  };

  const handleCloseModal = () => {
    setShowModal(false);
    // Limpe os campos do formulário ao fechar o modal
    setFormData({
      nome: "",
      CPF: "",
      endereco: "",
      ocupacaoAmbulatorio: "",
      Email: "",
    });
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;

    if (name === "occupation") {
      setSelectedOccupation(value);
      setShowSpecialtyDropdown(value === "Especialista");
    } else if (name === "CPF") {
      const formattedCPF = formatCPF(value);
      setFormData({
        ...formData,
        [name]: formattedCPF,
      });

      // Verifique se o CPF é válido e atualize um estado de validação
      const isValidCPF = validateCPF(value);
      setCPFIsValid(isValidCPF);
    } else if (name === "specialtyId") {
      // Atualize o estado 'selectedSpecialty' com o valor da especialidade selecionada
      setSelectedSpecialty(value);
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!CPFIsValid || selectedOccupation === "Escolha uma função") {
      // Impedir o envio do formulário se o CPF não for válido ou nenhuma ocupação for selecionada
      return;
    }

    const dataToSubmit = {
      ...formData,
      ocupacaoAmbulatorio: selectedOccupation,
      nomeEspecialidade: selectedSpecialty, // Inclua 'nomeEspecialidade' com o valor da especialidade selecionada
    };

    try {
      const token = localStorage.getItem("token");
      const response = await api.post(
        `/doctors/add?token=${token}`,
        dataToSubmit
      );
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
        nome: employee.nome || <span style={{ color: "red" }}>Sem dados</span>,
        ocupacaoAmbulatorio: employee.ocupacaoAmbulatorio || (
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
                <th>CPF</th>
                <th>Endereço</th>
                <th>Email</th>
                <th>Ocupação no Ambulatório</th>
                <th>Especialidade</th>
                <th>nome de Usuário</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((employee) => (
                <tr key={employee._id}>
                  <td>{employee.nome}</td>
                  <td>{employee.CPF}</td>
                  <td>{employee.endereco}</td>
                  <td>{employee.Email}</td>
                  <td>{employee.ocupacaoAmbulatorio}</td>
                  <td>{employee.nomeEspecialidade}</td>
                  <td>{employee.username}</td>
                  <td>
                    <FontAwesomeIcon
                      icon={faEdit}
                      onClick={() => handleEditEmployee(employee)}
                      style={{ cursor: "pointer" }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {/*  COMEÇO DO MODAL DE EDIÇÃO  */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Editar Profissional</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="form-group">
            <label>Escolha os campos a serem editados:</label>
            <div className="edit-checkboxes">
              <div className="edit-field">
                <input
                  type="checkbox"
                  name="nome"
                  checked={editingFields.nome}
                  onChange={handleEditFieldSelection}
                />
                <label htmlFor="nome">Nome</label>
                <input
                  type="text"
                  className={`form-control ${
                    !editingFields.nome ? "disabled" : ""
                  }`}
                  value={
                    editingFields.nome ? editEmployee.nome || formData.nome : ""
                  }
                  onChange={handleFormChange}
                  disabled={!editingFields.nome}
                />
              </div>
              <div className="edit-field">
                <input
                  type="checkbox"
                  name="CPF"
                  checked={editingFields.CPF}
                  onChange={handleEditFieldSelection}
                />
                <label htmlFor="CPF">CPF</label>
                <input
                  type="text"
                  className={`form-control ${
                    !editingFields.CPF ? "disabled" : ""
                  }`}
                  value={
                    editingFields.CPF ? editEmployee.CPF || formData.CPF : ""
                  }
                  onChange={handleFormChange}
                  disabled={!editingFields.CPF}
                />
              </div>
              <div className="edit-field">
                <input
                  type="checkbox"
                  name="endereco"
                  checked={editingFields.endereco}
                  onChange={handleEditFieldSelection}
                />
                <label htmlFor="endereco">Endereço</label>
                <input
                  type="text"
                  className={`form-control ${
                    !editingFields.endereco ? "disabled" : ""
                  }`}
                  value={
                    editingFields.endereco
                      ? editEmployee.endereco || formData.endereco
                      : ""
                  }
                  onChange={handleFormChange}
                  disabled={!editingFields.endereco}
                />
              </div>
              <div className="edit-field">
                <input
                  type="checkbox"
                  name="ocupacaoAmbulatorio"
                  checked={editingFields.ocupacaoAmbulatorio}
                  onChange={handleEditFieldSelection}
                />
                <label htmlFor="ocupacaoAmbulatorio">
                  Função no Ambulatório
                </label>
                <select
                  className={`form-control ${
                    !editingFields.ocupacaoAmbulatorio ? "disabled" : ""
                  }`}
                  value={
                    editingFields.ocupacaoAmbulatorio
                      ? editEmployee.ocupacaoAmbulatorio ||
                        formData.ocupacaoAmbulatorio
                      : ""
                  }
                  onChange={handleFormChange}
                  disabled={!editingFields.ocupacaoAmbulatorio}
                >
                  <option value="Administrador">Administrador</option>
                  <option value="Assistente">Assistente</option>
                  <option value="Especialista">Especialista</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>
              <div className="edit-field">
                <input
                  type="checkbox"
                  name="Email"
                  checked={editingFields.Email}
                  onChange={handleEditFieldSelection}
                />
                <label htmlFor="Email">Email</label>
                <input
                  type="email"
                  className={`form-control ${
                    !editingFields.Email ? "disabled" : ""
                  }`}
                  value={
                    editingFields.Email
                      ? editEmployee.Email || formData.Email
                      : ""
                  }
                  onChange={handleFormChange}
                  disabled={!editingFields.Email}
                />
              </div>
              <div className="edit-field">
                <input
                  type="checkbox"
                  name="specialtyId"
                  checked={editingFields.specialtyId}
                  onChange={handleEditFieldSelection}
                />
                <label htmlFor="specialtyId">Especialidade</label>
                <select
                  className={`form-control ${
                    !editingFields.specialtyId ? "disabled" : ""
                  }`}
                  value={
                    editingFields.specialtyId
                      ? editEmployee.specialtyId || formData.specialtyId
                      : ""
                  }
                  onChange={handleFormChange}
                  disabled={!editingFields.specialtyId}
                >
                  {/* Opções de especialidade aqui */}
                </select>
              </div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Fechar
          </Button>
          <Button variant="primary" onClick={handleSaveEdit}>
            Salvar
          </Button>
        </Modal.Footer>
      </Modal>

      {/*  COMEÇO DO MODAL DE ADIÇÃO  */}

      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Adicionar Funcionário</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleFormSubmit}>
            <div className="form-group">
              <label htmlFor="nome">Nome</label>
              <input
                type="text"
                name="nome"
                id="nome"
                className="form-control"
                value={formData.nome}
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
                className={`form-control ${CPFIsValid ? "" : "is-invalid"}`}
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
              <label htmlFor="endereco">Endereço</label>
              <input
                type="text"
                name="endereco"
                id="endereco"
                className="form-control"
                value={formData.endereco}
                onChange={handleFormChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="occupation">Função no Ambulatório</label>
              <select
                name="occupation"
                id="occupation"
                className="form-control"
                value={selectedOccupation}
                onChange={handleFormChange}
                required
              >
                <option value="">Selecione uma função</option>
                {occupations.map((occupation) => (
                  <option key={occupation} value={occupation}>
                    {occupation}
                  </option>
                ))}
              </select>
            </div>

            <div
              className="form-group"
              style={{ display: showSpecialtyDropdown ? "block" : "none" }}
            >
              <label htmlFor="specialtyId">Especialidade</label>
              <select
                name="specialtyId"
                id="specialtyId"
                className="form-control"
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
                required
              >
                <option value="">Selecione uma especialidade</option>
                {specialties.map((specialty) => (
                  <option key={specialty._id} value={specialty.name}>
                    {specialty.name}
                  </option>
                ))}
              </select>
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
