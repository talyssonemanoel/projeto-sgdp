// src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001', // Substitua pela URL do seu backend
});

export default api;
