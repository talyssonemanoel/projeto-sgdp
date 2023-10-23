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
  const dateStartTimeMap = {};
  
  const colorHash = new ColorHash();
  let startTime = '18:00';
  let endTime = null;
  
  useEffect(() => {
    // Carrega as opções iniciais
    loadOptions("");
    console.log()
  }, []);

  const addMinutes = (time, minutes) => {
    const [hours, mins] = time.split(':').map(Number);
    const totalMinutes = hours * 60 + mins + minutes;
    const newHours = Math.floor(totalMinutes / 60);
    const newMinutes = totalMinutes % 60;
    return `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`;
  };

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
        const doctorOptions = response.data.map(doctor => ({ value: doctor._key, label: doctor.Nome }));
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
      const response = await api.get('/agendar/GetServicesByDoctorKey', { params: { doctorKey: selectedDoctor.value } });
      const doctorAppointments = response.data.map(appointment => {
        const selectedDateStr = appointment.date; // Obtenha a data do agendamento
        
        // Verifique se a data já existe no objeto dateStartTimeMap
        if (!dateStartTimeMap[selectedDateStr]) {
          dateStartTimeMap[selectedDateStr] = '18:00'; // Se não existir, defina o horário de início para '18:00'
        }
        
        let start = dateStartTimeMap[selectedDateStr]; // Obtenha o horário de início para a data
  
        // Calcule o horário de fim
        const endTime = addMinutes(start, 15);
  
        // Atualize o horário de início para a próxima vez
        dateStartTimeMap[selectedDateStr] = endTime;
  
        const end = `${appointment.date}T${endTime}:00`;
  
        return {
          title: appointment.patientName,
          start: `${appointment.date}T${start}:00`,
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
        <div>
          <span className="doctor-color-dot" style={dotStyle}></span>
        </div>
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

const updateAppointments = async () => {
  const newEvents = [];
  for (const doctor of selectedDoctors) {
    const response = await api.get('/agendar/GetServicesByDoctorKey', { params: { doctorKey: doctor.value } });
    const doctorAppointments = response.data.map(appointment => {
      const selectedDateStr = appointment.date;
      if (!dateStartTimeMap[selectedDateStr]) {
        dateStartTimeMap[selectedDateStr] = '18:00';
      }
      let start = dateStartTimeMap[selectedDateStr];
      const endTime = addMinutes(start, 15);
      dateStartTimeMap[selectedDateStr] = endTime;
      const end = `${appointment.date}T${endTime}:00`;
      return {
        title: appointment.patientName,
        start: `${appointment.date}T${start}:00`,
        end: end,
        doctorKey: doctor.value,
        color: doctor.color,
      };
    });
    newEvents.push(...doctorAppointments);
  }
  setEvents(newEvents);
};
  

  const handleRemoveDoctor = (doctorToRemove) => {
    // Remove o médico da lista de médicos selecionados
    setSelectedDoctors((prevDoctors) => prevDoctors.filter((doctor) => doctor.value !== doctorToRemove.value));
  
    // Remove os agendamentos do médico removido
    setEvents((prevEvents) => prevEvents.filter((event) => event.doctorKey !== doctorToRemove.value));
  };
  

  return (
    <div className="calendar-container">
      <ModalAgendamento onSave={updateAppointments} />
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
          .fc .fc-timegrid-axis-cushion, .fc .fc-timegrid-slot-label-cushion {
            height: 60px;
            line-height: 60px;
          }
          .fc-direction-ltr .fc-timegrid-slot-label-frame {
            text-align: center;
          }
          .list-group-item {
            display: flex;
            align-items: center;
          }
          .doctor-name {
            max-width: 100%;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
          .mb-3 {
            margin-bottom: 7px!important;
          }
          .calendar-container {
            box-shadow: 0 2px 4px rgba(5, 5, 5, 5);
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
        <div className="input-group mb-3 input-especialista">
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
          slotLabelInterval="00:15:00" // Define o intervalo para 15 minutos
          slotDuration="00:15:00"      // Define a duração do slot como 15 minutos
          scrollTime={'18:00:00'}
          allDaySlot={false}
        />
      </div>
    </div>
  );
};

export default AgendamentoAgendar;