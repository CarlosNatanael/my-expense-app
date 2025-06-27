import { Alert } from 'react-native';

// IMPORTANTE: Substitua pela URL do seu backend.
// Se estiver testando no celular, use o IP da sua máquina na rede Wi-Fi.
// NUNCA use 'localhost'. Ex: 'http://192.168.1.5:3001'
const API_URL = 'http://SEU_IP_AQUI:3001';

/**
 * Função base para fazer requisições fetch, tratando erros comuns.
 * @param endpoint A rota da API a ser chamada (ex: '/api/auth/login').
 * @param options As opções da requisição (method, headers, body).
 * @returns A resposta em JSON.
 */
const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },    
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      // Se a resposta não for OK, lança um erro com a mensagem do servidor
      throw new Error(data.message || 'Ocorreu um erro no servidor.');
    }

    return data;
  } catch (error: any) {
    // Trata erros de conexão ou erros lançados acima
    console.error(`Erro na chamada da API para ${endpoint}:`, error);
    Alert.alert('Erro', error.message || 'Não foi possível conectar ao servidor. Verifique sua conexão.');
    throw error; // Propaga o erro para quem chamou a função
  }
};

export default apiFetch;