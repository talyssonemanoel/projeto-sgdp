import React from "react";

const MensagemList = ({ mensagens }) => {
  return (
    <div className="mensagem-list">
      <ul>
        {mensagens.map((mensagem) => (
          <li key={mensagem.id}>
            <strong>Autor: {mensagem.autor}</strong>
            <p>{mensagem.texto}</p>
            <small>Data e Hora: {mensagem.dataEnvio}</small>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MensagemList;
