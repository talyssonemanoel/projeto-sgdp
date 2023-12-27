// AppWrapper.js
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Layout from "./views/Layout"; // Importe o seu componente Layout aqui
import api from './services/api';

const AppWrapper = () => {
  const location = useLocation();
  const token = localStorage.getItem("token");
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    const handleGlobalClick = () => {
      // Coloque aqui a lógica para verificar a autenticação
      if (!token) {
        setShowAuthModal(true);
      }
    };

    window.addEventListener("click", handleGlobalClick);

    return () => {
      window.removeEventListener("click", handleGlobalClick);
    };
  }, [token]);

  const handleCloseAuthModal = () => {
    setShowAuthModal(false);
  };

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const response = await api.get(`verify?token=${token}`);
        if (response.status === 200) {
          // Token válido
        } else if (response.status === 401) {
          // Token inválido - exibe o modal
          setShowAuthModal(true);
        }
      } catch (error) {
        console.error(error);
        // Erro ao verificar o token - exibe o modal
        setShowAuthModal(true);
      }
    };

    // Verifica o token apenas se estiver presente
    if (token) {
      verifyToken();
    }
  }, [token]); // Adiciona o token como uma dependência

  return (
    <div>
      {/* Renderiza o Layout com a prop `showAuthModal` */}
      <Layout showAuthModal={showAuthModal} onCloseAuthModal={handleCloseAuthModal} />
    </div>
  );
};

export default AppWrapper;
