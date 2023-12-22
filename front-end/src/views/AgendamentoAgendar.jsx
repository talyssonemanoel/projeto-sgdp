import React, { useState, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import Calendar from 'react-calendar';
import ptBrLocale from '@fullcalendar/core/locales/pt-br';
import Select from 'react-select';
import api from "../services/api";
import ColorHash from 'color-hash';
import ModalAgendamento from '../components/ModalAgendamento'; // Importe o componente de modal
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-calendar/dist/Calendar.css';
import '../css/AgendamentoAgendar.css';

const AgendamentoAgendar = () => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [options, setOptions] = useState([]);
  const [selectedDoctors, setSelectedDoctors] = useState([]);
  const [events, setEvents] = useState([]);
  const [show, setShow] = useState(false);
  const [modalInfo, setModalInfo] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedAppointmentDate, setSelectedAppointmentDate] = useState('');
  const [currentMonth, setCurrentMonth] = useState('');
  const [selectedEspecialista, setSelectedEspecialista] = useState(null);
  const [especialidadeValue, setEspecialidadeValue] = useState(null);
  const [selectedEspecialidade, setSelectedEspecialidade] = useState(null);
  const fullCalendarRef = React.useRef();
  const colorHash = new ColorHash();
  const timeOptions = [];

  useEffect(() => {
    // Carrega as opções iniciais
    loadOptions("");
  }, []);

  const handleCalendarViewChange = (info) => {
    // Certifica-se de que a propriedade 'view' existe antes de tentar acessá-la
    if (info.view) {
      const calendarDate = info.view.activeStart;

      // Formata a data no formato 'aaaa/mm'
      const formattedMonth = `${calendarDate.getFullYear()}/${(calendarDate.getMonth() + 1).toString().padStart(2, '0')}`;

      setCurrentMonth(formattedMonth);
      reloadEvents(selectedDoctors, setSelectedDoctors);

    }
  };

  const reloadEvents = (selectedDoctors, setSelectedDoctors) => {
    let tempSelectedDoctors = selectedDoctors.map(element => element);
    setSelectedDoctors([])
    setEvents([])
    for (let i = 0; i < tempSelectedDoctors.length; i++) {
      handleDoctorChange(tempSelectedDoctors[i], currentMonth)
    }
  }

  for (let i = 0; i < 24; i++) {
    for (let j = 0; j < 60; j += 30) {
      let startHour = i.toString().padStart(2, '0');
      let startMinute = j.toString().padStart(2, '0');
      let endHour = (j === 30 ? (i + 1) : i).toString().padStart(2, '0');
      let endMinute = (j === 30 ? '00' : '30');
      timeOptions.push({ value: `${startHour}:${startMinute}-${endHour}:${endMinute}`, label: `${startHour}:${startMinute} - ${endHour}:${endMinute}` });
    }
  }

  const handleAppointmentDateChange = (event) => {
    setSelectedAppointmentDate(event.target.value);
    console.log(event.target.value)
  };

  const handleTimeChange = (selectedOption) => {
    setSelectedTime(selectedOption);
  };

  const handleClose = () => {
    setShow(false);
    setShowDatePicker(false)
    setShowConfirm(false)
  }

  const handleAbortarClick = () => {
    setShowDatePicker(false);
    setSelectedAppointmentDate('');
  };

  //const handleShow = () => setShow(true);
  const handleShow = () => {
    setShow(true);
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    // Muda a data exibida no FullCalendar para a data selecionada
    fullCalendarRef.current.getApi().gotoDate(date);
  };

  const handleReagendamentoConfirmado = async () => {
    if (selectedAppointmentDate && selectedTime) {
      // Lógica para processar a nova data e hora
      const dataHora = {
        data: selectedAppointmentDate,
        horaInicio: selectedTime ? selectedTime.value.split('-')[0] : '',
        horaFim: selectedTime ? selectedTime.value.split('-')[1] : '',
      };

      try {
        // Substitua 'url' pela URL da sua API e 'data' pelos dados que você deseja enviar
        const response = await api.put(`/agendar/reagendar/${modalInfo.id}`, dataHora);
        if (response.status === 200) {
          // A solicitação foi bem-sucedida, você pode prosseguir com o reagendamento
          console.log('O status do serviço foi alterado para cancelado');
        } else {
          // Algo deu errado, você pode lidar com o erro aqui
          console.log('Algo deu errado ao tentar reagendar o serviço');
        }
        reloadEvents(selectedDoctors, setSelectedDoctors);
      } catch (error) {
        console.error('Erro ao tentar reagendar o serviço:', error);
      }
      handleClose();
      setShowDatePicker(false);
      setSelectedAppointmentDate('');
    } else {
      // Informar ao usuário que a data e/ou hora não foram selecionadas
      console.log('Por favor, selecione a data e a hora antes de confirmar o reagendamento.');
      // Ou você pode exibir uma mensagem de alerta para o usuário informando sobre a falta de seleção
    }
  };

  const handleConfirm = async (currentMonth) => {
    try {
      // Substitua 'url' pela URL da sua API e 'data' pelos dados que você deseja enviar
      const response = await api.put(`/agendar/cancel/${modalInfo.id}`);
      if (response.status === 200) {
        // A solicitação foi bem-sucedida, você pode prosseguir com o cancelamento
        console.log('O status do serviço foi alterado para cancelado');
      } else {
        // Algo deu errado, você pode lidar com o erro aqui
        console.log('Algo deu errado ao tentar cancelar o serviço');
      }

      let tempSelectedDoctors = selectedDoctors.map(element => element);
      setSelectedDoctors([])
      setEvents([])
      for (let i = 0; i < tempSelectedDoctors.length; i++) {
        handleDoctorChange(tempSelectedDoctors[i], currentMonth)

      }

    } catch (error) {
      console.error('Erro ao tentar cancelar o serviço:', error);
    }

    // Depois de realizar a operação, oculte o elemento de confirmação
    setShowConfirm(false);
    handleClose();
  };



  const handleEventClick = (info) => {
    // info.event contém as informações do evento clicado
    const event = info.event;

    // Defina modalInfo aqui
    setModalInfo(event);

    // Aqui você pode abrir o modal
    handleShow();
  };


  const loadOptions = async (inputValue) => {
    if (inputValue) {
      try {
        const response = await api.get('/doctors/livesearch', { params: { q: inputValue } });
        const doctorOptions = response.data.map(doctor => ({ value: doctor._key, label: doctor.nome, specialty: doctor.nomeEspecialidade }));
        setOptions(doctorOptions);
      } catch (error) {
        console.error('Erro ao buscar médicos:', error);
      }
    } else {
      // Se inputValue estiver vazio, limpe as opções
      //setOptions([]);
    }
  };


  const handleDoctorChange = async (selectedDoctor, currentMonth) => {
    if (selectedDoctor) {
      // Gere uma cor única com base no valor do médico
      const color = colorHash.hex(selectedDoctor.value);
      // Adicione a cor ao objeto do médico
      const doctorWithColor = { ...selectedDoctor, color };

      setSelectedDoctors((prevDoctors) => [...prevDoctors, doctorWithColor]);

      // Busca os agendamentos do médico selecionado
      const status = "agendado || finalizado"; // Substitua 'seuStatusAqui' pelo valor real do status

      // Obtenha a data atualmente exibida no FullCalendar
      const currentDate = fullCalendarRef.current.getApi().getDate();

      // Formate a data para o formato que você precisa (por exemplo, YYYY-MM)
      const formattedDate = currentDate.toISOString().slice(0, 7);

      const response = await api.get('/agendar/GetServicesBySpecialistKey', {
        params: {
          keyEspecialista: selectedDoctor.value,
          status: status,
          date: formattedDate // Use a data formatada
        }
      });
      const doctorAppointments = response.data.map(appointment => {
        // Combina a data e a hora em uma string ISO 8601
        const start = `${appointment.data}T${appointment.horaInicio}:00`;
        const end = `${appointment.data}T${appointment.horaFim}:00`;
        return {
          id: appointment._key,
          status: appointment.status,
          title: `${appointment.nomePaciente} (${appointment.tipo})`,
          start: start,
          end: end,
          groupId: selectedDoctor.value,
          tipo: appointment.tipo,
          color: appointment.status === 'finalizado' ? 'black' : color,
        };
      });
      setEvents((prevEvents) => [...prevEvents, ...doctorAppointments]);
    }
    setSelectedOption(null); // Limpa a seleção atual
  };


  const getAvailableOptions = () => {
    return options.filter(option => !selectedDoctors.find(doctor => doctor.value === option.value));
  };

  const handleInputChange = (inputValue) => {
    setSelectedOption(null);
    loadOptions(inputValue);
  };

  const DoctorItem = ({ doctor, onRemoveDoctor }) => {
    // Crie uma string de estilo com a cor de fundo com base na cor do médico
    const dotStyle = {
      backgroundColor: doctor.color, // Use a cor atribuída ao médico
    };

    const handleEspecialistaItemClick = async (doctor) => {
      // Se o médico clicado for o mesmo que já está selecionado, deselecione-o
      const newSelectedDoctor = selectedEspecialista === doctor ? null : doctor;
    
      setSelectedEspecialista(newSelectedDoctor);

      try {
        // Faz uma solicitação GET para a rota /especialidade/SpecialtyByName
        const response = await api.get('/especialidade/SpecialtyByName', {
          params: { q: doctor.specialty }
        });
    
        // Cria um novo objeto com apenas os atributos que você precisa
        const data = {
          value: response.data._id,
          label: response.data.nome,
          servicos: response.data.servicos
        };
    
        // Usa o novo objeto para atualizar o estado especialidadeValue
        setEspecialidadeValue(data);
        setSelectedEspecialidade(data);
      } catch (error) {
        console.error('Erro ao buscar dados de especialidade:', error);
      }
    
      try {
        // Faz uma solicitação GET para a rota /especialidade/SpecialtyByName
        const response = await api.get('/especialidade/SpecialtyByName', {
          params: { q: doctor.specialty }
        });
    
        // Cria um novo objeto com apenas os atributos que você precisa
        const data = {
          value: response.data._id,
          label: response.data.nome,
          servicos: response.data.servicos
        };
    
        // Usa o novo objeto para atualizar o estado especialidadeValue
        setEspecialidadeValue(data);
        setSelectedEspecialidade(data);
      } catch (error) {
        console.error('Erro ao buscar dados de especialidade:', error);
      }
    };

    const itemStyle = selectedEspecialista === doctor ? { backgroundColor: '#dddddd' } : {};

    return (
      <li className="list-group-item" type="button" style={itemStyle}>
        <div className='w-100 d-flex align-items-center justify-content-between'>
          <span className="doctor-color-dot" style={dotStyle}></span>
          <div key={doctor.id} onClick={() => handleEspecialistaItemClick(doctor)}>
            {doctor.label}
          </div>
          <button
            type="button"
            className="button-X h-100"
            style={{ backgroundColor: 'transparent', border: 'none' }}
            onClick={() => onRemoveDoctor(doctor)}
          >
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
      </li>

    );
  };


  const handleRemoveDoctor = (doctorToRemove) => {
    // Remove o médico da lista de médicos selecionados
    setSelectedDoctors((prevDoctors) => prevDoctors.filter((doctor) => doctor.value !== doctorToRemove.value));

    setSelectedEspecialista(null)
    setSelectedEspecialidade('')
    setEspecialidadeValue('')
    // Remove os agendamentos do médico removido
    setEvents((prevEvents) => prevEvents.filter((event) => event.groupId !== doctorToRemove.value));
  };


  return (
    <div className="calendar-container">
      <ModalAgendamento
        calendarRef={fullCalendarRef}
        events={events}
        setEvents={setEvents}
        selectedDoctors={selectedDoctors}
        setSelectedDoctors={setSelectedDoctors}
        handleDoctorChange={handleDoctorChange}
        selectedTime={selectedTime}
        setSelectedTime={setSelectedTime}
        timeOptions={timeOptions}
        handleTimeChange={handleTimeChange}
        selectedEspecialista={selectedEspecialista}
        setSelectedEspecialista={setSelectedEspecialista}
        especialidadeValue={especialidadeValue}
        setEspecialidadeValue={setEspecialidadeValue}
        selectedEspecialidade={selectedEspecialidade}
        setSelectedEspecialidade={setSelectedEspecialidade}
      />
      <style>
        {`
          .main-content {
            padding: 0;
          }
          .fc {
            width: 100%;
          }
          .react-calendar__navigation button {
            min-width: 0px;
            background: none;
          }
          .react-calendar__navigation {
            display: flex;
            height: 44px;
            margin-bottom: 0em;
          }
          .fc-col-header-cell-cushion {
            text-transform: capitalize;
          }
          .form-floating>.form-control, .form-floating>.form-control-plaintext, .form-floating>.form-select {
            height: calc(2rem + calc(var(--bs-border-width) * 2));
            min-height: calc(2rem + calc(var(--bs-border-width) * 2));
            line-height: 1.25;
            padding: 5px 10px 5px 10px;
          }
          .list-group-item {
            display: flex;
            align-items: center;
          }
          .input-group .mb-3 {
            margin-bottom: 0px;
          } 
          .list-group-item {        
            padding-bottom: 3px;
            padding-top: 3px;
          }
          .fc-event {
            cursor: pointer;
            text-decoration: none;
            user-select: none;
          }
          .fc-timegrid-slot {
            height: 80px!important;
          }
          .close {
            align-self: flex-start;
          }
          .css-1nmdiq5-menu {
            color: black;
          }
          . {
            user-select: none;
          }
        `}
      </style>
      <div className="menu-agendar">
        <div className="bt-div">
          <button type="button" className="btn btn-primary bt-agendar" data-bs-toggle="modal" data-bs-target="#exampleModal">
            <i className="bi bi-plus-lg icone"></i>
            Agendar
          </button>
        </div>
        <div className="mini-calendar">
          <Calendar onChange={handleDateChange} value={selectedDate} />
        </div>
        <div className="input-group mb-3">
          <span className="input-group-text" id="basic-addon1">
            <i className="fa-solid fa-user-doctor" style={{ color: '#0d6efd' }}></i>
          </span>
          <div style={{ flex: 1, maxWidth: '80%' }}>
            <Select
              placeholder="Especialista"
              value={selectedOption}
              options={getAvailableOptions()}
              onInputChange={handleInputChange}
              onChange={handleDoctorChange}
            />
          </div>
        </div>
        <ul className="list-group">
          {selectedDoctors.map((doctor) => (
            <DoctorItem
              key={doctor.value}
              doctor={doctor}
              onRemoveDoctor={handleRemoveDoctor}
            />
          ))}
        </ul>
      </div>
      <div className="agenda">
        <FullCalendar
          datesSet={handleCalendarViewChange}
          events={events}
          eventClick={handleEventClick}
          ref={fullCalendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, listPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
          }}
          locale={ptBrLocale}
          slotLabelFormat={{
            hour: '2-digit',
            minute: '2-digit',
            omitZeroMinute: false,
            meridiem: false,
            hour12: false
          }}
          slotLabelInterval="00:30:00" // Define o intervalo para 15 minutos
          //slotDuration="00:30:00"
          scrollTime={'18:00:00'}
          allDaySlot={false}
        />
      </div>
      <Modal show={show} onHide={handleClose} centered data-bs-theme="light">
        <Modal.Header className='d-flex align-items-start' closeButton style={{ backgroundColor: modalInfo && modalInfo.backgroundColor, color: 'white' }}>
          <Modal.Title>{modalInfo && modalInfo.title}
            <div className='modal-subtitle'>
              {modalInfo && new Date(modalInfo.start).toLocaleDateString()} {modalInfo && new Date(modalInfo.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {modalInfo && new Date(modalInfo.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ backgroundColor: modalInfo && modalInfo.backgroundColor, color: 'white' }}>
          {/* Aqui você pode renderizar as informações do evento */}
          {modalInfo && (
            <>
              {modalInfo.extendedProps.status === "agendado" && (
                <div className='d-flex w-100 pb-3'>
                  <div className='w-50 d-flex justify-content-center'>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => {
                        setShowConfirm(false)
                        setShowDatePicker(true);
                      }}
                    >
                      Reagendar
                    </button>
                  </div>
                  <div className='w-50 d-flex justify-content-center'>
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={() => {
                        setShowConfirm(true);
                        setShowDatePicker(false);
                      }}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
              {modalInfo.extendedProps.status === "finalizado" && (
                <p>Finalizado</p>
              )}
              {showDatePicker && (
                <div className=''>
                  <div className='w-100 d-flex pb-3'>
                    <div id='data' className='w-50 d-flex justify-content-center'>
                      <div>
                        <label htmlFor="dateInput" className="form-label">Data</label>
                        <div className="">
                          <input id='dateInput' type="date" className="form-control inputdata-hora " value={selectedAppointmentDate} onChange={handleAppointmentDateChange} />
                        </div>
                      </div>
                    </div>
                    <div id='hora' className='w-50 d-flex justify-content-center'>
                      <div>
                        <label htmlFor="dateInput" className="form-label">Hora</label>
                        <div className='inputdata-hora '>
                          <Select options={timeOptions} onChange={handleTimeChange} />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className='w-100 d-flex justify-content-center'>
                    <button className='btn btn-primary btn-sm me-3' onClick={handleReagendamentoConfirmado}>Confirmar</button>
                    <button className='btn btn-secondary btn-sm' onClick={handleAbortarClick}>Abortar</button>
                  </div>
                </div>
              )}
              {showConfirm && (
                <div>
                  <p>Esta operação é irreversível. Você quer continuar?</p>
                  <div className='w-100 d-flex justify-content-center'>
                    <button className="btn btn-danger btn-sm me-3" onClick={() => handleConfirm(modalInfo.status)}>Sim</button>
                    <button className="btn btn-secondary btn-sm" onClick={() => setShowConfirm(false)}>Não</button>
                  </div>
                </div>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer style={{ backgroundColor: modalInfo && modalInfo.backgroundColor, color: 'white' }}>
          <Button
            variant="light"
            onClick={() => {
              handleClose()
            }}
          >
            Fechar
          </Button>
        </Modal.Footer>
      </Modal>

    </div>
  );
};

export default AgendamentoAgendar;