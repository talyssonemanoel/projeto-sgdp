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
  const [editEmployee, setEditEmployee] = useState({});
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
  const [editOccupation, setEditOccupation] = useState("");
  const [editSpecialty, setEditSpecialty] = useState("");
  const [selectedOccupation, setSelectedOccupation] =
    useState("Escolha uma função");
  const [showSpecialtyDropdown, setShowSpecialtyDropdown] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [noResultsMessage, setNoResultsMessage] = useState(""); // Mensagem de nenhum resultado
  const [specialties, setSpecialties] = useState([]); // Para armazenar as opções de especialidade
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState({});

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

  // Crie uma função que retorna os dados originais de um funcionário com base no _key
  function getOriginalEmployeeData(key) {
    const originalEmployee = employees.find(
      (employee) => employee._key === key
    );
    return originalEmployee || {}; // Retorna um objeto vazio se não encontrar
  }

  const handleShowEditModal = (employee) => {
    setEditEmployee(employee);
    setEditOccupation(employee.ocupacaoAmbulatorio); // Preencha a função
    setEditSpecialty(employee.nomeEspecialidade); // Preencha a especialidade
    setShowEditModal(true);
  };

  // Função para lidar com a submissão do formulário de edição
  const handleEditFormSubmit = async (e) => {
    e.preventDefault();

    if (editEmployee) {
      const dataToSubmit = {
        nome: editEmployee.nome,
        endereco: editEmployee.endereco,
        ocupacaoAmbulatorio: editOccupation,
        Email: editEmployee.Email,
        nomeEspecialidade: editSpecialty,
        CPF: editEmployee.CPF,
      };

      if (editOccupation !== "Especialista") {
        // Se a ocupação não for 'Especialista', defina 'nomeEspecialidade' como uma string vazia
        dataToSubmit.nomeEspecialidade = "";
      } else {
        dataToSubmit.nomeEspecialidade = editSpecialty;
      }

      if (editEmployee && editOccupation === "Especialista" && !editSpecialty) {
        // Se "Especialista" for selecionado na função e "Especialidade" estiver vazio
        // Exiba uma mensagem de erro e não permita o envio do formulário
        alert("Selecione uma especialidade para o especialista.");
        return;
      }

      if (editEmployee.CPF) {
        const isValidCPF = validateCPF(editEmployee.CPF);
        if (!isValidCPF) {
          // Se o CPF não for válido, exiba uma mensagem de erro
          setCPFIsValid(false);
          return;
        }
      }

      // Antes de continuar com a lógica de envio do formulário, crie um objeto temporário com os campos relevantes
      const relevantDataToSubmit = {
        nome: editEmployee.nome,
        endereco: editEmployee.endereco,
        ocupacaoAmbulatorio: editOccupation,
        Email: editEmployee.Email,
        nomeEspecialidade: editSpecialty,
        CPF: editEmployee.CPF, // Se houver algum campo adicional relevante
      };

      if (editEmployee) {
        const originalEmployeeData = getOriginalEmployeeData(editEmployee._key);

        // Realize a comparação entre editEmployee e originalEmployeeData
        const isDataUnchanged =
          editEmployee.nome === originalEmployeeData.nome &&
          editEmployee.endereco === originalEmployeeData.endereco &&
          editOccupation === originalEmployeeData.ocupacaoAmbulatorio &&
          editEmployee.Email === originalEmployeeData.Email &&
          editSpecialty === originalEmployeeData.nomeEspecialidade &&
          editEmployee.CPF === originalEmployeeData.CPF;

        if (isDataUnchanged) {
          // Se os dados não foram alterados
          alert("Nenhum campo foi alterado.");
          return;
        }

        // Continuar com o envio dos dados editados
      }

      try {
        const token = localStorage.getItem("token");
        await api.put(
          `/doctors/${editEmployee._key}?token=${token}`,
          dataToSubmit
        );

        // Lide com a resposta da edição do funcionário, se necessário
        handleCloseEditModal();
        fetchEmployees(searchQuery);
      } catch (error) {
        console.error("Erro ao editar profissional:", error);
        // Trate os erros apropriadamente
      }
    }
  };

  // Função para esconder o modal de edição
  const handleCloseEditModal = () => {
    setSelectedEmployee({}); // Defina como um objeto vazio ao fechar o modal de edição
    setShowEditModal(false);
  };

  // Função para lidar com as alterações nos campos de edição do modal
  const handleEditFormChange = (e) => {
    if (editEmployee) {
      const { name, value } = e.target;

      if (name === "occupation") {
        // Atualize a ocupação e mostre/oculte a lista suspensa de especialidade conforme necessário
        const updatedEmployee = { ...editEmployee, ocupacaoAmbulatorio: value };
        setEditEmployee(updatedEmployee);
        setShowSpecialtyDropdown(value === "Especialista");
      } else if (name === "CPF") {
        // Atualize o CPF formatado
        const formattedCPF = formatCPF(value);
        const updatedEmployee = { ...editEmployee, CPF: formattedCPF };
        setEditEmployee(updatedEmployee);
      } else if (name === "specialtyId") {
        // Atualize a especialidade selecionada
        const updatedEmployee = { ...editEmployee, nomeEspecialidade: value };
        setEditEmployee(updatedEmployee);
      } else {
        // Atualize os outros campos
        const updatedEmployee = { ...editEmployee, [name]: value };
        setEditEmployee(updatedEmployee);
      }
    }
  };

  // APAGAR ESPECIALISTAS

  const handleDeleteEmployee = async () => {
    if (editEmployee && editEmployee._key) {
      try {
        const token = localStorage.getItem("token");
        await api.delete(`/doctors/${editEmployee._key}?token=${token}`);
        // Lide com a exclusão bem-sucedida, se necessário
        handleCloseEditModal();
        fetchEmployees(searchQuery);
      } catch (error) {
        console.error("Erro ao excluir funcionário:", error);
        // Trate os erros apropriadamente
      }
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
    };

    // Inclua 'nomeEspecialidade' com o valor da especialidade selecionada
    if (selectedOccupation === "Especialista" && selectedSpecialty) {
      dataToSubmit.nomeEspecialidade = selectedSpecialty;
    }

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
      console.error("Erro ao adicionar profissional:", error);
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
        endereco: employee.endereco || (
          <span style={{ color: "red" }}>Sem dados</span>
        ),
        nomeEspecialidade: employee.nomeEspecialidade || (
          <span style={{ color: "red" }}>Sem dados</span>
        ),
        username: employee.username || (
          <span style={{ color: "red" }}>Sem dados</span>
        ),
      }));

      setEmployees(employeesWithSemDados);
    } catch (error) {
      console.error("Erro ao buscar profissionais:", error);
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
        Adicionar Profissionais
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
                      onClick={() => handleShowEditModal(employee)} // Passe o _key como argumento
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

      <Modal show={showEditModal} onHide={handleCloseEditModal}>
        <Modal.Header closeButton>
          <Modal.Title>Editar Profissional</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleEditFormSubmit}>
            <div className="form-group">
              <label htmlFor="nome">Nome</label>
              <input
                type="text"
                name="nome"
                id="nome"
                className="form-control"
                onChange={handleEditFormChange}
                value={editEmployee.nome || ""}
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
                onChange={handleEditFormChange}
                value={editEmployee.CPF || ""}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="endereco">Endereço</label>
              <input
                type="text"
                name="endereco"
                id="endereco"
                className="form-control"
                value={editEmployee ? editEmployee.endereco : ""}
                onChange={handleEditFormChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="occupation">Função no Ambulatório</label>
              <select
                name="occupation"
                id="occupation"
                className="form-control"
                value={editOccupation}
                onChange={(e) => setEditOccupation(e.target.value)}
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
              style={{
                display: editOccupation === "Especialista" ? "block" : "none",
              }}
            >
              <label htmlFor="specialtyId">Especialidade</label>
              <select
                name="specialtyId"
                id="specialtyId"
                className="form-control"
                value={editSpecialty === "[object Object]" ? "" : editSpecialty}
                onChange={(e) => setEditSpecialty(e.target.value)}
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
                value={editEmployee ? editEmployee.Email : ""}
                onChange={handleEditFormChange}
                required
              />
            </div>
            <Modal.Footer>
              <Button variant="danger" onClick={handleDeleteEmployee}>
                Excluir Profissional
              </Button>
              <Button variant="secondary" onClick={handleCloseEditModal}>
                Fechar
              </Button>
              <Button variant="primary" type="submit">
                Salvar Alterações
              </Button>
            </Modal.Footer>
          </form>
        </Modal.Body>
      </Modal>

      {/*  COMEÇO DO MODAL DE ADIÇÃO  */}

      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Adicionar Profissional</Modal.Title>
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
                Adicionar Profissional
              </Button>
            </Modal.Footer>
          </form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default EspecialistaPesquisa;
