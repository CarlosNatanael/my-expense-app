import AsyncStorage from '@react-native-async-storage/async-storage';
import { Transaction } from '../types';


const TRANSACTIONS_STORAGE_KEY = '@myExpenseApp:transactions';

// Função para carregar todas as transações salvas
export const getTransactions = async (): Promise<Transaction[]> => {
  try {
    const jsonValue = await AsyncStorage.getItem(TRANSACTIONS_STORAGE_KEY);
    const transactions = jsonValue != null ? JSON.parse(jsonValue) : [];
    console.log('getTransactions: Dados carregados do AsyncStorage:', transactions); // Adicione este log
    return transactions;
  } catch (e) {
    console.error('Erro ao carregar transações do AsyncStorage:', e);
    return [];
  }
};

export const saveTransactions = async (transactions: Transaction[]): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(transactions);
    await AsyncStorage.setItem(TRANSACTIONS_STORAGE_KEY, jsonValue);
    console.log('saveTransactions: Dados salvos no AsyncStorage:', transactions); // Adicione este log
  } catch (e) {
    console.error('Erro ao salvar transações no AsyncStorage:', e);
  }
};

// Função para adicionar uma nova transação
export const addTransaction = async (newTransaction: Transaction): Promise<Transaction[]> => {
  const currentTransactions = await getTransactions();
  const updatedTransactions = [...currentTransactions, newTransaction];
  await saveTransactions(updatedTransactions);
  console.log('addTransaction: Transação adicionada. Todas as transações:', updatedTransactions); // Adicione este log
  return updatedTransactions;
};

// Função para atualizar uma transação existente
export const updateTransaction = async (updatedTransaction: Transaction): Promise<Transaction[]> => {
  const currentTransactions = await getTransactions();
  const updatedTransactions = currentTransactions.map(t =>
    t.id === updatedTransaction.id ? updatedTransaction : t
  );
  await saveTransactions(updatedTransactions);
  console.log('updateTransaction: Transação atualizada. Todas as transações:', updatedTransactions); // Adicione este log
  return updatedTransactions;
};

// Função para deletar uma transação
export const deleteTransaction = async (transactionId: string): Promise<Transaction[]> => {
  const currentTransactions = await getTransactions();
  const updatedTransactions = currentTransactions.filter(t => t.id !== transactionId);
  await saveTransactions(updatedTransactions);
  return updatedTransactions;
};

// **Função para popular com dados mockados (para testes iniciais)**
export const populateWithMockData = async (mockData: Transaction[]): Promise<void> => {
  await saveTransactions(mockData);
  console.log('Dados mockados salvos no AsyncStorage.');
};