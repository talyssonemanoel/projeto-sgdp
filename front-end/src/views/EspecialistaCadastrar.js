  import React, { useState, useEffect } from 'react';
  import api from '../services/api';
  //import '../css/EspecialistaCadastrar.css';
  
  const EspecialistaCadastrar = () => {
    const [name, setName] = useState('');
    const [cpf, setCpf] = useState('');
    const [phone, setPhone] = useState('');
    const [specialty, setSpecialty] = useState('');
    const [residente, setResidente] = useState(true);
    const [address, setAddress] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [email, setEmail] = useState('');
    const [isAdmin, setIsAdmin] = useState(false); // Estado para armazenar a permissão do administrador
    const [sex, setSex] = useState(''); // Opções: Masculino, Feminino, Outro
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('token');
        checkAdminPermission(token);
      }, []);
    
      const checkAdminPermission = async (token) => {
        try {
          const response = await api.get(`/verify/admin?token=${token}`);
          if (response.status === 200) {
            setIsAdmin(true); // Permissão concedida
          } else {
            setIsAdmin(false); // Outro código de resposta
          }
        } catch (error) {
          console.error(error);
          setIsAdmin(false);
        }
      };

    const handleCadastro = async () => {
        try {
          const token = localStorage.getItem('token');
          const response = await api.post(`/doctors/add?token=${token}`, {
                name,
                cpf,
                phone,
                specialty,
                residente,
                address,
                dateOfBirth,
                email,
                sex,
                startTime,
                endTime
            });

            if (response.data.message) {
                setMessage(response.data.message);
                setName('');
                setCpf('');
                setPhone('');
                setSpecialty('');
                setResidente(true);
                setAddress('');
                setDateOfBirth('');
                setEmail('');
                setSex('');
                setStartTime('');
                setEndTime('');
            }
        } catch (error) {
            if (error.response) {
                setMessage(error.response.data.error);
            } else {
                setMessage('Erro ao cadastrar especialista.');
            }
        }
    };

    if (!isAdmin) {
        return <p>Acesso não autorizado</p>;
      }

    return (
        <div className="content">
            <h2>Cadastrar Especialista</h2>
            {message && <p className="message">{message}</p>}
            <form>
                <label>Nome:</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
                <label>CPF:</label>
                <input type="text" value={cpf} onChange={(e) => setCpf(e.target.value)} />
                <label>Telefone:</label>
                <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} />
                <label>Especialidade:</label>
                <input type="text" value={specialty} onChange={(e) => setSpecialty(e.target.value)} />
                <label>Residente:</label>
                <select value={residente} onChange={(e) => setResidente(e.target.value === 'true')}>
                    <option value="true">SIM</option>
                    <option value="false">NÃO</option>
                </select>
                <label>Endereço:</label>
                <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} />
                <label>Data de Nascimento:</label>
                <input type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} />
                <label>Email:</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                <label>Sexo:</label>
                <select value={sex} onChange={(e) => setSex(e.target.value)}>
                    <option value="">Selecionar</option>
                    <option value="Masculino">Masculino</option>
                    <option value="Feminino">Feminino</option>
                    <option value="Outro">Outro</option>
                </select>
                <label>Hora de Início:</label>
                <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
                <label>Hora de Finalização:</label>
                <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
                <button type="button" onClick={handleCadastro}>Cadastrar</button>
            </form>
        </div>
    );
};
  
export default EspecialistaCadastrar;
