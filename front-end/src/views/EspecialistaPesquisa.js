import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import api from "../services/api";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Table,
  Modal,
} from "react-bootstrap";
import "../css/EspecialistaPesquisa.css";

const EspecialistaPesquisa = () => {
  const initialSpecialistState = {
    name: "",
    cpf: "",
    dateOfBirth: "",
    sex: "",
    phone: "",
    email: "",
    startTime: "",
    endTime: "",
    specialtyId: "",
    residente: "",
  };

  const [query, setQuery] = useState("");
  const [searchBy, setSearchBy] = useState("all");
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSpecialist, setSelectedSpecialist] = useState(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [selectedSpecialistKeyToDelete, setSelectedSpecialistKeyToDelete] = useState(null);
  const [specialties, setSpecialties] = useState([]);
  const [specialists, setSpecialists] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false); // Estado para armazenar a permissão do administrador
  const [newSpecialist, setNewSpecialist] = useState({ ...initialSpecialistState });
  const [showAddModal, setShowAddModal] = useState(false);
  const [editedSpecialist, setEditedSpecialist] = useState({ ...initialSpecialistState });

  const handleOpenDeleteConfirmation = () => {
    setShowDeleteConfirmation(true);
  };

  const handleCloseDeleteConfirmation = () => {
    setShowDeleteConfirmation(false);
  };

  const handleOpenAddModal = () => {
    setShowAddModal(true);
  };

  const handleCloseAddModal = () => {
    setShowAddModal(false);
    setNewSpecialist({ ...initialSpecialistState });
  };

  const handleAddFieldChange = (e) => {
    const { name, value } = e.target;
    const newValue = name === "residente" ? value === "true" : value;
    setNewSpecialist({ ...newSpecialist, [name]: newValue });
  };

  const requiredFields = ["name", "cpf", "phone", "specialtyId"];

  const handleAddSpecialist = async () => {
    try {
      const token = localStorage.getItem("token");

      for (const field of requiredFields) {
        if (!newSpecialist[field]) {
          alert(`Campo '${field}' é obrigatório.`);
          return;
        }
      }

      console.log(newSpecialist);
      const response = await api.post(`/doctors/add?token=${token}`, newSpecialist);

      if (response.status === 201) {
        fetchSpecialists();
        handleCloseAddModal();
      } else {
        console.error("Falha ao adicionar especialista:", response);
      }
    } catch (error) {
      console.error("Erro ao adicionar especialista:", error);
    }
  };

  const handleEditFieldChange = (e) => {
    const { name, value } = e.target;
    const newValue = name === "residente" ? (value === "" ? "" : value === "true") : value;

    setEditedSpecialist({ ...editedSpecialist, [name]: newValue });
  };

  const handleSaveEdit = async () => {
    try {
      const token = localStorage.getItem("token");
      const updatedFields = {};

      for (const field in editedSpecialist) {
        if (editedSpecialist[field] !== newSpecialist[field]) {
          updatedFields[field] = editedSpecialist[field];
        }
      }

      if (Object.keys(updatedFields).length === 0) {
        handleCloseEditModal();
        return;
      }

      const response = await api.put(`/doctors/${selectedSpecialist._key}?token=${token}`, updatedFields);

      if (response.status === 200) {
        fetchSpecialists();
        handleCloseEditModal();
      } else {
        console.error("Falha ao editar especialista:", response);
      }
    } catch (error) {
      console.error("Erro ao editar especialista:", error);
    }
  };

  async function fetchSpecialties() {
    const token = localStorage.getItem("token");
    try {
      const response = await api.get(`/especialidade/all?token=${token}`);
      if (response.status === 200) {
        setSpecialties(response.data);
      } else {
        console.error("Erro ao buscar especialidades:", response);
      }
    } catch (error) {
      console.error("Erro ao buscar especialidades:", error);
    }
  }

  fetchSpecialties();

  function findSpecialtyNameById(specialtyId) {
    const specialty = specialties.find((s) => s._id === specialtyId);
    return specialty ? specialty.name : "";
  }

  // Renderização dos campos de edição dentro do Modal.Body
  const renderEditFields = () => {
    return (
      <Form>
        <Form.Group controlId="name">
          <Form.Label>Nome</Form.Label>
          <Form.Control
            type="text"
            name="name"
            value={editedSpecialist.name}
            onChange={handleEditFieldChange}
          />
        </Form.Group>

        <Form.Group controlId="cpf">
          <Form.Label>CPF</Form.Label>
          <Form.Control
            type="text"
            name="cpf"
            value={editedSpecialist.cpf}
            onChange={handleEditFieldChange}
          />
        </Form.Group>

        <Form.Group controlId="dateOfBirth">
          <Form.Label>Data de Nascimento</Form.Label>
          <Form.Control
            type="date"
            name="dateOfBirth"
            value={editedSpecialist.dateOfBirth}
            onChange={handleEditFieldChange}
          />
        </Form.Group>

        <Form.Group controlId="sex">
          <Form.Label>Sexo</Form.Label>
          <Form.Control
            as="select"
            name="sex"
            value={editedSpecialist.sex}
            onChange={handleEditFieldChange}
          >
            <option value="">Selecione uma opção</option>
            <option value="masculino">Masculino</option>
            <option value="feminino">Feminino</option>
            <option value="outro">Outro</option>
          </Form.Control>
        </Form.Group>

        <Form.Group controlId="phone">
          <Form.Label>Telefone</Form.Label>
          <Form.Control
            type="text"
            name="phone"
            value={editedSpecialist.phone}
            onChange={handleEditFieldChange}
          />
        </Form.Group>

        <Form.Group controlId="email">
          <Form.Label>E-mail</Form.Label>
          <Form.Control
            type="email"
            name="email"
            value={editedSpecialist.email}
            onChange={handleEditFieldChange}
          />
        </Form.Group>

        <Form.Group controlId="startTime">
          <Form.Label>Entrada</Form.Label>
          <Form.Control
            type="time"
            name="startTime"
            value={editedSpecialist.startTime}
            onChange={handleEditFieldChange}
          />
        </Form.Group>

        <Form.Group controlId="endTime">
          <Form.Label>Saída</Form.Label>
          <Form.Control
            type="time"
            name="endTime"
            value={editedSpecialist.endTime}
            onChange={handleEditFieldChange}
          />
        </Form.Group>

        <Form.Group controlId="specialtyId">
          <Form.Label>Especialidade</Form.Label>
          <Form.Control
            as="select"
            name="specialtyId"
            value={editedSpecialist.specialtyId}
            onChange={handleEditFieldChange}
          >
            <option value="">Selecione uma especialidade</option>
            {specialties.map((specialtyId) => (
              <option key={specialtyId._id} value={specialtyId._id}>
                {specialtyId.name}
              </option>
            ))}
          </Form.Control>
        </Form.Group>

        <Form.Group controlId="residente">
          <Form.Label>É Residente?</Form.Label>
          <Form.Select
            name="residente"
            value={editedSpecialist.residente}
            onChange={handleEditFieldChange}
          >
            <option value="">Selecione uma opção</option>
            <option value={true}>SIM</option>
            <option value={false}>NÃO</option>
          </Form.Select>
        </Form.Group>
      </Form>
    );
  };

  // Renderização dos campos de edição dentro do Modal.Body
  const renderAddFields = () => {
    return (
      <Form>
        {/* Adicione os campos obrigatórios aqui */}
        <Form.Group controlId="name">
          <Form.Label>Nome</Form.Label>
          <Form.Control
            type="text"
            name="name"
            value={newSpecialist.name}
            onChange={handleAddFieldChange}
          />
        </Form.Group>
        <Form.Group controlId="cpf">
          <Form.Label>CPF</Form.Label>
          <Form.Control
            type="text"
            name="cpf"
            value={newSpecialist.cpf}
            onChange={handleAddFieldChange}
          />
        </Form.Group>
        <Form.Group controlId="dateOfBirth">
          <Form.Label>Data de Nascimento</Form.Label>
          <Form.Control
            type="date"
            name="dateOfBirth"
            value={newSpecialist.dateOfBirth}
            onChange={handleAddFieldChange}
          />
        </Form.Group>

        <Form.Group controlId="sex">
          <Form.Label>Sexo</Form.Label>
          <Form.Control
            as="select"
            name="sex"
            value={newSpecialist.sex}
            onChange={handleAddFieldChange}
          >
            <option value="">Selecione uma opção</option>
            <option value="masculino">Masculino</option>
            <option value="feminino">Feminino</option>
            <option value="outro">Outro</option>
          </Form.Control>
        </Form.Group>
        <Form.Group controlId="phone">
          <Form.Label>Telefone</Form.Label>
          <Form.Control
            type="text"
            name="phone"
            value={newSpecialist.phone}
            onChange={handleAddFieldChange}
          />
        </Form.Group>
        <Form.Group controlId="email">
          <Form.Label>E-mail</Form.Label>
          <Form.Control
            type="email"
            name="email"
            value={newSpecialist.email}
            onChange={handleAddFieldChange}
          />
        </Form.Group>

        <Form.Group controlId="startTime">
          <Form.Label>Entrada</Form.Label>
          <Form.Control
            type="time"
            name="startTime"
            value={newSpecialist.startTime}
            onChange={handleAddFieldChange}
          />
        </Form.Group>

        <Form.Group controlId="endTime">
          <Form.Label>Saída</Form.Label>
          <Form.Control
            type="time"
            name="endTime"
            value={newSpecialist.endTime}
            onChange={handleAddFieldChange}
          />
        </Form.Group>

        <Form.Group controlId="specialtyId">
          <Form.Label>Especialidade</Form.Label>
          <Form.Control
            as="select"
            name="specialtyId"
            value={newSpecialist.specialtyId}
            onChange={handleAddFieldChange}
          >
            <option value="">Selecione uma especialidade</option>
            {specialties.map((specialtyId) => (
              <option key={specialtyId._id} value={specialtyId._id}>
                {specialtyId.name}
              </option>
            ))}
          </Form.Control>
        </Form.Group>

        <Form.Group controlId="residente">
          <Form.Label>É Residente?</Form.Label>
          <Form.Select
            name="residente"
            value={newSpecialist.residente}
            onChange={handleAddFieldChange}
          >
            <option value="">Selecione uma opção</option>
            <option value={true}>SIM</option>
            <option value={false}>NÃO</option>
          </Form.Select>
        </Form.Group>
      </Form>
    );
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    checkAdminPermission(token);
  }, []);

  const checkAdminPermission = async (token) => {
    try {
      const response = await api.get(`/verify/admin?token=${token}`);
      if (response.status === 200) {
        setIsAdmin(true); // Permissão concedida
      } else {
        setIsAdmin(false); // Outro código de resposta
      }
    } catch (error) {
      console.error(error);
      setIsAdmin(false);
    }
  };

  const handleOpenEditModal = (specialist) => {
    setSelectedSpecialist(specialist);
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setSelectedSpecialist(null);
    setShowEditModal(false);
  };

  const fetchSpecialists = async () => {
    try {
      let response;
      const token = localStorage.getItem("token");
      if (searchBy === "all") {
        response = await api.get(`/doctors/search?token=${token}`);
      } else {
        response = await api.get(`/doctors/search/${query}?token=${token}`);
      }
      setSpecialists(response.data);
    } catch (error) {
      console.error(error);
      alert("Erro ao buscar especialistas");
    }
  };

  const handleDeleteSpecialist = (specialistKey) => {
    // Defina o especialista a ser excluído no estado
    setSelectedSpecialist(specialistKey);

    // Abra a caixa de diálogo de confirmação
    handleOpenDeleteConfirmation();
  };

  const handleConfirmDelete = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await api.delete(
        `/doctors/${selectedSpecialist}?token=${token}`
      );
      if (response.status === 204) {
        // Atualize a lista de especialistas após a exclusão
        fetchSpecialists();
      } else {
        console.error("Falha ao excluir especialista:", response);
      }
    } catch (error) {
      console.error("Erro ao excluir especialista:", error);
    } finally {
      // Feche a caixa de diálogo de confirmação
      handleCloseDeleteConfirmation();
    }
  };

  const handleChangeQuery = (e) => {
    setQuery(e.target.value);
  };

  const handleChangeSearchBy = (e) => {
    setSearchBy(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchSpecialists();
  };

  if (!isAdmin) {
    return <p>Acesso não autorizado</p>;
  }

  return (
    <Container className="body-especialista-pesquisa" style={{ padding: '12px', margin: 0, width: '1200px', height: '557px' }}>
      <Row>
        <Col style={{ paddingRight: 70 }}>
          <h1>Gerenciar Especialistas</h1>
          <Button variant="primary" onClick={handleOpenAddModal}>
            Adicionar Especialista
          </Button>
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="query">
              <Form.Label>Valor da busca</Form.Label>
              <Form.Control
                type="text"
                placeholder="Digite o valor da busca"
                value={query}
                onChange={handleChangeQuery}
              />
            </Form.Group>
            <Form.Group controlId="searchBy">
              <Form.Label>Tipo de busca</Form.Label>
              <Form.Control
                as="select"
                value={searchBy}
                onChange={handleChangeSearchBy}
              >
                <option value="all">Todos os especialistas</option>
                <option value="id">ID</option>
                <option value="name">Nome</option>
                <option value="cpf">CPF</option>
                {/* Add more search criteria if needed */}
              </Form.Control>
            </Form.Group>
            <Button variant="primary" type="submit">
              Pesquisar
            </Button>
          </Form>
        </Col>
      </Row>
      <Row>
        <Col>
          <h2>Resultados da busca</h2>
          {specialists.length > 0 ? (
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>CPF</th>
                  <th>Data de nascimento</th>
                  <th>Sexo</th>
                  <th>Telefone</th>
                  <th>E-mail</th>
                  <th>Entrada</th>
                  <th>Saída</th>
                  <th>Especialidade</th>
                  <th>É Residente?</th>
                </tr>
              </thead>
              <tbody>
                {specialists.map((specialist) => (
                  <tr key={specialist._key}>
                    <td>{specialist.name}</td>
                    <td>{specialist.cpf}</td>
                    <td>{specialist.dateOfBirth}</td>
                    <td>{specialist.sex}</td>
                    <td>{specialist.phone}</td>
                    <td>{specialist.email}</td>
                    <td>{specialist.startTime}</td>
                    <td>{specialist.endTime}</td>
                    <td>{findSpecialtyNameById(specialist.specialtyId)}</td>
                    <td>{specialist.residente ? "SIM" : "NÃO"}</td>
                    <td>
                      <button onClick={() => handleOpenEditModal(specialist)} style={{
                        background: 'transparent',
                        border: 'none',
                        outline: 'none', // Isso remove a borda quando o botão é focado
                        padding: 0, // Isso remove o preenchimento interno do botão
                        cursor: 'pointer',
                      }}>
                        <FontAwesomeIcon icon={faEdit} style={{ color: 'blue', cursor: 'pointer' }} />
                      </button>
                      <button
                        onClick={() => handleDeleteSpecialist(specialist._key)} style={{
                          background: 'transparent',
                          border: 'none',
                          outline: 'none', // Isso remove a borda quando o botão é focado
                          padding: 0, // Isso remove o preenchimento interno do botão
                          cursor: 'pointer',
                        }}
                      >
                        <FontAwesomeIcon icon={faTrash} style={{ color: 'red', cursor: 'pointer' }} />
                      </button>
                    </td>
                  </tr>
                ))}
                <Modal show={showEditModal} onHide={handleCloseEditModal}>
                  <Modal.Header closeButton>
                    <Modal.Title>Editar Especialista</Modal.Title>
                  </Modal.Header>
                  <Modal.Body>{renderEditFields()}</Modal.Body>
                  <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseEditModal}>
                      Cancelar
                    </Button>
                    <Button variant="primary" onClick={handleSaveEdit}>
                      Salvar
                    </Button>
                  </Modal.Footer>
                </Modal>
              </tbody>
            </Table>
          ) : (
            <p>Nenhum especialista encontrado.</p>
          )}
        </Col>
      </Row>
      <Modal show={showAddModal} onHide={handleCloseAddModal}>
        <Modal.Header closeButton>
          <Modal.Title>Adicionar Especialista</Modal.Title>
        </Modal.Header>
        <Modal.Body>{renderAddFields()}</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseAddModal}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleAddSpecialist}>
            Adicionar
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal show={showDeleteConfirmation} onHide={handleCloseDeleteConfirmation}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmação de Exclusão</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Tem certeza de que deseja excluir este especialista?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDeleteConfirmation}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleConfirmDelete}>
            Excluir
          </Button>
        </Modal.Footer>
      </Modal>

    </Container>
  );
};

export default EspecialistaPesquisa;
