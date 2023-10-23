import React, { useState } from "react";
import { Modal, Form, Button } from "react-bootstrap";
import api from "../services/api";
import EspecialistaPesquisa from './EspecialistaPesquisa';

const AddSpecialistModal = ({ show, handleClose, fetchSpecialists }) => {
  const [specialties, setSpecialties] = useState([]);
  const [newSpecialist, setNewSpecialist] = useState({
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
  });

  const handleAddFieldChange = (e) => {
    const { name, value } = e.target;
    const newValue = name === "residente" ? value === "true" : value;

    setNewSpecialist({
      ...newSpecialist,
      [name]: newValue,
    });
  };

  const handleAddSpecialist = async () => {
    try {
      const token = localStorage.getItem("token");
      const requiredFields = ["name", "cpf", "phone", "specialtyId"];

      for (const field of requiredFields) {
        if (!newSpecialist[field]) {
          alert(`Campo '${field}' é obrigatório.`);
          return;
        }
      }

      const response = await api.post(
        `/doctors/add?token=${token}`,
        newSpecialist
      );

      if (response.status === 201) {
        fetchSpecialists();
        handleClose();
      } else {
        console.error("Falha ao adicionar especialista:", response);
      }
    } catch (error) {
      console.error("Erro ao adicionar especialista:", error);
    }
  };

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

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Adicionar Especialista</Modal.Title>
      </Modal.Header>
      <Modal.Body>{renderAddFields()}</Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={handleAddSpecialist}>
          Adicionar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AddSpecialistModal;
