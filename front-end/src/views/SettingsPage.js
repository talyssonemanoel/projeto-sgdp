import React, { useState, useEffect } from "react";
import { Modal, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "bootstrap/dist/css/bootstrap.min.css";
import styles from "../css/SettingsPage.module.css"; // Importe o módulo CSS

const SettingsPage = () => {
    const navigate = useNavigate();
    const [userDetails, setUserDetails] = useState({
        nome: "SEM INFORMAÇÃO",
        username: "SEM INFORMAÇÃO",
        email: "SEM INFORMAÇÃO",
    });
    const [personDetails, setPersonDetails] = useState({
        sex: "SEM INFORMAÇÃO",
        phone: "SEM INFORMAÇÃO",
        address: "SEM INFORMAÇÃO",
    });
    const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editedValue, setEditedValue] = useState("");
    const [isPasswordValid, setIsPasswordValid] = useState(false);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [serverError, setServerError] = useState(false);

    const handleServerError = () => {
        setServerError(true);
    };

    const closeServerErrorModal = () => {
        setServerError(false);
        navigate("/acesso");
    };

    useEffect(() => {
        fetchUserDetails();
    }, []);

    const fetchUserDetails = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await api.get(`/verify/user-details?token=${token}`);

            const userData = response.data.user;
            const personData = response.data.personDetails;

            // Atualize apenas se os dados estiverem disponíveis
            if (userData) {
                setUserDetails(userData);
            }
            if (personData) {
                setPersonDetails(personData);
            }

            console.log(userData);
        } catch (error) {
            console.error("Erro ao buscar detalhes do usuário:", error);
            handleServerError();
        }
    };

    const openEditModal = (initialValue) => {
        setIsEditModalOpen(true);
        setEditedValue(initialValue);
    };

    const closeEditModal = () => {
        setIsEditModalOpen(false);
        setEditedValue("");
    };

    const handleEditSave = () => {
        // Atualize o estado correspondente com o valor editado
        if (editedValue !== "") {
            const updatedUserDetails = { ...userDetails, name: editedValue };
            setUserDetails(updatedUserDetails);
        }
        closeEditModal(); // Feche o modal após salvar
    };

    const handlePasswordChange = (event) => {
        const newPassword = event.target.value;
        setPassword(newPassword);

        // Validar senha
        const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
        setIsPasswordValid(passwordPattern.test(newPassword));
    };



    const handleSaveSettings = async () => {
        // Verifique se a senha e a confirmação de senha coincidem
        if (password !== confirmPassword) {
            alert("As senhas não coincidem.");
            return;
        }

        // Envie os dados para o servidor (você pode personalizar isso)
        try {
            await api.post("/settings", {
                ...userDetails,
                password,
            });

            alert("Configurações salvas com sucesso!");
        } catch (error) {
            console.error("Erro ao salvar configurações:", error);
            alert("Erro ao salvar configurações.");
        }
    };

    const openChangePasswordModal = () => {
        setIsChangePasswordModalOpen(true);
    };

    const closeChangePasswordModal = () => {
        setIsChangePasswordModalOpen(false);
    };

    const handleChangePassword = async () => {
        // Envie uma solicitação para a rota no backend para gerar uma nova senha aleatória
        try {
            const token = localStorage.getItem("token");
            await api.post("/verify/reset-password", {}, { params: { token } });

            alert("Solicitação de alteração de senha enviada com sucesso!");
            closeChangePasswordModal();
        } catch (error) {
            console.error("Erro ao enviar solicitação de alteração de senha:", error);
            alert("Erro ao enviar solicitação de alteração de senha.");
        }
    };

    return (
        <div className="body-settings">
            <div className={styles["settings-main-content"]} style={{margin: 0, padding: '20px'}}>
            <h2>Configurações</h2>
            <hr className={styles["settings-divider"]} />
            <div className={styles["settings-details-box"]}>
                <h4>Usuário</h4>
                <div className={styles["settings-form-group"]}>
                    <label className={styles["settings-label"]}>Nome</label>
                    <span className={userDetails.nome === "SEM INFORMAÇÃO" ? styles["settings-invalid"] : ""}>{userDetails.nome}</span>
                    <button className={styles["settings-button"]} onClick={() => openEditModal(userDetails.nome)}>Editar Nome</button>
                </div>
                <div className={styles["settings-form-group"]}>
                    <label className={styles["settings-label"]}>Nome de Usuário</label>
                    <span className={userDetails.username === "SEM INFORMAÇÃO" ? styles["settings-invalid"] : ""}>{userDetails.username}</span>
                </div>
                {/* Botão para abrir o modal de alteração de senha */}
                <div className={styles["settings-form-group"]}>
                    <label className={styles["settings-label"]}>Senha</label>
                    <button className={styles["settings-button"]} onClick={openChangePasswordModal}>
                        Alterar Senha
                    </button>
                </div>
            </div>
            <hr className={styles["settings-divider"]} />
            {/* Outros campos de configuração */}
            <div className={styles["settings-details-box"]}>
                <h4>Informações pessoais</h4>
                <div className={styles["settings-form-group"]}>
                    <label className={styles["settings-label"]}>Gênero</label>
                    <span className={personDetails.sex === "SEM INFORMAÇÃO" ? styles["settings-invalid"] : ""}>{personDetails.sex}</span>
                    <button className={styles["settings-button"]} onClick={() => openEditModal(personDetails.sex)}>Editar Gênero</button>
                </div>
                <div className={styles["settings-separator"]}></div>
                <div className={styles["settings-form-group"]}>
                    <label className={styles["settings-label"]}>Telefone</label>
                    <span className={personDetails.phone === "SEM INFORMAÇÃO" ? styles["settings-invalid"] : ""}>{personDetails.phone}</span>
                    <button className={styles["settings-button"]} onClick={() => openEditModal(personDetails.phone)}>Editar Telefone</button>
                </div>
                <div className={styles["settings-form-group"]}>
                    <label className={styles["settings-label"]}>Endereço</label>
                    <span className={personDetails.address === "SEM INFORMAÇÃO" ? styles["settings-invalid"] : ""}>{personDetails.address}</span>
                    <button className={styles["settings-button"]} onClick={() => openEditModal(personDetails.address)}>Editar Endereço</button>
                </div>
                <div className={styles["settings-form-group"]}>
                    <label className={styles["settings-label"]}>Email</label>
                    <span className={userDetails.email === "SEM INFORMAÇÃO" ? styles["settings-invalid"] : ""}>{userDetails.email}</span>
                    <button className={styles["settings-button"]} onClick={() => openEditModal(userDetails.email)}>Editar Email</button>
                </div>
            </div>
            <button className={styles["settings-button"]} onClick={handleSaveSettings}>Salvar Configurações</button>
            <Modal show={isChangePasswordModalOpen} onHide={closeChangePasswordModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Alterar Senha</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>
                        Clique em "Enviar" para solicitar uma nova senha aleatória. A nova senha será enviada para o seu email.
                    </p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={closeChangePasswordModal}>
                        Cancelar
                    </Button>
                    <Button variant="primary" onClick={handleChangePassword}>
                        Enviar
                    </Button>
                </Modal.Footer>
            </Modal>
            <Modal show={isEditModalOpen} onHide={closeEditModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Editar Informação</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <input
                        type="text"
                        value={editedValue}
                        onChange={(e) => setEditedValue(e.target.value)}
                        className={styles["settings-input"]}
                    />
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={closeEditModal}>
                        Cancelar
                    </Button>
                    <Button variant="primary" onClick={handleEditSave}>
                        Salvar
                    </Button>
                </Modal.Footer>
            </Modal>
            {serverError && (
                <div className={styles["error-modal-background"]}>
                    <Modal show={true} centered>
                        <Modal.Header>
                            <Modal.Title>Conta extraordinária</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <p>Esta conta não possui atributos adequados para serem alterados. Quaisquer dúvidas entre em contato com o suporte.</p>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="danger" onClick={closeServerErrorModal}>
                                Ir para início
                            </Button>
                        </Modal.Footer>
                    </Modal>
                </div>
            )}
            </div>
        </div>
        
    );
};

export default SettingsPage;
