# Projeto de Sistema de Gestão de Pacientes

Este projeto consiste em dois servidores: um em React que implementa a interface gráfica do usuário, e outro em Express que implementa a lógica de negócio e o acesso ao banco de dados.

## Documentação https://docs.google.com/document/d/19IEhn_WZ9RWaERBJOiF-goTzkxk51Lb86n147OTndlQ/edit

## 🚀 Funcionalidades

O sistema permite:

- Cadastrar, editar, excluir e pesquisar pacientes
- Cadastrar, editar, excluir e pesquisar médicos
- Realizar login e logout com autenticação por token
- Verificar a validade do token a cada requisição
- Renderizar páginas dinâmicas com EJS
- Mais funções em breve!

## 💻 Tecnologias

As principais tecnologias utilizadas neste projeto são:

- [React]: uma biblioteca JavaScript para criar interfaces de usuário
- [Express]: um framework web para Node.js que facilita a criação de aplicações web e APIs
- [ArangoDB]: um banco de dados não relacional orientado a grafos
- [EJS]: uma linguagem de template que permite gerar HTML com JavaScript
- [Axios]: uma biblioteca JavaScript que permite fazer requisições HTTP de forma simples e eficiente
- [React Router]: uma coleção de componentes React que permite criar rotas dinâmicas na aplicação
- [JSON Web Token]: um padrão aberto que define uma forma compacta e segura de transmitir informações entre partes como um objeto JSON

## 🔧 Requisitos

Para executar este projeto, você precisa ter instalado:

- [Node.js]: um ambiente de execução JavaScript que permite rodar código JavaScript fora do navegador
- [NPM]: um gerenciador de pacotes para Node.js que permite instalar e gerenciar as dependências do projeto
- [ArangoDB]: um banco de dados não relacional orientado a grafos
- [React]: um framework eficiente para manipulação de FrontEnd

## 📦 Instalação

Para instalar este projeto, siga os passos abaixo:

1. Clone este repositório para a sua máquina local usando o comando:

```bash
git clone https://github.com/talyssonemanoel/projetoA.git
```
Navegue até a pasta do projeto usando o comando:
```bash
cd react
```

Instale as dependências do servidor React usando o comando:
```bash
npm install
```

Instale as dependências do servidor Express usando o comando:
```bash
npm install --prefix server
```

Inicie o servidor React usando o comando:
```bash
npm start
```

Inicie o servidor Express usando o comando:
```bash
npm start --prefix server
```

Acesse a aplicação no seu navegador pelo endereço:
```bash
http://localhost:3000
```

## 🖥️ Uso
Para usar este projeto, você precisa fazer login com um usuário e senha válidos. Você pode criar um novo usuário na página de cadastro do tutor ou usar um dos usuários pré-cadastrados no banco de dados.

Após fazer login, você pode navegar pelas páginas do sistema usando o menu lateral. Você pode cadastrar, editar, excluir e pesquisar pacientes e médicos nas respectivas páginas. Você também pode fazer logout a qualquer momento clicando no botão “Sair” no canto superior direito.

## 🙋‍♂️ Contribuições
Este projeto é atrelado à T&L Projects e não está aberto para contribuições externas. No entanto, se você tiver alguma sugestão, crítica ou elogio, sinta-se à vontade para entrar em contato comigo pelo meu e-mail: lucaspraxlt@gmail.com ou talyssonemanoel@alu.uern.br

## ⚠️ Licença de uso
É estritamente proibida a alteração, copia, engenharia reversa ou utilização dos métodos de forma sistematizada do que foi usado nesse projeto. O uso nos âmbitos da Universidade do Estado do Rio Grande do Norte - UERN, está permitida de forma livre, desde que respeite os princípios anteriormente citados e sirva apenas para fins não lucrativos.
A T&L Projects pode, por boa vontade, permitir alguma alteração ou uso alternativo, desde que autorizado previamente pelo grupo T&L.
Ressaltamos que o software de Gestão de Pacientes é, para a UERN, sem fins lucrativos e visa a obtenção de conhecimento e colaboração às atividades dos docentes, discentes e associados à UERN.
