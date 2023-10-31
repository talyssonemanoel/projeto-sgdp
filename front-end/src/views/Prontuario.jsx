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
  const loadAtendimentos = async (pacienteId) => {
    try {
      const response = await api.get('/agendar/GetServicesByPatientKey', { params: { q: pacienteId } });
      setAtendimentos(response.data);
      console.log("response data e")
      console.log(response.data)
    } catch (error) {
      console.log("deu erro")
      console.error('Erro ao buscar dados de atendimentos:', error);
    }
  };

  const handlePacienteInputChange = (newValue) => {
    setPacienteInputValue(newValue);
  };

  const handlePacienteChange = (selectedOption) => {
    setSelectedPaciente(selectedOption);
    console.log(selectedOption)
    console.log(selectedOption.value)
    loadAtendimentos(selectedOption.value);
  };

  const handlePacienteClear = () => {
    setSelectedPaciente(null);
    setPacienteInputValue('');
  };

  // Obtenha uma lista de todas as specialtyNames únicas
  const specialtyNames = [...new Set(atendimentos.map(atendimento => atendimento.specialtyName))];

  // Filtre os atendimentos pela specialtyName selecionada
  const filteredAtendimentos = atendimentos.filter(atendimento => atendimento.specialtyName === selectedSpecialty);

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
                  {specialtyNames.map(specialtyName => (
                    <button 
                    className={`w-100 btn-menu-l ${selectedSpecialty === specialtyName ? 'selected' : ''}`}  
                    key={specialtyName} 
                    onClick={() => {
                      setSelectedSpecialty(specialtyName);
                      setCurrentPage(0); // Adicione esta linha
                    }}
                  >
                    {specialtyName}
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
