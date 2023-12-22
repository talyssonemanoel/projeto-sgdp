import React, { useState, useEffect } from 'react';
import AsyncSelect from 'react-select/async';
import Select from 'react-select';
import api from "../services/api";
import * as bootstrap from 'bootstrap';
import '../css/ModalAgendamento.css';

const ModalAgendamento = ({
  events,
  setEvents,
  selectedDoctors,
  setSelectedDoctors,
  handleDoctorChange,
  selectedTime,
  setSelectedTime,
  timeOptions,
  handleTimeChange,
  selectedEspecialista,
  setSelectedEspecialista,
  especialidadeValue,
  setEspecialidadeValue,
  selectedEspecialidade,
  setSelectedEspecialidade
}) => {
  const [activeButton, setActiveButton] = useState(null);
  const [selectedPaciente, setSelectedPaciente] = useState(null);
  const [especialistaInputValue, setEspecialistaInputValue] = useState('');
  const [pacienteInputValue, setPacienteInputValue] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [especialidadeOptions, setEspecialidadeOptions] = useState([]);
  const [servicoOptions, setServicoOptions] = useState([]);
  const [selectedServico, setSelectedServico] = useState(null);
  const [servicoValue, setServicoValue] = useState(null);
  const [selectedHora, setSelectedHora] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectTimeKey, setSelectTimeKey] = useState(0);


  const Noop = () => null;

  const loadTipoDeEspecialistaOptions = () => {
    api.get('/especialidade/all')
      .then(response => {
        const newOptions = response.data.map(service => ({ value: service._id, label: service.nome, servicos: service.servicos }));
        setEspecialidadeOptions(newOptions);
      });
  };

  const loadServicoOptions = () => {
    if (selectedEspecialidade && selectedEspecialidade.servicos) {
      const newOptions = selectedEspecialidade.servicos.map((servico) => ({
        value: servico,
        label: servico,
      }));
      setServicoOptions(newOptions);
    } else {
      setServicoOptions([]);
    }
  };

  useEffect(() => {
    setSelectedServico(null);
  }, [selectedEspecialidade]);


  const handleButtonClick = (button) => {
    if (activeButton === button) {
      setActiveButton(null);
    } else {
      setActiveButton(button);
    }
  };

  const loadEspecialistaOptions = async (inputValue) => {
    
    try {
      const response = await api.get('/doctors/livesearchspecialty', {
        params: {
          q: inputValue,
          specialty: selectedEspecialidade.label // Adicione o parâmetro adicional
        }
      });
      const data = response.data.map(item => ({
        value: item._key,
        label: item.nome
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
        label: item.nome
      }));
      return data;
    } catch (error) {
      console.error('Erro ao buscar dados de pacientes:', error);
      return [];
    }
  };

  const cleanForms = async () => {
    setActiveButton(null);
    setSelectedEspecialista(null);
    setSelectedPaciente(null);
    setEspecialistaInputValue(null);
    setPacienteInputValue(null);
    setSelectedDate('');
    setSelectedEspecialidade(null);
    setSelectedServico(null);
    setSelectedTime(null);
    setSelectTimeKey(prevKey => prevKey + 1);
    setEspecialidadeValue(null);
    setServicoValue(null);
  }

  const handleEspecialidadeChange = (selectedOption) => {
    if (selectedOption.value === 'clear') {
      setEspecialidadeValue(null);
      setSelectedEspecialidade(null);
    } else {
      setEspecialidadeValue(selectedOption);
      setSelectedEspecialidade(selectedOption);
    }
  };


  const handleServicoChange = (selectedOption) => {
    if (selectedOption.value === 'clear') {
      setServicoValue(null);
      setSelectedServico(null);
    } else {
      setServicoValue(selectedOption);
      setSelectedServico(selectedOption);
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
    if (isSubmitting) {
      // Já está em processo de envio, evite ações adicionais
      return;
    } else {

      setIsSubmitting(true);

      if (selectedEspecialista && selectedPaciente && selectedDate && activeButton) {
        const data = {
          ambulatorio: activeButton === 'left' ? 'Geral' : 'LGBT',
          especialidade: selectedEspecialidade ? selectedEspecialidade.label : '',
          tipo: selectedServico ? selectedServico.label : '',
          keyEspecialista: selectedEspecialista.value, // Remove o 'Person/' do doctorKey
          keyPaciente: selectedPaciente.value.split('/')[1], // Remove o 'Person/' do patientKey
          data: selectedDate,
          horaInicio: selectedTime ? selectedTime.value.split('-')[0] : '',
          horaFim: selectedTime ? selectedTime.value.split('-')[1] : '',
        };
        try {
          const response = await api.post('/agendar/add', data);
          console.log('Dados enviados com sucesso:', response.data);
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
          
          cleanForms()

          let tempSelectedDoctors = selectedDoctors.map(element => element);
          setSelectedDoctors([])
          setEvents([])
          for (let i = 0; i < tempSelectedDoctors.length; i++) {
            handleDoctorChange(tempSelectedDoctors[i])

          }
          setIsSubmitting(false);
        } catch (error) {
          console.error('Erro ao enviar os dados:', error);
        }
      } else {
        alert('Por favor, preencha todos os campos e selecione um tipo de agendamento.');
      }
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
              <div>
                <label htmlFor="dateInput" className="form-label">Tipo de agendamento</label>
                <div className='input-container input-sel'>
                  <AsyncSelect
                    value={especialidadeValue}
                    defaultOptions={[{ value: 'clear', label: '' }, ...especialidadeOptions]}
                    onMenuOpen={loadTipoDeEspecialistaOptions}
                    isSearchable={false}
                    onChange={handleEspecialidadeChange}
                    styles={{
                      option: (provided) => ({
                        ...provided,
                        minHeight: '40px',
                      }),
                    }}
                  />
                </div>
                {selectedEspecialidade && selectedEspecialidade.servicos && (
                  <>
                    <label htmlFor="dateInput" className="form-label">Serviço</label>
                    <div className='input-container input-sel'>
                      <AsyncSelect
                        value={servicoValue}
                        defaultOptions={[{ value: 'clear', label: '' }, ...selectedEspecialidade.servicos.map(servico => ({ label: servico, value: servico }))]}
                        onMenuOpen={loadServicoOptions}
                        isSearchable={false}
                        onChange={handleServicoChange}
                        styles={{
                          option: (provided) => ({
                            ...provided,
                            minHeight: '40px',
                          }),
                        }}
                      />
                    </div>
                  </>
                )}
                {(selectedEspecialidade || selectedEspecialista) && (
                  <>
                    <label className="form-label">Especialista</label>
                    <div className={`input-container ${selectedEspecialista ? 'flex-container' : ''}`}>
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
                      <div>
                        {selectedEspecialista && (
                          <button onClick={handleEspecialistaClear} className="clear-button">
                            <i className="bi bi-x-lg"></i>
                          </button>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
              <div className='w-100 d-flex'>
                <div id='data' className='w-50'>
                  <label htmlFor="dateInput" className="form-label">Data</label>
                  <div className="input-container">
                    <input id='dateInput' type="date" className="form-control" value={selectedDate} onChange={handleDateChange} />
                  </div>
                </div>
                <div id='hora' className='w-50'>
                  <label htmlFor="dateInput" className="form-label">Hora</label>
                  <div className='input-container input-hora'>
                    <Select key={selectTimeKey} options={timeOptions} onChange={handleTimeChange} />
                  </div>
                </div>
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
            <button type="button" className="btn btn-secondary me-auto" onClick={cleanForms}>Limpar</button>
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