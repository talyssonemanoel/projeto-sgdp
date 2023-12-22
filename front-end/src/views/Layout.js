import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Outlet } from "react-router-dom";
import api from "../services/api";
import logoUern from "../img/LOGOMARCA_UERN_Branca-800-2.png";
import "../css/Layout.css";

const Layout = () => {
  const location = useLocation();
  const token = localStorage.getItem("token");
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMedio, setIsMedio] = useState(false);

  useEffect(() => {
    checkAdminPermission(token);
    checkMedioPermission(token);
  }, [token]);

  const checkMedioPermission = async (token) => {
    try {
      const medioResponse = await api.get(`/verify/medio?token=${token}`);
      if (medioResponse.status === 200) {
        setIsMedio(true); // Permissão concedida
      } else {
        setIsMedio(false); // Outro código de resposta
      }
    } catch (error) {
      console.error(error);
      setIsMedio(false);
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

  const handleLogout = async () => {
    try {
      await api.post(`logout?token=${token}`);
      window.location.reload();
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  return (
    <div className="main-layout fonte">
      <nav className="n-avbar titulonav">
        <div className="nav-links">
          <Link to="">
            <img className="logo-uern" src={logoUern} alt="UERN" />
          </Link>
          <div className="menu-nav-bar">
            <nav>
              <ul className="nav-links">
              {(isMedio || isAdmin) && (
                  <li>
                    <Link to="agenda">Agenda</Link>
                  </li>
                )}
                {(isMedio || isAdmin) && (
                  <li>
                    <Link to="atendimento">Atendimento</Link>
                  </li>
                )}
                <li>
                  <Link to="buscar-paciente">Pacientes</Link>
                </li>
                {isAdmin && (
                  <li>
                    <Link to="buscar-especialista">Profissionais</Link>
                  </li>
                )}
                {(isMedio || isAdmin) && (
                <li>
                  <Link to="especialidades">Especialidades</Link>
                </li>
                )}
                <li>
                  <Link to="prontuario">Prontuários</Link>
                </li>
                <li>
                  <Link to="configuracoes">Configurações</Link>
                </li>
              </ul>
            </nav>
            <div className="logout-button">
              <button onClick={handleLogout}>Sair</button>
            </div>
          </div>
        </div>
      </nav>
      <div className="body-layout">
        <div className="content-container">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;
