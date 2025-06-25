import AsyncStorage from '@react-native-async-storage/async-storage';
import { Transaction } from '../types';
import { Alert } from 'react-native';

const TRANSACTIONS_STORAGE_KEY = '@myExpenseApp:transactions';

// Função para obter todas as transações
export const getTransactionsFromAsyncStorage = async (): Promise<Transaction[]> => {
  try {
    const jsonValue = await AsyncStorage.getItem(TRANSACTIONS_STORAGE_KEY);
    const transactions = jsonValue != null ? JSON.parse(jsonValue) : [];
    // console.log('AsyncStorage: Dados carregados.', transactions.length, 'itens.');
    return transactions;
  } catch (e) {
    console.error('Erro ao carregar transações do AsyncStorage:', e);
    return [];
  }
};

// Função para salvar todas as transações
export const saveTransactionsToAsyncStorage = async (transactions: Transaction[]): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(transactions);
    await AsyncStorage.setItem(TRANSACTIONS_STORAGE_KEY, jsonValue);
    // console.log('AsyncStorage: Dados salvos.', transactions.length, 'itens.');
  } catch (e) {
    console.error('Erro ao salvar transações no AsyncStorage:', e);
  }
};

/**
 * Adiciona uma nova transação ou um array de transações ao AsyncStorage.
 * Isso é usado para criar tanto lançamentos únicos quanto múltiplas parcelas de uma vez.
 */
export const addTransactionToAsyncStorage = async (newData: Transaction | Transaction[]): Promise<void> => {
  const currentTransactions = await getTransactionsFromAsyncStorage();
  const newTransactions = Array.isArray(newData) ? newData : [newData];
  const updatedTransactions = [...currentTransactions, ...newTransactions];
  await saveTransactionsToAsyncStorage(updatedTransactions);
};


// Função para atualizar uma transação existente
export const updateTransactionInAsyncStorage = async (updatedTransaction: Transaction): Promise<void> => {
  const currentTransactions = await getTransactionsFromAsyncStorage();
  const updatedTransactions = currentTransactions.map(t =>
    t.id === updatedTransaction.id ? updatedTransaction : t
  );
  await saveTransactionsToAsyncStorage(updatedTransactions);
};

/**
 * Deleta uma transação. Se for uma parcela, pergunta se o usuário quer
 * deletar apenas a parcela ou a compra inteira (todas as parcelas do grupo).
 */
export const deleteTransactionFromAsyncStorage = async (transactionToDelete: Transaction): Promise<void> => {
    const { id, installmentGroupId } = transactionToDelete;
    const currentTransactions = await getTransactionsFromAsyncStorage();

    if (transactionToDelete.frequency === 'installment' && installmentGroupId) {
        Alert.alert(
            "Apagar Lançamento Parcelado",
            "Você deseja apagar apenas esta parcela ou a compra inteira?",
            [
                {
                    text: "Apenas esta parcela",
                    onPress: async () => {
                        const updated = currentTransactions.filter(t => t.id !== id);
                        await saveTransactionsToAsyncStorage(updated);
                    },
                    style: "default"
                },
                {
                    text: "Compra Inteira",
                    onPress: async () => {
                        const updated = currentTransactions.filter(t => t.installmentGroupId !== installmentGroupId);
                        await saveTransactionsToAsyncStorage(updated);
                    },
                    style: "destructive"
                },
                {
                    text: "Cancelar",
                    style: "cancel"
                }
            ]
        );
    } else {
        // Deleta transação única ou recorrente
        const updatedTransactions = currentTransactions.filter(t => t.id !== id);
        await saveTransactionsToAsyncStorage(updatedTransactions);
    }
};

// Função para marcar uma despesa como paga
export const markAsPaid = async (transactionId: string): Promise<void> => {
  try {
    const transactions = await getTransactionsFromAsyncStorage();
    const updatedTransactions = transactions.map(t => {
      if (t.id === transactionId) {
        return { ...t, status: 'paid' as 'paid' };
      }
      return t;
    });
    // Corrigido para usar a função save padronizada
    await saveTransactionsToAsyncStorage(updatedTransactions);
  } catch (error) {
    console.error('Erro ao marcar como pago:', error);
  }
};

// Função para popular com dados mockados (para testes)
export const populateWithMockDataToAsyncStorage = async (mockData: Transaction[]): Promise<void> => {
  await saveTransactionsToAsyncStorage(mockData);
  console.log('Dados mockados salvos no AsyncStorage.');
};
