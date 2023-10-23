import React from 'react';
import AsyncSelect from 'react-select/async';

const BuscarPaciente = ({ selectedPaciente, loadPacienteOptions, handlePacienteInputChange, handlePacienteChange, handlePacienteClear }) => {
  return (
    <div className="body-buscar-paciente">
      <div className="block-body">
        <style>
          {`
            .content-container {
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0);
            `}
        </style>
        <div className="block-input">
          <div className="titulo-input">
            Buscar paciente
          </div>
          <div className={`input-container ${selectedPaciente ? 'flex-container' : ''}`}>
            <div>
              <AsyncSelect
                placeholder="Nome, CPF, Cartão SUS"
                cacheOptions
                loadOptions={loadPacienteOptions}
                onInputChange={handlePacienteInputChange}
                onChange={handlePacienteChange}
                value={selectedPaciente}
                isDisabled={selectedPaciente !== null}
                components={{ DropdownIndicator: () => null, indicatorSeparator: () => null }}
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
        </div>
      </div>
    </div>
  );
};

export default BuscarPaciente;
