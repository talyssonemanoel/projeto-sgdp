import React from 'react';
import api from '../services/api';
import { useForm } from 'react-hook-form'; // Importar o React Hook Form
import "../css/PacienteCadastro.css"

const PacienteCadastro = () => {
    // Criar uma instância do useForm
    const { register, handleSubmit, formState: { errors } } = useForm();

    // Definir uma função para enviar os dados do formulário para o backend
    const onSubmit = async (data) => {
        try {
            // Obter o token do localstorage
            const token = localStorage.getItem('token');
            // Enviar uma requisição POST para a rota /add com os dados do formulário
            const response = await api.post(`patients/add?token=${token}`, data);
            // Mostrar uma mensagem de sucesso com o resultado da requisição
            alert(response.data.message);
        } catch (error) {
            // Mostrar uma mensagem de erro com o motivo da falha
            alert(error.response.data.error);
        }
    };

    return (
        <div className="ajuste-margin">
            <h1>Cadastrar Paciente</h1>
            {/* Usar o handleSubmit para capturar os dados do formulário e passar para a função onSubmit */}
            <form onSubmit={handleSubmit(onSubmit)}>
                {/* Usar o register para registrar cada campo do formulário e definir as regras de validação */}
                <label htmlFor="name">Nome:</label>
                <input id="name" class = "ajuste-margin" type="text" {...register("name", { required: true })} />
                {/* Mostrar uma mensagem de erro se o campo for inválido */}
                {errors.name && <span>Este campo é obrigatório</span>}

                <label htmlFor="cpf">CPF:</label>
                <input id="cpf" class = "ajuste-margin" type="text" {...register("cpf", { required: true, pattern: /^\d{11}$/ })} />
                {errors.cpf && <span>Este campo é obrigatório e deve ter 11 dígitos</span>}

                <label htmlFor="dateOfBirth">Data de Nascimento:</label>
                <input id="dateOfBirth" class = "ajuste-margin" type="date" {...register("dateOfBirth", { required: true })} />
                {errors.dateOfBirth && <span>Este campo é obrigatório</span>}

                <label htmlFor="sex">Sexo:</label>
                <select id="sex" {...register("sex", { required: true })}>
                    <option value="">Selecione</option>
                    <option value="F">Feminino</option>
                    <option value="M">Masculino</option>
                    <option value="O">Outro</option>
                </select>
                {errors.sex && <span>Este campo é obrigatório</span>}

                {/* Campos opcionais não precisam de regras de validação */}
                <label htmlFor="address">Endereço:</label>
                <input id="address" class = "ajuste-margin" type="text" {...register("address")} />

                <label htmlFor="phone">Telefone:</label>
                <input id="phone" class = "ajuste-margin" type="text" {...register("phone")} />

                <label htmlFor="email">E-mail:</label>
                <input id="email" class = "ajuste-margin" type="email" {...register("email")} />

                <label htmlFor="healthPlan">Plano de Saúde:</label>
                <input id="healthPlan" class = "ajuste-margin" type="text" {...register("healthPlan")} />

                {/* Botão para enviar o formulário */}
                <button type="submit">Cadastrar</button>
            </form>
        </div>
    );
};

export default PacienteCadastro;
