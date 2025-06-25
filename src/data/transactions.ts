// src/data/transactions.ts

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Transaction } from '../types';
import { Alert } from 'react-native'; // Importar Alert (se precisar para Alertas em funções)

const TRANSACTIONS_STORAGE_KEY = '@myExpenseApp:transactions';

// Função para carregar todas as transações salvas do AsyncStorage
export const getTransactionsFromAsyncStorage = async (): Promise<Transaction[]> => {
  try {
    const jsonValue = await AsyncStorage.getItem(TRANSACTIONS_STORAGE_KEY);
    const transactions = jsonValue != null ? JSON.parse(jsonValue) : [];
    console.log('AsyncStorage: Dados carregados do AsyncStorage:', transactions);
    return transactions;
  } catch (e) {
    console.error('Erro ao carregar transações do AsyncStorage:', e);
    return [];
  }
};

// Função para salvar uma lista de transações no AsyncStorage
export const saveTransactionsToAsyncStorage = async (transactions: Transaction[]): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(transactions);
    await AsyncStorage.setItem(TRANSACTIONS_STORAGE_KEY, jsonValue);
    console.log('AsyncStorage: Dados salvos no AsyncStorage:', transactions);
  } catch (e) {
    console.error('Erro ao salvar transações no AsyncStorage:', e);
  }
};

// Função para adicionar uma nova transação ao AsyncStorage
export const addTransactionToAsyncStorage = async (newTransaction: Transaction): Promise<Transaction[]> => {
  const currentTransactions = await getTransactionsFromAsyncStorage();
  // No AsyncStorage, userId não é necessário no objeto Transaction para o save
  const updatedTransactions = [...currentTransactions, newTransaction];
  await saveTransactionsToAsyncStorage(updatedTransactions);
  return updatedTransactions;
};

// Função para atualizar uma transação existente no AsyncStorage
export const updateTransactionInAsyncStorage = async (updatedTransaction: Transaction): Promise<Transaction[]> => {
  const currentTransactions = await getTransactionsFromAsyncStorage();
  const updatedTransactions = currentTransactions.map(t =>
    t.id === updatedTransaction.id ? updatedTransaction : t
  );
  await saveTransactionsToAsyncStorage(updatedTransactions);
  return updatedTransactions;
};

// Função para deletar uma transação do AsyncStorage
export const deleteTransactionFromAsyncStorage = async (transactionId: string): Promise<void> => {
  const currentTransactions = await getTransactionsFromAsyncStorage();
  const updatedTransactions = currentTransactions.filter(t => t.id !== transactionId);
  await saveTransactionsToAsyncStorage(updatedTransactions);
};


// Função para popular com dados mockados (para testes iniciais) no AsyncStorage
export const populateWithMockDataToAsyncStorage = async (mockData: Transaction[]): Promise<void> => {
  await saveTransactionsToAsyncStorage(mockData);
  console.log('Dados mockados salvos no AsyncStorage.');
};