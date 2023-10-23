import React, { useState } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';
import api from '../services/api';
import EspecialistaPesquisa from './EspecialistaPesquisa';

const EditSpecialistModal = ({ show, handleClose, specialist, fetchSpecialists }) => {
  const [specialties, setSpecialties] = useState([]);
  const [editedSpecialist, setEditedSpecialist] = useState({
    name: '',
    cpf: '',
    dateOfBirth: '',
    sex: '',
    phone: '',
    email: '',
    startTime: '',
    endTime: '',
    specialtyId: '',
    residente: '',
  });

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

  const handleEditFieldChange = (e) => {
    const { name, value } = e.target;

    if (name === "residente") {
      const newValue = value === "" ? "" : value === "true";

      setEditedSpecialist({
        ...editedSpecialist,
        [name]: newValue,
      });
    } else {
      setEditedSpecialist({
        ...editedSpecialist,
        [name]: value,
      });
    }
  };

  const handleSaveEdit = async () => {
    try {
      const token = localStorage.getItem('token');
      const updatedFields = {};

      // Check each edited field and add it to the updatedFields object
      // Verifique cada campo editado e adicione-o ao objeto updatedFields
      if (editedSpecialist.name) {
        updatedFields.name = editedSpecialist.name;
      }
      if (editedSpecialist.cpf) {
        updatedFields.cpf = editedSpecialist.cpf;
      }
      if (editedSpecialist.dateOfBirth) {
        updatedFields.dateOfBirth = editedSpecialist.dateOfBirth;
      }
      if (editedSpecialist.sex) {
        updatedFields.sex = editedSpecialist.sex;
      }
      if (editedSpecialist.phone) {
        updatedFields.phone = editedSpecialist.phone;
      }
      if (editedSpecialist.email) {
        updatedFields.email = editedSpecialist.email;
      }
      if (editedSpecialist.startTime) {
        updatedFields.startTime = editedSpecialist.startTime;
      }
      if (editedSpecialist.endTime) {
        updatedFields.endTime = editedSpecialist.endTime;
      }
      if (editedSpecialist.specialtyId) {
        updatedFields.specialtyId = editedSpecialist.specialtyId;
      }
      if (typeof editedSpecialist.residente === 'boolean') {
        updatedFields.residente = editedSpecialist.residente;
      }

      if (Object.keys(updatedFields).length === 0) {
        handleClose();
        return;
      }

      const response = await api.put(`/doctors/${specialist._key}?token=${token}`, updatedFields);

      if (response.status === 200) {
        fetchSpecialists();
        handleClose();
      } else {
        console.error('Falha ao editar especialista:', response);
      }
    } catch (error) {
      console.error('Erro ao editar especialista:', error);
    }
  };

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

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Editar Especialista</Modal.Title>
      </Modal.Header>
      <Modal.Body>{renderEditFields()}</Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={handleSaveEdit}>
          Salvar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EditSpecialistModal;
