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

  const loadPacienteOptions = async (inputValue, ambulatorio) => {
    console.log("entramos na função e o ambulatorio é o seguinte:")
    try {
      console.log("entramos na função e o ambulatorio é o seguinte:", ambulatorio)
      const response = await api.get('/patients/livesearch-prontuario', { params: { q: inputValue, ambulatorio: ambulatorio } });
      const data = response.data.map(item => ({
        value: item._key,
        label: item.nome,
        birthday: item.dataDeNascimento,
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
  };

  const handlePacienteClear = () => {
    setSelectedPaciente(null);
    setPacienteInputValue('');
  };

  // Obtenha uma lista de todas as especialidades únicas
  const especialidades = [...new Set(atendimentos.filter(atendimento => atendimento.status === "finalizado").map(atendimento => atendimento.especialidade))];

  // Filtre os atendimentos pela especialidade selecionada
  const filteredAtendimentos = atendimentos.filter(atendimento => atendimento.especialidade === selectedSpecialty && atendimento.status === "finalizado");

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
                    {especialidades.map(especialidade => (
                      <button
                        className={`w-100 btn-menu-l ${selectedSpecialty === especialidade ? 'selected' : ''}`}
                        key={especialidade}
                        onClick={() => {
                          if (selectedSpecialty === especialidade) {
                            setSelectedSpecialty(''); // Desmarque o botão se já estiver selecionado
                            setCurrentPage(0);
                          } else {
                            setSelectedSpecialty(especialidade); // Selecione o botão se não estiver selecionado
                            setCurrentPage(0);
                          }
                        }}
                      >
                        {especialidade}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className='w-100'>
                <div className='p-content h-100'>
                  {selectedSpecialty ? (
                    <div>
                      <div className="cabecalho-prontuario">
                        <div className='d-flex justify-content-between'>
                          <div>
                            <h6>{selectedPaciente.label}</h6>
                          </div>
                          <div>
                            <button type="button" class="btn-close d-flex align-items-start p-0" data-bs-dismiss="modal" aria-label="Close"></button>
                          </div>
                        </div>
                        <h7>{age} anos</h7>
                      </div>
                      <div className='d-flex justify-content-end'>
                        <i class="bi bi-envelope-fill" style={{ fontSize: '1.3em', color: '#0d6efd', marginRight: '0.5em' }}></i>
                        <i class="bi bi-printer-fill" style={{ fontSize: '1.3em', color: '#0d6efd', marginRight: '0.2em'}}></i>
                      </div>

                      <div>
                        <ProntuarioLinhaDoTempo atendimentos={filteredAtendimentos} currentPage={currentPage} setCurrentPage={setCurrentPage} />
                      </div>
                    </div>
                  ) : (
                    <div className="dados-gerais-do-paciente h-100">
                      <div class='w-100 text-center'>
                        <div class='d-flex justify-content-between'>
                          <h4 class='mx-auto'>FICHA INDIVIDUAL</h4>
                          <div className=''>
                            <button type="button" class="btn-close d-flex align-items-start p-0" data-bs-dismiss="modal" aria-label="Close"></button>
                          </div>
                        </div>
                        <div class='divisor-subtitle'>
                          <h6>IDENTIFICAÇÃO</h6>
                        </div>
                      </div>
                      <h7>Nome completo: {selectedPaciente.label}</h7>
                      <div className='d-flex'>
                        <div className='col-6'>
                          <h7>Data de nascimento: {moment(selectedPaciente.birthday).format('DD/MM/YYYY')}</h7>
                        </div>
                        <div className='col-6'>
                          <h7>Cartão do SUS: {selectedPaciente.cartaoSus}</h7>
                        </div>
                      </div>
                      <div className='d-flex'>
                        <div className='col-6'>
                          <h7>RG: {selectedPaciente.rg}</h7>
                        </div>
                        <div className='col-6'>
                          <h7>CPF: {selectedPaciente.cpf}</h7>
                        </div>
                      </div>
                      <div className='d-flex'>
                        <div className='col-6'>
                          <h7>Orientação sexual: {selectedPaciente.orientacaoSexual}</h7>
                        </div>
                        <div className='col-6'>
                          <h7>Identidade de gênero: {selectedPaciente.identidadeDeGenero}</h7>
                        </div>
                      </div>
                      <div className='d-flex'>
                        <div className='col-6'>
                          <h7>Etnia: {selectedPaciente.etnia}</h7>
                        </div>
                        <div className='col-6'>
                          <h7>Escolaridade: {selectedPaciente.escolaridade}</h7>
                        </div>
                      </div>
                      <div className='d-flex'>
                        <div className='col-6'>
                          <h7>Estado civil: {selectedPaciente.estadoCivil}</h7>
                        </div>
                        <div className='col-6'>
                          <h7>Ocupação: {selectedPaciente.ocupacao}</h7>
                        </div>
                      </div>
                      <h7>UBS REF: {selectedPaciente.ubsCadastrada}</h7>
                      <h7>Nome da mãe: {selectedPaciente.nomeDaMae}</h7>
                      <div className='w-100 text-center'>
                        <div className='divisor-subtitle'>
                          <h6>ENDEREÇO</h6>
                        </div>
                      </div>
                      <h7>Logradouro: {selectedPaciente.logradouro}</h7>
                      <div className='d-flex'>
                        <div className='col-6'>
                          <h7>Número: {selectedPaciente.numeroEndereco}</h7>
                        </div>
                        <div className='col-6'>
                          <h7>Bairro: {selectedPaciente.bairro}</h7>
                        </div>
                      </div>
                      <h7>Complemento: {selectedPaciente.complementoEndereco}</h7>
                      <div className='d-flex'>
                        <div className='col-6'>
                          <h7>Cidade: {selectedPaciente.cidade}</h7>
                        </div>
                        <div className='col-6'>
                          <h7>Estado: {selectedPaciente.estado}</h7>
                        </div>
                      </div>
                      <div className='w-100 text-center'>
                        <div className='divisor-subtitle'>
                          <h6>CONTATO</h6>
                        </div>
                      </div>
                      <h7>Email: {selectedPaciente.email}</h7>
                      <div className='d-flex'>
                        <div className='col-6'>
                          <h7>Telefone: {selectedPaciente.telefone}</h7>
                        </div>
                        <div className='col-6'>
                          <h7>Whatsapp: {selectedPaciente.whatsapp}</h7>
                        </div>
                      </div>
                      <h7>Em caso de emergência: {selectedPaciente.contatoEmergencia}</h7>
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

