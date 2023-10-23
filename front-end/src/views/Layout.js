import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Outlet } from "react-router-dom";
import api from "../services/api";
import logoUern from "../img/LOGOMARCA_UERN_Branca-800-2.png";
import "../css/Layout.css";

const Layout = () => {
  const location = useLocation();
  const token = localStorage.getItem("token");

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
            <Link to="/">
              <img className="logo-uern" src={logoUern} alt="UERN" />
            </Link>
            <div className="menu-nav-bar">
              <nav>
                <ul className="nav-links">
                  <li>
                    <Link to="/agendar">Agendamento</Link>
                  </li>
                  <li>
                    <Link to="/buscar-paciente">Pacientes</Link>
                  </li>
                  <li>
                    <Link to="/buscar-especialista">Profissionais</Link>
                  </li>
                  <li>
                    <Link to="/especialidades">Especialidades</Link>
                  </li>
                  <li>
                    <Link to="/prontuario">Prontuários</Link>
                  </li>
                  <li>
                    <Link to="/configuracoes">Configurações</Link>
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
