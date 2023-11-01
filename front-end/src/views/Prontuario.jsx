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
        birthday: item.DataDeNascimento
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
                  <div>
                    Folha de evolução
                  </div>
                  <div>
                  {types.map(type => (
                    <button 
                    className={`w-100 btn-menu-l ${selectedSpecialty === type ? 'selected' : ''}`}  
                    key={type} 
                    onClick={() => {
                      setSelectedSpecialty(type);
                      setCurrentPage(0); // Adicione esta linha
                    }}
                  >
                    {type}
                  </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className='w-100'>
                <div className='p-content'>
                  <div className= "cabecalho-prontuario">
                    <h4>{selectedPaciente.label}</h4>
                    <h6>{age} anos</h6>
                  </div>
                  <div>
                  <ProntuarioLinhaDoTempo atendimentos={filteredAtendimentos} currentPage={currentPage} setCurrentPage={setCurrentPage}/>
                  </div>
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
