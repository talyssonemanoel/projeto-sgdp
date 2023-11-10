import React from "react";
import classnames from "classnames";

const PublicAgendamento = () => {
  const containerClassName = classnames("public-agendamento-container", "unique-container-class");
  const formClassName = classnames("public-agendamento-form", "unique-form-class");
  const labelClassName = classnames("unique-label-class");
  const inputClassName = classnames("unique-input-class");
  const buttonClassName = classnames("unique-button-class");

  return (
    <div className={containerClassName}>
      <h1>Agendamento Público</h1>
      <p>Agende seu atendimento aqui.</p>
      <form className={formClassName}>
        <label htmlFor="nome" className={labelClassName}>Nome:</label>
        <input type="text" id="nome" name="nome" className={inputClassName} />

        <label htmlFor="data" className={labelClassName}>Data:</label>
        <input type="date" id="data" name="data" className={inputClassName} />

        <button type="submit" className={buttonClassName}>Agendar</button>
      </form>
    </div>
  );
};

export default PublicAgendamento;
