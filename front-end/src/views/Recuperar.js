// src/Recuperar.js
import React, { useState } from 'react';
import api from '../services/api';
import "../css/Recuperar.css";

const Recuperar = () => {
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const handleInputChange = (e) => {
    setEmailOrUsername(e.target.value);
    setError(null);
    setSuccessMessage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Enviar solicitação de recuperação de senha para o backend
      const response = await api.post('/doctors/reset-password', {
        emailOrUsername,
      });

      // Se a solicitação for bem-sucedida, exibir uma mensagem de sucesso
      setSuccessMessage(response.data.message);
    } catch (error) {
      // Se houver um erro, exibir uma mensagem de erro
      setError(error.response?.data.error || 'Erro ao processar a solicitação.');
    }
  };

  return (
    <div className="recuperar-container">
      <div className="recuperar-form-container">
        <h2 className="recuperar-heading">Recuperação de Senha</h2>
        <form className="recuperar-form" onSubmit={handleSubmit}>
          <label className="recuperar-label">
            Email ou Nome de Usuário:
            <input
              type="text"
              value={emailOrUsername}
              onChange={handleInputChange}
              className="recuperar-input"
            />
          </label>
          <button type="submit" className="recuperar-button">Recuperar Senha</button>
        </form>
        {error && <p className="error-message">{error}</p>}
        {successMessage && <p className="success-message">{successMessage}</p>}
      </div>
    </div>
  );
};

export default Recuperar;
