import React, { useState } from 'react';
import moment from 'moment';

const ProntuarioLinhaDoTempo = ({ atendimentos, currentPage, setCurrentPage }) => {
  const itemsPerPage = 5; // Defina quantos itens você quer por página

  // Calcule o número total de páginas
  const totalPages = Math.ceil(atendimentos.length / itemsPerPage);

  // Obtenha apenas os atendimentos para a página atual
  const displayedAtendimentos = atendimentos.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);

  return (
    <div>
        {displayedAtendimentos.map((atendimento, index) => {
          // Formate a data do atendimento
          const date = moment(atendimento.date);
          const year = date.format('YYYY');
          const day = date.format('DD');
          const month = date.format('MMM').toUpperCase();
          const isLastItemOnPage = ((index + 1) % itemsPerPage === 0) || (currentPage === totalPages - 1 && (index + 1) % itemsPerPage === atendimentos.length % itemsPerPage);

          return (
            <React.Fragment key={index}>
              <div class="container text-center w-100" style={{ margin: '0' }}>
              <div class="row">
                <div className="card text-bg-primary mb-3 col date-card" style={{ minWidth: '48px', height: 'auto'}}>
                  <div className="card-header text-center ano-text date-card">{year}</div>
                  <div className="card-body date-card body-do-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', lineHeight: '1' }}>
                    <h5 className=" text-center dia-text date-card">{day}</h5>
                    <p className="card-text text-center mes-text">{month}</p>
                  </div>
                </div>
                <div class="col lines lines1" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: '50px' }}>
                  {index === 0 ? <div style={{ flexGrow: 0.4 }}></div> : <div style={{ flexGrow: 0.4, width: '0px' }}></div>}
                  <div className="d-flex align-items-center" style={{height: '16px', backgroundColor: 'transparent', width: '8px'}}>
                    <div style={{height: '2px', backgroundColor: 'rgba(0, 0, 0, 0.176)', width: '100%'}}></div>
                  </div>
                  {index === atendimentos.length - 1 ? <div style={{ flexGrow: 1 }}></div> : <div style={{ flexGrow: 1, width: '0px', backgroundColor: '#005eff' }}></div>}
                </div>
                <div class="col lines" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: '50px' }}>
                  {index === 0 ? <div style={{ flexGrow: 0.4 }}></div> : <div style={{ flexGrow: 0.4, width: '2px', backgroundColor: 'rgba(0, 0, 0, 0.176)' }}></div>}
                  <i className="far fa-circle" style={{ color: '#005eff' }}></i>
                  {isLastItemOnPage ? <div style={{ flexGrow: 1 }}></div> : <div style={{ flexGrow: 1, width: '2px', backgroundColor: 'rgba(0, 0, 0, 0.176)' }}></div>}
                </div>

                
                  <div class="col">
                    <div class="card mb-3"style={{ textAlign: 'left' }}>
                      <div class="card-header">
                          Por: {atendimento.specialistName}
                        </div>
                        <div class="card-text text-center">
                          <blockquote class="mb-0">
                            <p>
                              <div>Descrição: {atendimento._id}</div>
                            </p>
                            <footer class="blockquote-footer">Someone famous in <cite title="Source Title">Source Title</cite></footer>
                          </blockquote>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>

                  </div>
                </div>
            </React.Fragment>
          );
        })}
        <div className='d-flex justify-content-end'>
          <button onClick={() => setCurrentPage(oldPage => Math.max(oldPage - 1, 0))}>
            Página anterior
          </button>
          <button onClick={() => setCurrentPage(oldPage => Math.min(oldPage + 1, totalPages - 1))}>
            Próxima página
          </button>
        </div>
    </div>
  );
};

export default ProntuarioLinhaDoTempo;
