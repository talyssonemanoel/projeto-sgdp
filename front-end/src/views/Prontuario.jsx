import React, { useState } from 'react';
import api from "../services/api";
import "../css/Prontuario.css";
import BuscarPaciente from '../components/BuscarPaciente';
import ProntuarioLinhaDoTempo from '../components/ProntuarioLinhaDoTempo'; // Importe o novo componente

const Prontuario = () => {
  const [selectedPaciente, setSelectedPaciente] = useState(null);
  const [pacienteInputValue, setPacienteInputValue] = useState();

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

  const handlePacienteInputChange = (newValue) => {
    setPacienteInputValue(newValue);
  };

  const handlePacienteChange = (selectedOption) => {
    setSelectedPaciente(selectedOption);
  };

  const handlePacienteClear = () => {
    setSelectedPaciente(null);
    setPacienteInputValue('');
  };

  // Dados de exemplo para a linha do tempo do paciente
  const atendimentos = [
    { data: '2023-10-15', descricao: 'Atendimento 1' },
    { data: '2023-10-16', descricao: 'Atendimento 2' },
    { data: '2023-10-17', descricao: 'Atendimento 3' },
    { data: '2023-10-18', descricao: 'Atendimento 4' },
    // Adicione mais atendimentos aqui
  ];

  return (
    <div>
      {selectedPaciente ? (
        <div className='body-prontuario'>
          <div className= "cabecalho-prontuario">
            <h4>{selectedPaciente.label}</h4>
            <h6>{selectedPaciente.birthday}</h6>
          </div>
          <div>
            <ProntuarioLinhaDoTempo atendimentos={atendimentos} />
          </div>
        </div>
      
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