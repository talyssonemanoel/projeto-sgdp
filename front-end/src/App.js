import React, { useState, useEffect, createContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import api from './services/api';
import Login from "./views/Login";
import AgendamentoAgendar from "./views/AgendamentoAgendar";
import AgendamentoCancelar from "./views/AgendamentoCancelar";
import PacienteCadastro from "./views/PacienteCadastro";
import PacientePesquisa from "./views/PacientePesquisa";
import EspecialistaCadastrar from "./views/EspecialistaCadastrar";
import EspecialistaPesquisa from "./views/EspecialistaPesquisa";
import Specialties from "./views/Specialties";
import SettingsPage from "./views/SettingsPage";
import Layout from "./views/Layout";
import BoasVindas from "./views/BoasVindas";
import Prontuario from "./views/Prontuario";

export const AuthContext = createContext();

const App = () => {
  const [authData, setAuthData] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");

    if (storedToken) {
      verifyToken(storedToken);
    } else {
      setAuthData(false); // Defina como não autenticado se não houver token
    }
  }, []);

  const verifyToken = async (token) => {
    try {
      const response = await api.get(`verify?token=${token}`);
      if (response.status === 200) {
        setAuthData(true); // Defina como autenticado se o token for válido
      } else if (response.status === 401) {
        setAuthData(false); // Defina como não autenticado se o token for inválido
      }
    } catch (error) {
      console.error(error);
      setAuthData(false); // Defina como não autenticado em caso de erro
    }
  };

  if (authData === null) {
    return null; // Aguarde a verificação antes de renderizar qualquer coisa
  }


  return (
    <AuthContext.Provider value={{ authData, setAuthData }}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={authData ? <Layout /> : <Navigate to="/login" replace />}>
        <Route index element={<BoasVindas />} />
          <Route path="agendar" element={<AgendamentoAgendar />} />
          <Route path="cancelar-agendamento" element={<AgendamentoCancelar />} />
          <Route path="cadastrar-paciente" element={<PacienteCadastro />} />
          <Route path="buscar-paciente" element={<PacientePesquisa />} />
          <Route path="cadastrar-especialista" element={<EspecialistaCadastrar />} />
          <Route path="buscar-especialista" element={<EspecialistaPesquisa />} />
          <Route path="boas-vindas" element={<BoasVindas />} /> {/* Adicione esta linha */}
          <Route path="configuracoes" element={<SettingsPage />} /> {/* Adicione esta linha */}
          <Route path="prontuario" element={<Prontuario />} /> {/* Adicione esta linha */}
          <Route path="especialidades" element={<Specialties />} />
        </Route>
        <Route path="*" element={<div>Página não encontrada</div>} />
      </Routes>
    </AuthContext.Provider>
  );
};

export default App;
