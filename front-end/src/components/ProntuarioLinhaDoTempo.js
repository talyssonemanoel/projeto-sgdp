import React from 'react';

const ProntuarioLinhaDoTempo = ({ atendimentos }) => {
  return (
    <div>
        {atendimentos.map((atendimento, index) => (
          <React.Fragment key={index}>
            <div class="container text-center" style={{ margin: '0', width: '100%' }}>
            <div class="row" style={{width: '100%'}}>
              <div className="card text-bg-primary mb-3 col date-card " style={{ minWidth: '48px', height: 'auto'}}>
                <div className="card-header text-center ano-text date-card">2023</div>
                <div className="card-body date-card body-do-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', lineHeight: '1' }}>
                  <h5 className=" text-center dia-text date-card">20</h5>
                  <p className="card-text text-center mes-text">OUT</p>
                </div>
              </div>
              <div class="col" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: '50px' }}>
                <i className="far fa-circle" style={{ color: '#005eff' }}></i>
                {index !== atendimentos.length - 1 && <div style={{ flexGrow: 1, width: '2px', backgroundColor: '#005eff' }}></div>}
              </div>
              <div class="col col-text">
              <div class="card mb-3"style={{ textAlign: 'left' }}>
                <div class="card-header">
                    Quote
                  </div>
                  <div class="card-text text-center">
                    <blockquote class="mb-0">
                      <p>
                        <div>Data: {atendimento.data}</div>
                        <div>Descrição: {atendimento.descricao}</div>
                      </p>
                      <footer class="blockquote-footer">Someone famous in <cite title="Source Title">Source Title</cite></footer>
                    </blockquote>
                  </div>
                </div>
              </div>
              </div>
            </div>
          </React.Fragment>
        ))}
    </div>
  );
};

export default ProntuarioLinhaDoTempo;
