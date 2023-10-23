import React, { useState } from 'react';
import api from '../services/api';
import { Container, Row, Col, Form, Button, Table, Modal } from 'react-bootstrap';
import '../css/PacientePesquisa.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit } from '@fortawesome/free-solid-svg-icons';



const PatientSearch = () => {
  const [query, setQuery] = useState(''); // Estado para armazenar o valor da busca
  const [searchBy, setSearchBy] = useState('all'); // Estado para armazenar o tipo de busca
  const [patients, setPatients] = useState([]); // Estado para armazenar os pacientes encontrados
  const [isEditing, setIsEditing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [patientToEdit, setPatientToEdit] = useState(null);


  // Estados para os campos do formulário do paciente
  const [Nome, setNome] = useState('');
  const [CPF, setCPF] = useState('');
  const [DataDeNascimento, setDataDeNascimento] = useState('');
  const [Ocupacao, setOcupacao] = useState('');
  const [IdentidadeDeGenero, setIdentidadeDeGenero] = useState('');
  const [OrientacaoSexual, setOrientacaoSexual] = useState('');
  const [CarteiraNacionalDeSaude, setCarteiraNacionalDeSaude] = useState('');
  const [UBScadastrada, setUBScadastrada] = useState('');
  const [Endereco, setEndereco] = useState('');
  const [Bairro, setBairro] = useState('');
  const [Telefone, setTelefone] = useState('');

  const handleShowModal = (editing, patientToEdit) => {
    setIsEditing(editing);
    setShowModal(true);

    if (editing) {
      // Preencha os estados dos campos do formulário com os detalhes do paciente a ser editado
      setPatientToEdit(patientToEdit);
      setNome(patientToEdit.Nome);
      setCPF(patientToEdit.CPF);
      setDataDeNascimento(patientToEdit.DataDeNascimento);
      setOcupacao(patientToEdit.Ocupacao);
      setIdentidadeDeGenero(patientToEdit.IdentidadeDeGenero);
      setOrientacaoSexual(patientToEdit.OrientacaoSexual);
      setCarteiraNacionalDeSaude(patientToEdit.CarteiraNacionalDeSaude);
      setUBScadastrada(patientToEdit.UBScadastrada);
      setEndereco(patientToEdit.Endereco);
      setBairro(patientToEdit.Bairro);
      setTelefone(patientToEdit.Telefone);
      // Adicione outros campos que deseja editar aqui
    } else {
      // Se não estiver editando, redefina os estados para vazios ou valores iniciais
      setNome('');
      setCPF('');
      setDataDeNascimento('');
      setOcupacao('');
      setIdentidadeDeGenero('');
      setOrientacaoSexual('');
      setCarteiraNacionalDeSaude('');
      setUBScadastrada('');
      setEndereco('');
      setBairro('');
      setTelefone('');
      // Adicione outros campos que deseja adicionar aqui
    }
  };



  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleSavePatient = async () => {
    try {
      // Crie um objeto com os dados do paciente
      const patientData = {
        Nome,
        CPF,
        DataDeNascimento,
        Ocupacao,
        IdentidadeDeGenero,
        OrientacaoSexual,
        CarteiraNacionalDeSaude,
        UBScadastrada,
        Endereco,
        Bairro,
        Telefone,
      };

      // Envie os dados do paciente para a API
      const token = localStorage.getItem('token');
      await api.post(`patients/add?token=${token}`, patientData);

      // Feche o modal
      handleCloseModal();

      // Atualize a lista de pacientes
      fetchPatients();
    } catch (error) {
      console.error(error);
      alert('Erro ao adicionar paciente');
    }
  };

  const fetchPatients = async () => {
    try {
      let response;
      const token = localStorage.getItem('token');
      if (searchBy === 'all') {
        // Buscar todos os pacientes
        response = await api.get(`patients/search?token=${token}`);
      } else {
        // Buscar por atributo
        response = await api.get(`patients/search/${query}?token=${token}`);
      }
      setPatients(response.data);
    } catch (error) {
      console.error(error);
      alert('Erro ao buscar pacientes');
    }
  };

  const handleChangeQuery = (e) => {
    setQuery(e.target.value);
  };

  const handleChangeSearchBy = (e) => {
    setSearchBy(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchPatients();
  };

  const handleUpdatePatient = async (patient) => {
    try {
      // Crie um objeto com os dados atualizados do paciente, incluindo o _key
      const updatedPatientData = {
        Nome,
        CPF,
        DataDeNascimento,
        Ocupacao,
        IdentidadeDeGenero,
        OrientacaoSexual,
        CarteiraNacionalDeSaude,
        UBScadastrada,
        Endereco,
        Bairro,
        Telefone,
        // Adicione outros campos que deseja atualizar aqui
      };
      console.log(patient)
      // Envie os dados atualizados do paciente para o backend
      const token = localStorage.getItem('token');
      await api.put(`patients/update/${patient._key}?token=${token}`, updatedPatientData);

      handleCloseModal();

      // Atualize a lista de pacientes após a atualização
      fetchPatients();
    } catch (error) {
      console.error(error);
      alert('Erro ao atualizar paciente');
    }
  };


  const handleEditPatient = (patient) => {
    // Preencha os estados dos campos do formulário com os detalhes do paciente
    setNome(patient.Nome);
    setCPF(patient.CPF);
    setDataDeNascimento(patient.DataDeNascimento);
    setOcupacao(patient.Ocupacao);
    setIdentidadeDeGenero(patient.IdentidadeDeGenero);
    setOrientacaoSexual(patient.OrientacaoSexual);
    setCarteiraNacionalDeSaude(patient.CarteiraNacionalDeSaude);
    setUBScadastrada(patient.UBScadastrada);
    setEndereco(patient.Endereco);
    setBairro(patient.Bairro);
    setTelefone(patient.Telefone);
    // Abra o modal de edição
    setShowModal(true);
  };


  return (
    <Container className="body-paciente-pesquisa" style={{ padding: '12px', margin: 0, width: '1200px', height: 'auto' }}>
      <Row>
        <Col>
          <h1>Pesquisar Pacientes</h1>
          <Button variant="primary" onClick={() => handleShowModal(false)}>
            Adicionar Paciente
          </Button>
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="query">
              <Form.Label>Valor da busca</Form.Label>
              <Form.Control
                type="text"
                placeholder="Digite o valor da busca"
                value={query}
                onChange={handleChangeQuery}
              />
            </Form.Group>
            <Form.Group controlId="searchBy">
              <Form.Label>Tipo de busca</Form.Label>
              <Form.Control as="select" value={searchBy} onChange={handleChangeSearchBy}>
                <option value="all">Todos os pacientes</option>
                <option value="Nome">Nome</option>
              </Form.Control>
            </Form.Group>
            <Button variant="primary" type="submit">
              Pesquisar
            </Button>
          </Form>
        </Col>
      </Row>
      {/* Modal para adicionar paciente */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>{isEditing ? 'Editar Paciente' : 'Adicionar Paciente'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* Formulário para adicionar paciente */}
          <Form>
            <Form.Group controlId="name">
              <Form.Label>Nome</Form.Label>
              <Form.Control
                type="text"
                value={Nome}
                onChange={(e) => setNome(e.target.value)}
              />
            </Form.Group>
            <Form.Group controlId="dateOfBirth">
              <Form.Label>Data de Nascimento</Form.Label>
              <Form.Control
                type="date"
                value={DataDeNascimento}
                onChange={(e) => setDataDeNascimento(e.target.value)}
              />
            </Form.Group>
            <Form.Group controlId="sex">
              <Form.Label>Ocupação</Form.Label>
              <Form.Control
                type="text"
                value={Ocupacao}
                onChange={(e) => setOcupacao(e.target.value)}
              />
            </Form.Group>
            <Form.Group controlId="genderIdentity">
              <Form.Label>Identidade de Gênero</Form.Label>
              <Form.Control as="select" value={IdentidadeDeGenero} onChange={(e) => setIdentidadeDeGenero(e.target.value)}>
                <option value="">Prefiro não responder</option>
                <option value="Masculino">Masculino</option>
                <option value="Feminino">Feminino</option>
                <option value="Não binário">Não binário</option>
                <option value="Outros">Outros</option>
              </Form.Control>
            </Form.Group>
            <Form.Group controlId="sexualOrientation">
              <Form.Label>Orientação Sexual</Form.Label>
              <Form.Control as="select" value={OrientacaoSexual} onChange={(e) => setOrientacaoSexual(e.target.value)}>
                <option value="">Prefiro não responder</option>
                <option value="Heterossexual">Heterossexual</option>
                <option value="Homossexual">Homossexual</option>
                <option value="Bissexual">Bissexual</option>
                <option value="Outros">Outros</option>
              </Form.Control>
            </Form.Group>
            <Form.Group controlId="sex">
              <Form.Label>Carteira Nacional de Saúde</Form.Label>
              <Form.Control
                type="text"
                value={CarteiraNacionalDeSaude}
                onChange={(e) => setCarteiraNacionalDeSaude(e.target.value)}
              />
            </Form.Group>
            <Form.Group controlId="ubs">
              <Form.Label>UBS cadastrada</Form.Label>
              <Form.Select
                value={UBScadastrada}
                onChange={(e) => setUBScadastrada(e.target.value)}
              >
                <option value="">Selecione uma UBS</option>
                <option value="UBS Alcides Martins Veras">UBS Alcides Martins Veras</option>
                <option value="UBS Antonio Camilo">UBS Antonio Camilo</option>
                <option value="UBS Bernadete Bezerra De Souza Ramos">UBS Bernadete Bezerra De Souza Ramos</option>
                <option value="UBS Da Penit Agricola Mario Negocio">UBS Da Penit Agricola Mario Negocio</option>
                <option value="UBS Dr Aguinaldo Pereira">UBS Dr Aguinaldo Pereira</option>
                <option value="UBS Dr Antonio Soares Junior">UBS Dr Antonio Soares Junior</option>
                <option value="UBS Dr Chico Costa">UBS Dr Chico Costa</option>
                <option value="UBS Dr Chico Porto">UBS Dr Chico Porto</option>
                <option value="UBS Dr Cid Salem Duarte">UBS Dr Cid Salem Duarte</option>
                <option value="UBS Dr Epitacio Da Costa Carvalho">UBS Dr Epitacio Da Costa Carvalho</option>
                <option value="UBS Dr Helenio Gurgel">UBS Dr Helenio Gurgel</option>
                <option value="UBS Dr Ildone Cavalcante De Freitas">UBS Dr Ildone Cavalcante De Freitas</option>
                <option value="UBS Dr Joaquim Saldanha">UBS Dr Joaquim Saldanha</option>
                <option value="UBS Dr Jose Fernandes De Melo">UBS Dr Jose Fernandes De Melo</option>
                <option value="UBS Dr Jose Holanda Cavalcante">UBS Dr Jose Holanda Cavalcante</option>
                <option value="UBS Dr Jose Leao">UBS Dr Jose Leao</option>
                <option value="UBS Dr Lucas Benjamim">UBS Dr Lucas Benjamim</option>
                <option value="UBS Dr Luis Escolastico Bezerra">UBS Dr Luis Escolastico Bezerra</option>
                <option value="UBS Dr Marcos Raimundo Costa">UBS Dr Marcos Raimundo Costa</option>
                <option value="UBS Dr Moises Costa Lopes">UBS Dr Moises Costa Lopes</option>
                <option value="UBS Dr Paulo Jansem Dantas">UBS Dr Paulo Jansem Dantas</option>
                <option value="UBS Dr Sueldo Camara">UBS Dr Sueldo Camara</option>
                <option value="UBS Elias Honorato">UBS Elias Honorato</option>
                <option value="UBS Enfermeira Conchita Escossia Ciarline">UBS Enfermeira Conchita Escossia Ciarline</option>
                <option value="UBS Francisco Marques Da Silva">UBS Francisco Marques Da Silva</option>
                <option value="UBS Francisco Neto Da Luz">UBS Francisco Neto Da Luz</option>
                <option value="UBS Francisco Pereira Azevedo">UBS Francisco Pereira Azevedo</option>
                <option value="UBS Hipolito">UBS Hipolito</option>
                <option value="UBS Izabel Bezerra De Araujo">UBS Izabel Bezerra De Araujo</option>
                <option value="UBS Luiza Vanessa Da Silva Marinho">UBS Luiza Vanessa Da Silva Marinho</option>
                <option value="UBS Maria Neide Da Silva Souza">UBS Maria Neide Da Silva Souza</option>
                <option value="UBS Maria Soares Da Costa">UBS Maria Soares Da Costa</option>
                <option value="UBS Mario Lucio De Medeiros">UBS Mario Lucio De Medeiros</option>
                <option value="UBS Piquiri">UBS Piquiri</option>
                <option value="UBS Raimundo Rene Carlos Castro">UBS Raimundo Rene Carlos Castro</option>
                <option value="UBS Sinharinha Borges">UBS Sinharinha Borges</option>
                <option value="UBS Vereador Durval Costa">UBS Vereador Durval Costa</option>
                <option value="UBS Vereador Lahyre Rosado">UBS Vereador Lahyre Rosado</option>
                <option value="Outro">Outra UBS</option>
              </Form.Select>
            </Form.Group>
            <Form.Group controlId="sex">
              <Form.Label>Endereço</Form.Label>
              <Form.Control
                type="text"
                value={Endereco}
                onChange={(e) => setEndereco(e.target.value)}
              />
            </Form.Group>
            <Form.Group controlId="sex">
              <Form.Label>Bairro</Form.Label>
              <Form.Control
                type="text"
                value={Bairro}
                onChange={(e) => setBairro(e.target.value)}
              />
            </Form.Group>
            <Form.Group controlId="sex">
              <Form.Label>Telefone</Form.Label>
              <Form.Control
                type="text"
                value={Telefone}
                onChange={(e) => setTelefone(e.target.value)}
              />
            </Form.Group>
            {/* Adicione campos para outros detalhes do paciente aqui */}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Fechar
          </Button>
          <Button
            variant="primary"
            onClick={() => isEditing ? handleUpdatePatient(patientToEdit) : handleSavePatient()}
          >
            {isEditing ? 'Salvar' : 'Adicionar'}
          </Button>


        </Modal.Footer>
      </Modal>
      <Row>
        <Col>
          <h2>Resultados da busca</h2>
          {patients.length > 0 ? (
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Data de nascimento</th>
                  <th>Ocupação</th>
                  <th>Identidade de Gênero</th>
                  <th>Orientação Sexual</th>
                  <th>CNS</th>
                  <th>UBS REF</th>
                  <th>Endereço</th>
                  <th>Bairro</th>
                  <th>Telefone</th>
                  <th>Ações</th> {/* Nova coluna para ações (editar) */}
                </tr>
              </thead>
              <tbody>
                {patients.map((patient) => (
                  <tr key={patient._key}>
                    <td>{patient.Nome}</td>
                    <td>{patient.DataDeNascimento}</td>
                    <td>{patient.Ocupacao}</td>
                    <td>{patient.IdentidadeDeGenero}</td>
                    <td>{patient.OrientacaoSexual}</td>
                    <td>{patient.CarteiraNacionalDeSaude}</td>
                    <td>{patient.UBScadastrada}</td>
                    <td>{patient.Endereco}</td>
                    <td>{patient.Bairro}</td>
                    <td>{patient.Telefone}</td>
                    <td>
                      <FontAwesomeIcon
                        icon={faEdit}
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleShowModal(true, patient)} // Passe o paciente para a função
                      />
                    </td>

                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <p>Nenhum paciente encontrado.</p>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default PatientSearch;
