// Importar os módulos necessários
import React from "react";
import api from "../services/api";
import { AuthContext } from "../App";
import checkAdminPermission from "../services/verifyAdmin";
import "../css/login.css";
import logoImage from "../img/faen.jpg";
import { useNavigate, Link } from "react-router-dom";

// Criar um hook personalizado para gerenciar os estados do login
const useLogin = () => {
  const [username, setUsername] = React.useState(""); // Estado para o username
  const [password, setPassword] = React.useState(""); // Estado para a senha
  const [error, setError] = React.useState(""); // Estado para o erro
  const { setAuthData } = React.useContext(AuthContext); // Função do contexto de autenticação
  const navigate = useNavigate(); // Instância do hook useNavigate

// Função que faz o login do usuário
const login = async () => {
  try {
    const response = await api.post("/login", { username, password });
    if (response.status === 200 && response.data.token) {
      const isAdmin = await checkAdminPermission();
      localStorage.setItem("isAdmin", isAdmin);
      localStorage.setItem("token", response.data.token);
      setAuthData(response.data);
      navigate("/acesso");
    } else {
      throw new Error("Usuário ou senha incorretos");
    }
  } catch (error) {
    if (error.response && error.response.status === 401) {
      setError("Usuário ou senha incorretos");
    } else {
      setError(
        "Ocorreu um erro com o servidor, entre em contato com suporte@telprogramacao.com.br"
      );
    }
  }
};


  // Retornar os estados e a função de login
  return { username, setUsername, password, setPassword, error, login };
};

const ErrorMessage = ({ error }) => {
  if (error) {
    return (
      <p className="error-message">
        {error}
      </p>
    );
  } else {
    return null;
  }
};

const LoginForm = ({ username, setUsername, password, setPassword, login }) => {
  return (
    <form
      className="login-form"
      onSubmit={(e) => {
        e.preventDefault();
        login();
      }}
    >
      <input
        className="login-input"
        type="username"
        name="username"
        placeholder="Digite seu nome de usuário"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        className="login-input"
        type="password"
        name="password"
        placeholder="Digite sua senha"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit" className="login-button">
        Entrar
      </button>
    </form>
  );
};

const LoginPage = () => {
  const { username, setUsername, password, setPassword, error, login } =
    useLogin();

  return (
    <div className="body-login">
      <div className="login-container">
        <img src={logoImage} alt="logo" className="logo" />
        <div className="form">
          <h1 className="login-heading">
            Bem-vindo ao Sistema Digital de Gestão de Prontuários
          </h1>
          <LoginForm
            username={username}
            setUsername={setUsername}
            password={password}
            setPassword={setPassword}
            login={login}
          />
          <ErrorMessage error={error} />
          <div className="login-buttons">
            <button className="forgot-password-button">Esqueceu a senha?</button>
            <button className="privacy-policy-button">Política de Privacidade</button>
          </div>
        </div> 
        
      </div>
    </div>
  );
};
//http://3.144.224.214/"
export default LoginPage; // Exportar o componente LoginPage como um export default
