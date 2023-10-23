import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import "../css/Specialties.css"; // Importe seu arquivo de estilos CSS específico
import "bootstrap/dist/css/bootstrap.min.css"; // Importe o CSS do Bootstrap
import { Button, Modal, Form } from "react-bootstrap";
import { Plus } from "react-bootstrap-icons";

const Specialties = () => {
    const [specialties, setSpecialties] = useState([]);
    const [selectedSpecialty, setSelectedSpecialty] = useState(null);
    const [specialists, setSpecialists] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [newSpecialty, setNewSpecialty] = useState({
        name: "",
        description: "",
    });
    const [isAdmin, setIsAdmin] = useState(false); // Assumindo que o usuário é um administrador por padrão

    useEffect(() => {
        

        fetchSpecialties();
    }, []);

    const fetchSpecialties = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await api.get(`especialidade/all?token=${token}`);
            setSpecialties(response.data);
        } catch (error) {
            console.error("Erro ao buscar especialidades:", error);
        }
    };

    const handleSpecialtyClick = async (specialtyId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await api.get(`especialidade/specialists/${specialtyId}?token=${token}`);
            setSpecialists(response.data);
            setSelectedSpecialty(specialtyId);
        } catch (error) {
            console.error("Erro ao buscar especialistas da especialidade:", error);
        }
    };

    const handleClose = () => setShowModal(false);
    const handleShow = async () => {
        const token = localStorage.getItem("token");
        await checkAdminPermission(token);
        setShowModal(true);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setNewSpecialty({
            ...newSpecialty,
            [name]: value,
        });
    };

    const handleAddSpecialty = async () => {
        // Enviar os dados da nova especialidade para o servidor (você precisará implementar a lógica no backend).
        // Após o sucesso, feche o modal e atualize a lista de especialidades.
        if (!isAdmin) {
            return;
        }
        // Exemplo de chamada à API (você precisará implementar isso no seu projeto):
        try {
            const token = localStorage.getItem("token");
            const response = await api.post(`/especialidade/addSpecialty?token=${token}`, {
                ...newSpecialty
            });

            if (response.status === 200) {
                // A adição foi bem-sucedida. Você pode atualizar a lista de especialidades.
                // Você pode fazer isso com uma nova chamada à API ou atualizar o estado diretamente.
                fetchSpecialties();
                handleClose(); // Feche o modal após adicionar com sucesso.
            } else {
                console.error("Erro ao adicionar a especialidade:", response.data.error);
                // Aqui, você pode exibir uma mensagem de erro ao usuário, se necessário.
            }
        } catch (error) {
            console.error("Erro ao adicionar a especialidade:", error);
            // Aqui, você pode exibir uma mensagem de erro ao usuário, se necessário.
        }
    };

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

    return (
        <div className="specialties-container body-specialties">
            <div className="specialties-sidebar">
                <h2>
                    Especialidades
                    <Button style={{ marginLeft: "8px" }}
                        variant="primary"
                        size="sm"
                        onClick={handleShow}
                        className="ml-2"
                    >
                        <Plus size={20} />
                    </Button>
                </h2>

                <ul className="specialties-list">
                    {specialties.map((specialty) => (
                        <li key={specialty._key}>
                            <button
                                className="specialty-button"
                                onClick={() => handleSpecialtyClick(specialty._key)}
                            >
                                {specialty.name}
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="specialists-list">
                {selectedSpecialty ? (
                    <div>
                        <h2>Especialistas da especialidade</h2>
                        <ul>
                            {specialists.map((specialist) => (
                                <li key={specialist._key}>
                                    <button className="specialist-button">{specialist.name}</button>
                                </li>
                            ))}
                        </ul>
                    </div>
                ) : (
                    <p>Selecione uma especialidade para ver os especialistas.</p>
                )}
            </div>
            <Modal show={showModal} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Adicionar Especialidade</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {isAdmin ? ( // Verificar permissão de administrador
                        <Form>
                            <Form.Group controlId="formBasicName">
                                <Form.Label>Nome da Especialidade</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Nome da Especialidade"
                                    name="name"
                                    value={newSpecialty.name}
                                    onChange={handleChange}
                                />
                            </Form.Group>
                            <Form.Group controlId="formBasicDescription">
                                <Form.Label>Descrição da Especialidade</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    placeholder="Descrição da Especialidade"
                                    name="description"
                                    value={newSpecialty.description}
                                    onChange={handleChange}
                                />
                            </Form.Group>
                        </Form>
                    ) : (
                        <div>
                          <p>Acesso não autorizado. Você não tem permissão para adicionar especialidades.</p>
                          <div style={{ marginBottom: "10px" }}></div> {/* Espaço adicional */}
                          <Button variant="secondary" onClick={handleClose}>
                            Fechar
                          </Button>
                        </div>
                      )}
                </Modal.Body>
                <Modal.Footer>
                    {isAdmin && (
                        <Button variant="primary" onClick={handleAddSpecialty}>
                            Adicionar
                        </Button>
                    )}
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default Specialties;
