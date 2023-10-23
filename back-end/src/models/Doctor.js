const Person = require('./Person');

class Doctor extends Person {
    
    constructor(idNumber, name, cpf, address, phone, email, dateOfBirth, sex, healthPlan,
      crmNumber, specialtyId, startTime, endTime ) {
      super (name, cpf)
      this.idNumber = idNumber
      this.address = address
      this.phone = phone
      this.email = email
      this.dateOfBirth = dateOfBirth
      this.sex = sex
      this.healthPlan = healthPlan
      this.crmNumber = crmNumber
      this.specialtyId = specialtyId
      this.startTime = startTime
      this.endTime = endTime
  }
}

module.exports = Doctor;