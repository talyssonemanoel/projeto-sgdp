import React, { useState, useEffect } from 'react';
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
  const colorHash = new ColorHash();
  
  useEffect(() => {
    // Carrega as opções iniciais
    loadOptions("");
  }, []);

  const fullCalendarRef = React.useRef();

  const handleDateChange = (date) => {
    setSelectedDate(date);
    // Muda a data exibida no FullCalendar para a data selecionada
    fullCalendarRef.current.getApi().gotoDate(date);
  };

  const loadOptions = async (inputValue) => {
    if (inputValue) {
      try {
        const response = await api.get('/doctors/livesearch', { params: { q: inputValue } });
        const doctorOptions = response.data.map(doctor => ({ value: doctor._key, label: doctor.nome }));
        setOptions(doctorOptions);
      } catch (error) {
        console.error('Erro ao buscar médicos:', error);
      }
    } else {
      // Se inputValue estiver vazio, limpe as opções
      //setOptions([]);
    }
  };

  const handleDoctorChange = async (selectedDoctor) => {
    if (selectedDoctor) {
      // Gere uma cor única com base no valor do médico
      const color = colorHash.hex(selectedDoctor.value);
  
      // Adicione a cor ao objeto do médico
      const doctorWithColor = { ...selectedDoctor, color };
  
      setSelectedDoctors((prevDoctors) => [...prevDoctors, doctorWithColor]);
  
      // Busca os agendamentos do médico selecionado
      const response = await api.get('/agendar/GetServicesBySpecialistKey', { params: { doctorKey: selectedDoctor.value } });
      console.log(selectedDoctor.value )
      const doctorAppointments = response.data.map(appointment => {
        // Combina a data e a hora em uma string ISO 8601
        const start = `${appointment.data}T${appointment.horaInicio}:00`;
        const end = `${appointment.data}T${appointment.horaFim}:00`;
      
        return {
          title: appointment.nomePaciente,
          start: start,
          end: end,
          doctorKey: selectedDoctor.value,
          // Use a cor gerada para o médico
          color: color,
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
  
    return (
      <li className="list-group-item" >
        <span className="doctor-color-dot" style={dotStyle}></span>
        <div className="doctor-name">
          {doctor.label}
        </div>
        <button
          type="button"
          className="button-X"
          style={{ backgroundColor: 'transparent', border: 'none'}}
          onClick={() => onRemoveDoctor(doctor)}
        >
          <i className="bi bi-x-lg"></i>
        </button>
      </li>

    );
  };
  

  const handleRemoveDoctor = (doctorToRemove) => {
    // Remove o médico da lista de médicos selecionados
    setSelectedDoctors((prevDoctors) => prevDoctors.filter((doctor) => doctor.value !== doctorToRemove.value));
  
    // Remove os agendamentos do médico removido
    setEvents((prevEvents) => prevEvents.filter((event) => event.doctorKey !== doctorToRemove.value));
  };
  

  return (
    <div className="calendar-container">
      <ModalAgendamento events={events} setEvents={setEvents} />
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
        <FullCalendar key={events} events={events}
          ref={fullCalendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, listPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
          }}
          events={events}
          locale={ptBrLocale}
          slotLabelFormat={{
            hour: '2-digit',
            minute: '2-digit',
            omitZeroMinute: false,
            meridiem: false,
            hour12: false
          }}
          //slotLabelInterval="00:30:00" // Define o intervalo para 15 minutos
          //slotDuration="00:30:00"
          scrollTime={'18:00:00'}
          allDaySlot={false}
        />
      </div>
    </div>
  );
};

export default AgendamentoAgendar;