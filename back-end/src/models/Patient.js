const Person = require('./Person');

class Patient extends Person{
    
    constructor(idNumber, name,  cpf, address, phone, email, dateOfBirth, sex, healthPlan) {
      super(name, cpf);
      this.idNumber = idNumber;
      this.address = address;
      this.phone = phone;
      this.email = email;
      this.dateOfBirth = dateOfBirth;
      this.sex = sex;
      this.healthPlan = healthPlan;
    }
  }

  module.exports = Patient;