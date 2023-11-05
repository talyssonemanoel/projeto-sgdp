import React, { useState } from 'react';
import api from "../services/api";
import "../css/Prontuario.css";
import BuscarPaciente from '../components/BuscarPaciente';
import ProntuarioLinhaDoTempo from '../components/ProntuarioLinhaDoTempo'; // Importe o novo componente
import moment from 'moment';

const Prontuario = () => {
  const [selectedPaciente, setSelectedPaciente] = useState(null);
  const [pacienteInputValue, setPacienteInputValue] = useState();
  const [atendimentos, setAtendimentos] = useState([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [activeButton, setActiveButton] = useState(null);

  const loadPacienteOptions = async (inputValue) => {
    try {
      const response = await api.get('/patients/livesearch', { params: { q: inputValue } });
      const data = response.data.map(item => ({
        value: item._id,
        label: item.Nome,
        birthday: item.DataDeNascimento,
        cartaoSus: item.cartaoSus,
        rg: item.rg,
        cpf: item.cpf,
        etnia: item.etnia,
        escolaridade: item.escolaridade,
        estadoCivil: item.estadoCivil,
        ocupacao: item.ocupacao,
        nomeDaMae: item.nomeDaMae,
        logradouro: item.logradouro,
        numeroEndereco: item.numeroEndereco,
        complementoEndereco: item.complementoEndereco,
        cidade: item.cidade,
        estado: item.estado,
        email: item.email,
        telefone: item.telefone,
        whatsapp: item.whatsapp,
        contatoEmergencia: item.contatoEmergencia,
        orientacaoSexual: item.orientacaoSexual,
        identidadeDeGenero: item.identidadeDeGenero,
        ubsCadastrada: item.ubsCadastrada,
        acompanhamentoDeSaude: item.acompanhamentoDeSaude,
        observacoes: item.observacoes
      }));
      return data;
    } catch (error) {
      console.error('Erro ao buscar dados de pacientes:', error);
      return [];
    }
  };

  // Crie uma função para carregar os atendimentos
  const loadAtendimentos = async (pacienteId, ambulatorio) => {
    try {
      const response = await api.get('/agendar/GetServicesByPatientKey', { params: { q: pacienteId, ambulatorio: ambulatorio } });
      setAtendimentos(response.data);
    } catch (error) {
      console.error('Erro ao buscar dados de atendimentos:', error);
    }
  };

  const handlePacienteInputChange = (newValue) => {
    setPacienteInputValue(newValue);
  };

  const handlePacienteChange = (selectedOption) => {
    setSelectedPaciente(selectedOption);
    loadAtendimentos(selectedOption.value, activeButton);
    console.log("proximo output é o paciente e o botao")
    console.log(selectedOption.value, activeButton)
  };

  const handlePacienteClear = () => {
    setSelectedPaciente(null);
    setPacienteInputValue('');
  };

  // Obtenha uma lista de todas as types únicas
  const types = [...new Set(atendimentos.map(atendimento => atendimento.type))];

  // Filtre os atendimentos pela type selecionada
  const filteredAtendimentos = atendimentos.filter(atendimento => atendimento.type === selectedSpecialty);

  return (
    <div>
      {selectedPaciente ? (
        (() => {
          const birthday = moment(selectedPaciente.birthday);
          const age = moment().diff(birthday, 'years');
  
          return (
            <div className='body-prontuario d-flex'>
              <div className=''>
                <div className="menu-left">
                  <div className="titulo-menu-left">
                    Evolução profissional
                  </div>
                  <div>
                  {types.map(type => (
                    <button 
                    className={`w-100 btn-menu-l ${selectedSpecialty === type ? 'selected' : ''}`}  
                    key={type} 
                    onClick={() => {
                      if (selectedSpecialty === type) {
                        setSelectedSpecialty(''); // Desmarque o botão se já estiver selecionado
                        setCurrentPage(0);
                      } else {
                        setSelectedSpecialty(type); // Selecione o botão se não estiver selecionado
                        setCurrentPage(0);
                      }
                    }}
                  >
                    {type}
                  </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className='w-100'>
                <div className='p-content h-100'>
                  {selectedSpecialty ? (
                    <div>
                      <div className= "cabecalho-prontuario">
                        <h5>{selectedPaciente.label}</h5>
                        <h6>{age} anos</h6>
                      </div>
                      <div>
                        <ProntuarioLinhaDoTempo atendimentos={filteredAtendimentos} currentPage={currentPage} setCurrentPage={setCurrentPage}/>
                      </div>
                    </div>
                  ) : (
                    <div className= "dados-gerais-do-paciente h-100">
                    <div className='w-100 text-center'>
                      <div>
                        <h3>FICHA INDIVIDUAL</h3>
                      </div>
                      <div className='divisor-subtitle'>
                        <h5>IDENTIFICAÇÃO</h5>
                      </div>
                    </div>
                    <h6>Nome completo: {selectedPaciente.label}</h6>
                    <div className='d-flex'>
                      <div className='col-6'>
                        <h6>Data de nascimento: {moment(selectedPaciente.birthday).format('DD/MM/YYYY')}</h6>
                      </div>
                      <div className='col-6'>
                        <h6>Cartão do SUS: {selectedPaciente.cartaoSus}</h6>
                      </div>
                    </div>
                    <div className='d-flex'>
                      <div className='col-6'>
                        <h6>RG: {selectedPaciente.rg}</h6>
                      </div>
                      <div className='col-6'>
                        <h6>CPF: {selectedPaciente.cpf}</h6>
                      </div>
                    </div>
                    <div className='d-flex'>
                      <div className='col-6'>
                        <h6>Etnia: {selectedPaciente.etnia}</h6>
                      </div>
                      <div className='col-6'>
                        <h6>Escolaridade: {selectedPaciente.escolaridade}</h6>
                      </div>
                    </div>
                    <div className='d-flex'>
                      <div className='col-6'>
                        <h6>Estado civil: {selectedPaciente.estadoCivil}</h6>
                      </div>
                      <div className='col-6'>
                        <h6>Ocupação: {selectedPaciente.ocupacao}</h6>
                      </div>
                    </div>
                    <h6>Nome da mãe: {selectedPaciente.nomeDaMae}</h6>
                    <div className='w-100 text-center'>
                      <div className='divisor-subtitle'>
                        <h5>ENDEREÇO</h5>
                      </div>
                    </div>
                    <h6>Logradouro: {selectedPaciente.logradouro}</h6>
                    <div className='d-flex'>
                      <div className='col-6'>
                        <h6>Número: {selectedPaciente.numeroEndereco}</h6>
                      </div>
                      <div className='col-6'>
                        <h6>Bairro: {selectedPaciente.bairro}</h6>
                      </div>
                    </div>
                    <h6>Complemento: {selectedPaciente.complementoEndereco}</h6>
                    <div className='d-flex'>
                      <div className='col-6'>
                        <h6>Cidade: {selectedPaciente.cidade}</h6>
                      </div>
                      <div className='col-6'>
                        <h6>Estado: {selectedPaciente.estado}</h6>
                      </div>
                    </div>
                    <div className='w-100 text-center'>
                      <div className='divisor-subtitle'>
                        <h5>CONTATO</h5>
                      </div>
                    </div>
                    <h6>Email: {selectedPaciente.email}</h6>
                    <div className='d-flex'>
                      <div className='col-6'>
                        <h6>Telefone: {selectedPaciente.telefone}</h6>
                      </div>
                      <div className='col-6'>
                        <h6>Whatsapp: {selectedPaciente.whatsapp}</h6>
                      </div>
                    </div>
                    <h6>Em caso de emergência: {selectedPaciente.contatoEmergencia}</h6>
                  </div>
                  
                  )}
                </div>
              </div>
            </div>
          );
        })()
      ) : (
        <BuscarPaciente
          selectedPaciente={selectedPaciente}
          pacienteInputValue={pacienteInputValue}
          activeButton={activeButton}
          setActiveButton={setActiveButton}
          loadPacienteOptions={loadPacienteOptions}
          handlePacienteInputChange={handlePacienteInputChange}
          handlePacienteChange={handlePacienteChange}
          handlePacienteClear={handlePacienteClear}
        />
      )}
    </div>
  );
      };
  export default Prontuario;
  
