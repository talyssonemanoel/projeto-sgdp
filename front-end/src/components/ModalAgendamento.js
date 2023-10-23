import React, { useState } from 'react';
import AsyncSelect from 'react-select/async';
import api from "../services/api";
import * as bootstrap from 'bootstrap';
import '../css/ModalAgendamento.css';

const ModalAgendamento = ({ onSave }) => {
  const [activeButton, setActiveButton] = useState(null);
  const [selectedEspecialista, setSelectedEspecialista] = useState(null);
  const [selectedPaciente, setSelectedPaciente] = useState(null);
  const [especialistaInputValue, setEspecialistaInputValue] = useState('');
  const [pacienteInputValue, setPacienteInputValue] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const Noop = () => null;

  const handleButtonClick = (button) => {
    if (activeButton === button) {
      setActiveButton(null);
    } else {
      setActiveButton(button);
    }
  };

  const loadEspecialistaOptions = async (inputValue) => {
    try {
      const response = await api.get('/doctors/livesearch', { params: { q: inputValue } }); 
      const data = response.data.map(item => ({
        value: item._id,
        label: item.Nome
      }));
      return data;
    } catch (error) {
      console.error('Erro ao buscar dados de especialistas:', error);
      return [];
    }
  };

  const loadPacienteOptions = async (inputValue) => {
    try {
      const response = await api.get('/patients/livesearch', { params: { q: inputValue } }); 
      const data = response.data.map(item => ({
        value: item._id,
        label: item.Nome
      }));
      return data;
    } catch (error) {
      console.error('Erro ao buscar dados de pacientes:', error);
      return [];
    }
  };

  const handleEspecialistaInputChange = (newValue) => {
    setEspecialistaInputValue(newValue);
  };

  const handlePacienteInputChange = (newValue) => {
    setPacienteInputValue(newValue);
  };

  const handleEspecialistaChange = (selectedOption) => {
    setSelectedEspecialista(selectedOption);
  };

  const handlePacienteChange = (selectedOption) => {
    setSelectedPaciente(selectedOption);
  };

  const handleEspecialistaClear = () => {
    setSelectedEspecialista(null);
    setEspecialistaInputValue('');
  };

  const handlePacienteClear = () => {
    setSelectedPaciente(null);
    setPacienteInputValue('');
  };

  const handleDateChange = (event) => {
    setSelectedDate(event.target.value);
    console.log(event.target.value)
  };

  const handleSubmit = async () => {
    if (selectedEspecialista && selectedPaciente && selectedDate && activeButton) {
      const data = {
        ambulatorio: activeButton === 'left' ? 'Geral' : 'LGBT',
        doctorKey: selectedEspecialista.value.split('/')[1], // Remove o 'Person/' do doctorKey
        patientKey: selectedPaciente.value.split('/')[1], // Remove o 'Person/' do patientKey
        date: selectedDate
      };
      try {
        const response = await api.post('/agendar/add', data);
        console.log('Dados enviados com sucesso:', response.data);
        onSave();
        var myModalEl = document.getElementById('exampleModal')
        var modal = bootstrap.Modal.getInstance(myModalEl)
        modal.hide()
        // Remova a classe 'modal-open' do body
        document.body.classList.remove('modal-open');
        // Remova o elemento do backdrop
        var backdrop = document.querySelector('.modal-backdrop');
        if (backdrop) {
          backdrop.parentNode.removeChild(backdrop);
        }

        // Limpe os campos do formulário e desmarque os botões
        setActiveButton(null);
        setSelectedEspecialista(null);
        setSelectedPaciente(null);
        setEspecialistaInputValue('');
        setPacienteInputValue('');
        setSelectedDate('');
    
        // Aqui você pode fazer alguma ação após o envio dos dados, como fechar o modal ou mostrar uma mensagem de confirmação
      } catch (error) {
        console.error('Erro ao enviar os dados:', error);
        // Aqui você pode mostrar uma mensagem de erro para o usuário
      }
    } else {
      alert('Por favor, preencha todos os campos e selecione um tipo de agendamento.');
    }
  };
  

  return (
    <div className="modal fade" id="exampleModal" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h1 className="modal-title fs-5" id="exampleModalLabel">Novo Agendamento</h1>
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div className="modal-body">
            <div className="btn-group d-flex botoes-topo" role="group">
              <button
                type="button"
                className={`btn ${activeButton === 'left' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => handleButtonClick('left')}
                style={{ flex: 1 }}
              >
                Ambulatório Geral
              </button>
              <button
                type="button"
                className={`btn ${activeButton === 'right' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => handleButtonClick('right')}
                style={{ flex: 1 }}
              >
                Ambulatório LGBT
              </button>
            </div>
            <form>
              <div className='PEspaçamento'>
              <label htmlFor="dateInput" className="form-label">Especialista</label>
              <div className={`input-container ${selectedEspecialista ? 'flex-container' : ''}`}>
                <div>
                  <AsyncSelect
                    placeholder="Especialista"
                    cacheOptions
                    loadOptions={loadEspecialistaOptions}
                    onInputChange={handleEspecialistaInputChange}
                    onChange={handleEspecialistaChange}
                    value={selectedEspecialista}
                    isDisabled={selectedEspecialista !== null}
                    components={{ DropdownIndicator: Noop, indicatorSeparator: Noop }}
                  />
                </div>
                <div>
                  {selectedEspecialista && (
                    <button onClick={handleEspecialistaClear} className="clear-button">
                      <i className="bi bi-x-lg"></i>
                    </button>
                  )}
                </div>
              </div>
              </div>
              <div className="mb-3">
                <label htmlFor="dateInput" className="form-label">Data</label>
                <input type="date" className="form-control" id="dateInput" value={selectedDate} onChange={handleDateChange} />
              </div>
              <label htmlFor="dateInput" className="form-label">Paciente</label>
              <div className={`input-container ${selectedPaciente ? 'flex-container' : ''}`}>
                <div>
                  <AsyncSelect
                    placeholder="Paciente"
                    cacheOptions
                    loadOptions={loadPacienteOptions}
                    onInputChange={handlePacienteInputChange}
                    onChange={handlePacienteChange}
                    value={selectedPaciente}
                    isDisabled={selectedPaciente !== null}
                    components={{ DropdownIndicator: Noop, indicatorSeparator: Noop }}
                  />
                </div>
                <div>
                {selectedPaciente && (
                <button onClick={handlePacienteClear} className="clear-button">
                  <i className="bi bi-x-lg"></i>
                </button>
                  )}
                </div>
              </div>
            </form>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
            <button type="button" className="btn btn-primary" onClick={handleSubmit}>Salvar</button>

          </div>
          <style>
            {`
            .css-1u9des2-indicatorSeparator {
              display: none;
            }

            .css-13cymwt-control {
              width: 100%;
            }

            .css-qbdosj-Input {
              width: 100%;
            }

            .css-16xfy0z-control {
              border-top-right-radius: 0;
              border-bottom-right-radius: 0;
              border-right: none;
            }
            .css-3iigni-container {
              display: flex;
            }
            .form-label {
              margin: 0px;
            }
            `}
          </style>
        </div>
      </div>
    </div>
  );
};

export default ModalAgendamento;