import React, { useState, useEffect, createContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Modal, Button } from "react-bootstrap";
import api from './services/api';
import Login from "./views/Login";
import Agenda from "./views/Agenda";
import AgendamentoCancelar from "./views/AgendamentoCancelar";
import PacienteCadastro from "./views/PacienteCadastro";
import PacientePesquisa from "./views/PacientePesquisa";
import EspecialistaCadastrar from "./views/EspecialistaCadastrar";
import EspecialistaPesquisa from "./views/EspecialistaPesquisa";
import Recuperar from "./views/Recuperar";
import Specialties from "./views/Specialties";
import SettingsPage from "./views/SettingsPage";
import AppWrapper from "./AppWrapper";
import Layout from "./views/Layout";
import BoasVindas from "./views/BoasVindas";
import Prontuario from "./views/Prontuario";
import ProntuarioEspecialista from "./views/ProntuarioEspecialista";
import AgendaEspecialista from "./views/AgendaEspecialista";
import PublicAgendamento from "./views/PublicAgendamento";

const User = {
    _id: "Employees/8002982",
    _key: "8002982",
    nome: "Rashi",
    endereco: "R. Amaro Domingos",
    ocupacaoAmbulatorio: "Especialista",
    CPF: "865.538.410-04",
    idEspecialidade: "6975847",
    nomeEspecialidade: "Massoterapeuta",
    Email: "zhivka6254@uorak.com",
  }

  export const AuthContext = createContext();

  const App = () => {
    const [authData, setAuthData] = useState(null);
    const [tokenChecked, setTokenChecked] = useState(false);
    const [showSessionExpiredModal, setShowSessionExpiredModal] = useState(false);
  
    useEffect(() => {
      const storedToken = localStorage.getItem("token");
  
      if (storedToken) {
        verifyToken(storedToken);
      } else {
        setAuthData(false);
        setTokenChecked(true); // Marcar como verificado mesmo que não haja token
      }
  
      const clickListener = () => {
        verifyToken(localStorage.getItem("token"));
      };
  
      window.addEventListener("click", clickListener);
  
      return () => {
        window.removeEventListener("click", clickListener);
      };
    }, []);
  
    useEffect(() => {
      // Se a verificação do token foi feita e o token não é válido, exibir o modal
      if (tokenChecked && authData === false) {
        setShowSessionExpiredModal(true);
      }
    }, [tokenChecked, authData]);
  
    const verifyToken = async (token) => {
      try {
        const response = await api.get(`verify?token=${token}`);
        if (response.status === 200) {
          setAuthData(true);
        } else if (response.status === 401) {
          setAuthData(false);
        }
      } catch (error) {
        console.error(error);
        setAuthData(false);
      } finally {
        setTokenChecked(true); // Marcar como verificado após a tentativa de verificação
      }
    };
  
    const handleCloseModal = () => {
      setShowSessionExpiredModal(false);
      setAuthData(false);
    };
  
    if (!tokenChecked) {
      return null; // Aguarde a verificação antes de renderizar qualquer coisa
    }

  return (
    <AuthContext.Provider value={{ authData, setAuthData }}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/acesso" element={authData ? <AppWrapper /> : <Navigate to="/login" replace />}>
        <Route index element={<BoasVindas />} />
          <Route path="agenda" element={<Agenda />} />
          <Route path="agenda2" element={<AgendaEspecialista User={User}/>} />
          <Route path="cancelar-agendamento" element={<AgendamentoCancelar />} />
          <Route path="cadastrar-paciente" element={<PacienteCadastro />} />
          <Route path="buscar-paciente" element={<PacientePesquisa />} />
          <Route path="cadastrar-especialista" element={<EspecialistaCadastrar />} />
          <Route path="buscar-especialista" element={<EspecialistaPesquisa />} />
          <Route path="boas-vindas" element={<BoasVindas />} /> {/* Adicione esta linha */}
          <Route path="configuracoes" element={<SettingsPage />} /> {/* Adicione esta linha */}
          <Route path="prontuario" element={<Prontuario />} /> {/* Adicione esta linha */}
          <Route path="prontuario2" element={<ProntuarioEspecialista User={User}/>} /> {/* Adicione esta linha */}
          <Route path="especialidades" element={<Specialties />} />
        </Route>
        <Route path="/" element={<PublicAgendamento />} />
        <Route path="/recovery" element={<Recuperar />} />
        <Route path="*" element={<div>Página não encontrada</div>} />
      </Routes>
      {/* Modal para a sessão expirada */}
      <Modal show={showSessionExpiredModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Sessão Expirada</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Sua sessão expirou. Por favor, faça login novamente.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleCloseModal}>
            Fechar
          </Button>
        </Modal.Footer>
      </Modal>
    </AuthContext.Provider>
  );
};

export default App;
