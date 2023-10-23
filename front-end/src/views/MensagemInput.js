import React, { useState } from "react";

const MensagemInput = ({ onAdicionarMensagem }) => {
  const [novaMensagem, setNovaMensagem] = useState("");

  const handleAdicionarMensagem = () => {
    if (novaMensagem.trim() !== "") {
      onAdicionarMensagem(novaMensagem);
      setNovaMensagem("");
    }
  };

  return (
    <div className="mensagem-input">
      <input
        type="text"
        placeholder="Digite sua mensagem..."
        value={novaMensagem}
        onChange={(e) => setNovaMensagem(e.target.value)}
      />
      <button onClick={handleAdicionarMensagem}>Enviar</button>
    </div>
  );
};

export default MensagemInput;
