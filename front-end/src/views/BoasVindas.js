import React, { useState, useEffect, useRef } from "react";
import api from "../services/api";
import NoticiasRSS from "./NoticiasRSS";
import "../css/BoasVindas.css";

const BoasVindas = ({ userInfo }) => {
  const [nomeUsuario, setNomeUsuario] = useState("");
  const [dataHora, setDataHora] = useState(new Date());
  const [mensagens, setMensagens] = useState([]);
  const [novaMensagem, setNovaMensagem] = useState("");
  const messagesRef = useRef(null);

  useEffect(() => {
    const timerID = setInterval(() => {
      setDataHora(new Date());
    }, 1000);

    return () => {
      clearInterval(timerID);
    };
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    api
      .get(`/verify/get-nome?token=${token}`)
      .then((response) => {
        const nomeCompleto = response.data.nome;
        const partesDoNome = nomeCompleto.split(" ");
        const primeiroNome = partesDoNome[0];
        setNomeUsuario(primeiroNome);
      })
      .catch((error) => {
        console.error("Erro ao obter o nome do usuário:", error);
      });
  }, [userInfo]);

  function formatarDataHora(dataHora) {
    const dataMensagem = new Date(dataHora);
    const dataAtual = new Date();

    const options = { hour: "numeric", minute: "numeric" };

    if (eHoje(dataMensagem, dataAtual)) {
      return "Hoje " + dataMensagem.toLocaleTimeString(undefined, options);
    } else if (eOntem(dataMensagem, dataAtual)) {
      return "Ontem " + dataMensagem.toLocaleTimeString(undefined, options);
    } else {
      return dataMensagem.toLocaleDateString(undefined, { year: "numeric", month: "numeric", day: "numeric" });
    }
  }

  function eOntem(dataMensagem, dataAtual) {
    const umDiaEmMilissegundos = 24 * 60 * 60 * 1000;
    const dataMensagemSemHora = new Date(dataMensagem.getFullYear(), dataMensagem.getMonth(), dataMensagem.getDate());
    const dataAtualSemHora = new Date(dataAtual.getFullYear(), dataAtual.getMonth(), dataAtual.getDate());
    return dataAtualSemHora - dataMensagemSemHora === umDiaEmMilissegundos;
  }

  function eHoje(dataMensagem, dataAtual) {
    const dataMensagemSemHora = new Date(dataMensagem.getFullYear(), dataMensagem.getMonth(), dataMensagem.getDate());
    const dataAtualSemHora = new Date(dataAtual.getFullYear(), dataAtual.getMonth(), dataAtual.getDate());
    return +dataMensagemSemHora === +dataAtualSemHora;
  }

  const adicionarMensagem = () => {
    const token = localStorage.getItem("token");
    api
      .post(`/prontuario/messages?token=${token}`, { mensagem: novaMensagem })
      .then((response) => {
        setNovaMensagem("");
      })
      .catch((error) => {
        console.error("Erro ao adicionar mensagem:", error);
      });
  };


  useEffect(() => {
    const token = localStorage.getItem("token");
    api
      .get(`/prontuario/messages?token=${token}`)
      .then((response) => {
        setMensagens(response.data.messages);
        console.log("Mensagens no estado:", mensagens);
      })
      .catch((error) => {
        console.error("Erro ao obter mensagens:", error);
      });
  }, []);

  const diaSemana = [
    "Domingo",
    "Segunda-feira",
    "Terça-feira",
    "Quarta-feira",
    "Quinta-feira",
    "Sexta-feira",
    "Sábado",
  ];
  const dia = diaSemana[dataHora.getDay()];
  const data = dataHora.toLocaleDateString();
  const hora = dataHora.toLocaleTimeString();

  const scrollMessagesToBottom = () => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollMessagesToBottom();
  }, [mensagens]);

  return (
    <div className="body-boas-vindas">
      <header className="boas-vindas-container">
        <h1 className="boas-vindas-title">Bem-vindo ao SDGP, {nomeUsuario}!</h1>
        <div className="boas-vindas-rss">
          <NoticiasRSS />
        </div>
      </header>

      <div className="boas-vindas-content">

        <div className="mensagens-container">
          <h3>Mural</h3>
          <div className="mensagens-form">
            <div className="input-group mb-3">
              <input
                type="text"
                className="form-control"
                placeholder="Digite sua mensagem..."
                value={novaMensagem}
                onChange={(e) => setNovaMensagem(e.target.value)}
              />
              <div className="input-group-append">
                <button
                  className="btn btn-primary"
                  type="button"
                  onClick={adicionarMensagem}
                >
                  Enviar
                </button>
              </div>
            </div>
          </div>
          <hr />

          <div className="mensagens-list" ref={messagesRef}>
            {Array.isArray(mensagens) ? (
              mensagens.slice().reverse().map((mensagem, index) => (
                <div className="mensagem" key={index}>
                  <strong>{mensagem.autor}:</strong> {mensagem.mensagem}
                  <span className="data-hora">{formatarDataHora(mensagem.dataHora)}</span>
                </div>
              ))
            ) : (
              <p>Nenhuma mensagem disponível.</p>
            )}
          </div>


        </div>
      </div>
    </div>
  );
};

export default BoasVindas;
