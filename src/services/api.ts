import { Alert } from 'react-native';

// IMPORTANTE: Substitua pela URL do seu backend.
// Use o IP da sua máquina na rede Wi-Fi e a porta que o Flask está usando (5000).
const API_URL = 'http://192.168.0.158:5000'; // <-- SUBSTITUA PELO SEU IP

/**
 * Função base para fazer requisições fetch, tratando erros comuns.
 * @param endpoint A rota da API a ser chamada (ex: '/api/login').
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
      throw new Error(data.mensagem || 'Ocorreu um erro no servidor.');
    }

    return data;
  } catch (error: any) {
    // Trata erros de conexão ou erros lançados acima
    console.error(`Erro na chamada da API para ${endpoint}:`, error);
    Alert.alert('Erro', error.message || 'Não foi possível conectar ao servidor. Verifique sua conexão.');
    throw error; // Propaga o erro para quem chamou a função
  }
};

// Defina o tipo Transaction conforme a estrutura dos dados retornados pelo backend
export type Transaction = {
  id: number;
  descricao: string;
  valor: number;
  data: string;
  // Adicione outros campos conforme necessário
};

export const getTransactionsFromServer = async (token: string): Promise<Transaction[]> => {
  // O endpoint é '/api/gastos', como definido no seu backend Flask
  const transactions = await apiFetch('/api/gastos', {
    method: 'GET',
    headers: {
      // Envia o token para o backend para autenticação
      'Authorization': `Bearer ${token}`
    }
  });
  return transactions;
};

export default apiFetch;