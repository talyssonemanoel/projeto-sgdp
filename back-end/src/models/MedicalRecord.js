const Patient = require('./Patient');

class MedicalRecord {
    
    constructor(patientId) {
      this._patientId = patientId;
      this._service = [];
    }
  }
  module.exports = MedicalRecord;