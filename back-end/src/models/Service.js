class Service {
    constructor(doctor, patient) {
        this.doctorIdNumber = doctor;
        this.patientIdNumber = patient;
        this.symptoms = [];
        this.orientations = [];
    }

    addSymptoms(symptom) {
        this.symptoms.push(symptom);
    }

    addOrientations(orientation) {
        this.orientations.push(orientation);
    }
}

module.exports = Service;