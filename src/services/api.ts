import { Alert } from 'react-native';
import { Transaction } from '../types'; // Importe o tipo Transaction

// IMPORTANTE: Substitua pela URL do seu backend.
const API_URL = 'http://192.168.0.111:5000'; // USE O SEU IP LOCAL

/**
 * Função base para fazer requisições fetch.
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
      throw new Error(data.mensagem || 'Ocorreu um erro no servidor.');
    }

    return data;
  } catch (error: any) {
    console.error(`Erro na chamada da API para ${endpoint}:`, error);
    Alert.alert('Erro', error.message || 'Não foi possível conectar ao servidor.');
    throw error;
  }
};

// --- NOVAS FUNÇÕES ---

/**
 * Busca as transações do usuário autenticado no servidor.
 * @param token O token JWT do usuário.
 * @returns Uma promessa que resolve para um array de transações.
 */
export const getTransactionsFromServer = async (token: string): Promise<Transaction[]> => {
  const transactions = await apiFetch('/api/gastos', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}` // Envia o token para autenticação
    }
  });
  return transactions;
};

/**
 * Adiciona uma nova transação no servidor para o usuário autenticado.
 * @param transactionData Os dados da transação a ser criada.
 * @param token O token JWT do usuário.
 */
export const addTransactionToServer = async (transactionData: Partial<Transaction>, token: string): Promise<any> => {
  
    console.log('--- TOKEN SENDO ENVIADO PARA /api/gastos ---');
    console.log(token);
    console.log('-------------------------------------------');

    const response = await apiFetch('/api/gastos', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(transactionData)
    });
    return response;
};

export default apiFetch;