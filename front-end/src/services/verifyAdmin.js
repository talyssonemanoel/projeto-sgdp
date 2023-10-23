
import api from './api';

// Função para verificar se o usuário é administrador
const checkAdminPermission = async (token) => {
    try {
      const response = await api.get(`/verify/admin?token=${token}`);
      if (response.status === 200) {
        return true; // Permissão concedida
      } else {
        return false; // Outro código de resposta
      }
    } catch (error) {
      console.error(error);
      return false;
    }
  };

export default checkAdminPermission;