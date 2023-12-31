import React, { useState, useEffect } from 'react';
import api from "../services/api";
import "../css/Prontuario.css";
import BuscarPaciente from '../components/BuscarPaciente';
import ProntuarioLinhaDoTempo from '../components/ProntuarioLinhaDoTempo'; // Importe o novo componente
import moment from 'moment';
import { useLocation } from 'react-router-dom';

const ProntuarioEspecialista = ({ User }) => {
    const [selectedPaciente, setSelectedPaciente] = useState(null);
    const [pacienteInputValue, setPacienteInputValue] = useState();
    const [atendimentos, setAtendimentos] = useState([]);
    const [atendimentosProntuario, setAtendimentosProntuario] = useState([]);
    const [selectedSpecialty, setSelectedSpecialty] = useState(User.nomeEspecialidade);
    const [emAtendimento, setEmAtendimento] = useState('');
    const [currentAtendimento, setCurrentAtendimento] = useState('');
    const [atendimentoView, setAtendimentoView] = useState('');
    const [resumoView, setResumoView] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [activeButton, setActiveButton] = useState(null);
    const [checkboxAtivada, setCheckboxAtivada] = useState(false);
    const [atendimentoInfo, setAtendimentoInfo] = useState('');
    const [privateInfo, setPrivateInfo] = useState('');
    const [loading, setLoading] = useState(true);

    const location = useLocation();
    let event = location.state?.event;

    useEffect(() => {
        const fetchPatientData = async () => {
            try {
                // Fazer a requisição para obter os detalhes do paciente usando event._key
                const response = await api.get('/patients/GetPatientByKey', { params: { q: event.atendimento.keyPaciente } });

                // Atualizar o estado selectedPaciente com os dados obtidos
                setSelectedPaciente(response.data);
                loadAtendimentos(response.data._key, User._key, event.atendimento.ambulatorio)
            } catch (error) {
                console.error('Erro ao buscar dados do paciente:', error);
            } finally {
                // Desativar o indicador de carregamento, independentemente do resultado
                setLoading(false);
            }

        };

        // Verificar se event existe e tem a propriedade _key
        if (event) {
            fetchPatientData();
        }
    }, [event]);

    const loadPacienteOptions = async (inputValue, ambulatorio) => {
        try {
            const response = await api.get('/patients/livesearch-prontuario', { params: { q: inputValue, ambulatorio: ambulatorio } });
            const data = response.data.map(item => ({
                value: item._key,
                label: item.nome,

                _key: item._key,
                nome: item.nome,
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
            console.log(User)
            return data;
        } catch (error) {
            console.error('Erro ao buscar dados de pacientes:', error);
            return [];
        }
    };

    // Crie uma função para carregar os atendimentos
    const loadAtendimentos = async (pacienteKey, especialistaKey, ambulatorio) => {
        //carrega atendimentos do médico que estão agendados
        try {
            if (event) {
                console.log(event)
                setAtendimentos([event.atendimento])
            } else {
                const response = await api.get('/agendar/GetServicesByPatientKeyAndSpecialistKey', { params: { patient: pacienteKey, specialist: especialistaKey, ambulatorio: ambulatorio, status: "agendado" } });
                setAtendimentos(response.data);
            }

        } catch (error) {
            console.error('Erro ao buscar dados de atendimentos:', error);
        }

        //carrega atendimentos do prontuario do paciente
        try {
            const response = await api.get('/agendar/GetServicesByPatientKey', { params: { q: pacienteKey, ambulatorio: ambulatorio } });
            const filteredAtendimentos = response.data.filter(atendimento => atendimento.especialidade === selectedSpecialty && atendimento.status === "finalizado");
            setAtendimentosProntuario(filteredAtendimentos);

        } catch (error) {
            console.error('Erro ao buscar dados de atendimentos:', error);
        }
    };

    const handlePacienteInputChange = (newValue) => {
        setPacienteInputValue(newValue);
    };

    const handlePacienteChange = (selectedOption) => {
        setSelectedPaciente(selectedOption);
        setEmAtendimento(false)
        loadAtendimentos(selectedOption._key, User._key, activeButton);
    };

    const handlePacienteClear = () => {
        setSelectedPaciente(null);
        setEmAtendimento(false)
        setPacienteInputValue('');
    };

    const handleStartAtendimento = (atendimento) => {
        setCurrentAtendimento(atendimento);
        setResumoView(false)
        setEmAtendimento(true)
        setAtendimentoView(true)
    };

    const handleFinalizarAtendimento = async (_key, info, infoPrivado) => {
        try {
            const response = await api.put(
                '/agendar/finalizar',
                {
                    _key: _key,
                    info: info,
                    infoPrivado: infoPrivado
                },
                { headers: { 'Content-Type': 'application/json' } }
            );
            setCurrentAtendimento(null);
            setEmAtendimento(false);
            setAtendimentoView(false);
            setAtendimentoInfo('');
            setPrivateInfo('');
        } catch (error) {
            console.error('Erro ao finalizar atendimento:', error);
        }
    };

    const handleCancelarAtendimento = () => {
        setCurrentAtendimento('');
        setEmAtendimento(false)
        setAtendimentoView(false)
        setAtendimentoInfo('')
        setPrivateInfo('')
        setCheckboxAtivada(false)
    };

    const handleFecharPaciente = () => {
        handlePacienteChange('')
        setCurrentAtendimento('');
        setEmAtendimento(false)
        setAtendimentoView(false)
        setAtendimentoInfo('')
        setPrivateInfo('')
        setCheckboxAtivada(false)
        setAtendimentoView('')
        setResumoView('')
        setActiveButton('')
        setAtendimentos([])
        setAtendimentosProntuario('')
        event = null
    }

    return (
        <div>
            {selectedPaciente || event ? (
                (() => {
                    let birthday
                    let age
                    if (selectedPaciente) {
                        birthday = moment(selectedPaciente.birthday);
                        age = moment().diff(birthday, 'years');
                    }

                    return (
                        <div className='body-prontuario d-flex'>
                            <div className=''>
                                <div className="menu-left">
                                    <div className="titulo-menu-left">
                                        Atendimento
                                    </div>
                                    <div>
                                        {atendimentos.map(atendimento => (
                                            <React.Fragment key={atendimento._key}>
                                                <div className='block-atendimento h-100'>
                                                    <div className='block-atendimento-hora'>
                                                        <div className='block-atendimento-data'>
                                                            {moment(atendimento.data).format('DD/MM/YYYY')}
                                                        </div>
                                                        {atendimento.horaInicio} - {atendimento.horaFim}
                                                    </div>
                                                    <div className='block-btn-atendimento h-100'>
                                                        <button
                                                            type="button"
                                                            className={`btn btn-${emAtendimento && atendimento._key !== currentAtendimento._key ? `outline-primary disabled` : 'primary'} btn-sm btn-atendimento`}
                                                            disabled={emAtendimento && atendimento._key === currentAtendimento._key}
                                                            onClick={() => handleStartAtendimento(atendimento)}
                                                        >
                                                            {emAtendimento && atendimento._key === currentAtendimento._key ? 'Em atendimento' : 'Iniciar atendimento'}
                                                        </button>
                                                    </div>
                                                </div>
                                            </React.Fragment>
                                        ))}
                                    </div>
                                    <button
                                        className={`w-100 btn-menu-l ${resumoView ? 'selected' : ''}`}
                                        //key={especialidade}
                                        onClick={() => {
                                            if (resumoView) {
                                                setResumoView(''); // Desmarque o botão se já estiver selecionado
                                                setCurrentPage(0);
                                            } else {
                                                setAtendimentoView(false);
                                                setResumoView(true); // Selecione o botão se não estiver selecionado
                                                setAtendimentoView('');
                                                setCurrentPage(0);
                                            }
                                        }}
                                    >
                                        Resumo
                                    </button>
                                    {emAtendimento && (<button
                                        className={`w-100 btn-menu-l ${atendimentoView ? 'selected' : ''}`}
                                        //key={especialidade}
                                        onClick={() => {
                                            if (atendimentoView) {
                                                setAtendimentoView(''); // Desmarque o botão se já estiver selecionado
                                                setCurrentPage(0);
                                            } else {
                                                setResumoView(false);
                                                setAtendimentoView(true); // Selecione o botão se não estiver selecionado
                                                setCurrentPage(0);
                                            }
                                        }}
                                    >
                                        Atendimento
                                    </button>
                                    )}
                                </div>
                            </div>
                            <div className='w-100'>
                                <div className='p-content h-100'>
                                    {resumoView ? (
                                        <div>
                                            <div className="cabecalho-prontuario">
                                                <div className='d-flex justify-content-between'>
                                                    <div>
                                                        <h6>{selectedPaciente?.nome}</h6>
                                                    </div>
                                                    <div>
                                                        <button
                                                            type="button"
                                                            class="btn-close d-flex align-items-start p-0"
                                                            aria-label="Close"
                                                            data-bs-toggle="modal"
                                                            data-bs-target="#staticBackdrop"
                                                        >
                                                        </button>
                                                    </div>
                                                </div>
                                                <h7>{age} anos</h7>
                                            </div>
                                            <div className='d-flex justify-content-end'>
                                                <i class="bi bi-envelope-fill" style={{ fontSize: '1.3em', color: '#0d6efd', marginRight: '0.5em' }}></i>
                                                <i class="bi bi-printer-fill" style={{ fontSize: '1.3em', color: '#0d6efd', marginRight: '0.2em' }}></i>
                                            </div>

                                            <div>
                                                <ProntuarioLinhaDoTempo atendimentos={atendimentosProntuario} currentPage={currentPage} setCurrentPage={setCurrentPage} />
                                            </div>
                                        </div>
                                    ) : atendimentoView ? (
                                        <div>
                                            <div className="cabecalho-prontuario">
                                                <div className='d-flex justify-content-between'>
                                                    <div>
                                                        <h6>{selectedPaciente?.nome}</h6>
                                                    </div>
                                                    <div>
                                                        <button
                                                            type="button"
                                                            class="btn-close d-flex align-items-start p-0"
                                                            aria-label="Close"
                                                            data-bs-toggle="modal"
                                                            data-bs-target="#staticBackdrop"
                                                        >
                                                        </button>
                                                    </div>
                                                </div>
                                                <h7>{age} anos</h7>
                                            </div>
                                            {emAtendimento && (
                                                <div>
                                                    <div className='h-100 d-flex justify-content-center mt-3'>
                                                        <h4>{currentAtendimento.tipo}</h4>
                                                    </div>
                                                    <div>
                                                        <div class="mb-3">
                                                            <label for="atendimento-info" class="form-label">Informações do atendimento</label>
                                                            <textarea
                                                                className="form-control"
                                                                id="atendimento-info"
                                                                rows="4"
                                                                value={atendimentoInfo}
                                                                onChange={(e) => setAtendimentoInfo(e.target.value)}
                                                            ></textarea>

                                                        </div>
                                                    </div>
                                                    <div className="form-check">
                                                        <input
                                                            className="form-check-input"
                                                            type="checkbox"
                                                            value=""
                                                            id="flexCheckDefault"
                                                            checked={checkboxAtivada}
                                                            onChange={() => setCheckboxAtivada(!checkboxAtivada)}
                                                        />
                                                        <label for="atendimento-private-info" className="form-check-label" htmlFor="flexCheckDefault">
                                                            Adicionar informações confidenciais
                                                        </label>
                                                    </div>

                                                    {checkboxAtivada && (
                                                        <div class="mb-3">
                                                            <textarea
                                                                className="form-control"
                                                                rows="4"
                                                                id="atendimento-private-info"
                                                                placeholder="Informações confidenciais..."
                                                                value={privateInfo}
                                                                onChange={(e) => setPrivateInfo(e.target.value)}
                                                            ></textarea>

                                                        </div>
                                                    )}
                                                    <button
                                                            type="button"
                                                            class={`btn btn-danger btn-sm me-1 ${!checkboxAtivada ? 'mt-3' : ''}`}
                                                            data-bs-toggle="modal"
                                                            data-bs-target="#fecharPaciente"
                                                        >
                                                            Cancelar
                                                        </button>
                                                    <button
                                                            type="button"
                                                            className={`btn btn-primary btn-sm ${!checkboxAtivada ? 'mt-3' : ''}`}
                                                            data-bs-toggle="modal"
                                                            data-bs-target="#finalizarAtendimento"
                                                        >
                                                            Finalizar atendimento
                                                        </button>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="dados-gerais-do-paciente h-100">
                                            <div class='w-100 text-center'>
                                                <div class='d-flex justify-content-between'>
                                                    <h4 class='mx-auto'>FICHA INDIVIDUAL</h4>
                                                    <div className=''>
                                                        <button
                                                            type="button"
                                                            class="btn-close d-flex align-items-start p-0"
                                                            aria-label="Close"
                                                            data-bs-toggle="modal"
                                                            data-bs-target="#fecharPaciente"
                                                        >
                                                        </button>
                                                    </div>
                                                </div>
                                                <div class='divisor-subtitle'>
                                                    <h6>IDENTIFICAÇÃO</h6>
                                                </div>
                                            </div>
                                            <h7>Nome completo: {selectedPaciente?.nome}</h7>
                                            <div className='d-flex'>
                                                <div className='col-6'>
                                                    <h7>Data de nascimento: {moment(selectedPaciente?.birthday).format('DD/MM/YYYY')}</h7>
                                                </div>
                                                <div className='col-6'>
                                                    <h7>Cartão do SUS: {selectedPaciente?.cartaoSus}</h7>
                                                </div>
                                            </div>
                                            <div className='d-flex'>
                                                <div className='col-6'>
                                                    <h7>RG: {selectedPaciente?.rg}</h7>
                                                </div>
                                                <div className='col-6'>
                                                    <h7>CPF: {selectedPaciente?.cpf}</h7>
                                                </div>
                                            </div>
                                            <div className='d-flex'>
                                                <div className='col-6'>
                                                    <h7>Orientação sexual: {selectedPaciente?.orientacaoSexual}</h7>
                                                </div>
                                                <div className='col-6'>
                                                    <h7>Identidade de gênero: {selectedPaciente?.identidadeDeGenero}</h7>
                                                </div>
                                            </div>
                                            <div className='d-flex'>
                                                <div className='col-6'>
                                                    <h7>Etnia: {selectedPaciente?.etnia}</h7>
                                                </div>
                                                <div className='col-6'>
                                                    <h7>Escolaridade: {selectedPaciente?.escolaridade}</h7>
                                                </div>
                                            </div>
                                            <div className='d-flex'>
                                                <div className='col-6'>
                                                    <h7>Estado civil: {selectedPaciente?.estadoCivil}</h7>
                                                </div>
                                                <div className='col-6'>
                                                    <h7>Ocupação: {selectedPaciente?.ocupacao}</h7>
                                                </div>
                                            </div>
                                            <h7>UBS REF: {selectedPaciente?.ubsCadastrada}</h7>
                                            <h7>Nome da mãe: {selectedPaciente?.nomeDaMae}</h7>
                                            <div className='w-100 text-center'>
                                                <div className='divisor-subtitle'>
                                                    <h6>ENDEREÇO</h6>
                                                </div>
                                            </div>
                                            <h7>Logradouro: {selectedPaciente?.logradouro}</h7>
                                            <div className='d-flex'>
                                                <div className='col-6'>
                                                    <h7>Número: {selectedPaciente?.numeroEndereco}</h7>
                                                </div>
                                                <div className='col-6'>
                                                    <h7>Bairro: {selectedPaciente?.bairro}</h7>
                                                </div>
                                            </div>
                                            <h7>Complemento: {selectedPaciente?.complementoEndereco}</h7>
                                            <div className='d-flex'>
                                                <div className='col-6'>
                                                    <h7>Cidade: {selectedPaciente?.cidade}</h7>
                                                </div>
                                                <div className='col-6'>
                                                    <h7>Estado: {selectedPaciente?.estado}</h7>
                                                </div>
                                            </div>
                                            <div className='w-100 text-center'>
                                                <div className='divisor-subtitle'>
                                                    <h6>CONTATO</h6>
                                                </div>
                                            </div>
                                            <h7>Email: {selectedPaciente?.email}</h7>
                                            <div className='d-flex'>
                                                <div className='col-6'>
                                                    <h7>Telefone: {selectedPaciente?.telefone}</h7>
                                                </div>
                                                <div className='col-6'>
                                                    <h7>Whatsapp: {selectedPaciente?.whatsapp}</h7>
                                                </div>
                                            </div>
                                            <h7>Em caso de emergência: {selectedPaciente?.contatoEmergencia}</h7>
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

            <div class="modal fade " id="fecharPaciente" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h1 class="modal-title fs-5" id="fecharPacienteLabel">Confirme sua decisão</h1>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            Tem certeza que deseja retornar para a página de busca de pacientes?
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Não</button>
                            <button type="button" class="btn btn-primary" data-bs-dismiss="modal" onClick={handleFecharPaciente}>Sim</button>
                        </div>
                    </div>
                </div>
            </div>

            <div class="modal fade " id="finalizarAtendimento" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h1 class="modal-title fs-5" id="finalizarAtendimentoLabel">Confirme sua decisão</h1>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            Tem certeza que deseja retornar para a página de bussssssca de pacientes?
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Não</button>
                            <button type="button" class="btn btn-primary" data-bs-dismiss="modal" onClick={handleFecharPaciente}>Sim</button>
                        </div>
                    </div>
                </div>
            </div>

            <div class="modal fade " id="cancelarAtendimento" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h1 class="modal-title fs-5" id="cancelarAtendimentoLabel">Confirme sua decisão</h1>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            Ao cancelar o atendimento, você perderá todas as informações não salvas. Você deseja continuar?
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Não</button>
                            <button type="button" class="btn btn-primary" data-bs-dismiss="modal" onClick={handleFecharPaciente}>Sim</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    );

};

export default ProntuarioEspecialista;

