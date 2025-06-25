import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../../App';
import { Transaction } from '../../types';
import { getTransactionsFromAsyncStorage, deleteTransactionFromAsyncStorage, updateTransactionInAsyncStorage } from '../../data/transactions';
import Toast from 'react-native-toast-message';
import { formatAmountWithThousandsSeparator } from '../../utils/currencyFormatter';

// Tipando a rota
type TransactionDetailScreenRouteProp = RouteProp<RootStackParamList, 'TransactionDetail'>;
type TransactionDetailScreenNavigationProp = StackNavigationProp<RootStackParamList, 'TransactionDetail'>;

const TransactionDetailScreen: React.FC = () => {
  const route = useRoute<TransactionDetailScreenRouteProp>();
  const navigation = useNavigation<TransactionDetailScreenNavigationProp>();
  const { transactionId } = route.params;

  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);

  const loadTransactionDetails = useCallback(async () => {
    setLoading(true);
    try {
      // Busca transações do AsyncStorage
      const allTransactions = await getTransactionsFromAsyncStorage();
      let foundTransaction: Transaction | undefined;
      // A busca é pelo ID da transação
      foundTransaction = allTransactions.find(t => t.id === transactionId);
      setTransaction(foundTransaction || null);
    } catch (error) {
      console.error('Erro ao carregar detalhes da transação:', error);
      Alert.alert('Erro', 'Não foi possível carregar os detalhes do lançamento.');
    } finally {
      setLoading(false);
    }
  }, [transactionId]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadTransactionDetails();
    });
    return unsubscribe;
  }, [navigation, loadTransactionDetails]);

  const handleDeleteTransaction = async () => {
    if (!transaction) return;
    Alert.alert(
      'Confirmar Exclusão',
      `Tem certeza que deseja excluir "${transaction.description}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          onPress: async () => {
            try {
              await deleteTransactionFromAsyncStorage(transaction.id);
              Toast.show({ type: 'success', text1: 'Sucesso!', text2: 'Lançamento excluído com êxito.', });
              navigation.goBack();
            } catch (error) {
              console.error('Erro ao excluir transação:', error);
              Toast.show({ type: 'error', text1: 'Erro!', text2: 'Não foi possível excluir o lançamento.', });
            }
          },
        },
      ]
    );
  };

  const handleEditTransaction = () => {
    if (transaction) {
      navigation.navigate('AddTransaction', { transactionId: transaction.id });
    }
  };

  const handleMarkAsPaid = async () => {
    if (!transaction) return;

    Alert.alert(
      'Marcar como Pago',
      `Marcar "${transaction.description}" como pago?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Marcar',
          onPress: async () => {
            try {
              const updatedTrans = { ...transaction, status: 'paid' as Transaction['status'] };
              await updateTransactionInAsyncStorage(updatedTrans);
              Toast.show({ type: 'success', text1: 'Sucesso!', text2: 'Lançamento marcado como pago.', });
              navigation.goBack();
            } catch (error) {
              console.error('Erro ao marcar como pago:', error);
              Toast.show({ type: 'error', text1: 'Erro!', text2: 'Não foi possível marcar como pago.', });
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Carregando detalhes...</Text>
      </View>
    );
  }

  if (!transaction) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Lançamento não encontrado.</Text>
      </View>
    );
  }

  const formattedAmount = `${transaction.type === 'expense' ? '-' : '+'} R$ ${formatAmountWithThousandsSeparator(transaction.amount)}`;
  const amountColor = transaction.type === 'expense' ? '#E74C3C' : '#2ECC71';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.header}>Detalhes do Lançamento</Text>
      <View style={styles.detailCard}>
        <Text style={styles.label}>Descrição:</Text>
        <Text style={styles.value}>{transaction.description}</Text>
      </View>
      <View style={styles.detailCard}>
        <Text style={styles.label}>Valor:</Text>
        <Text style={[styles.value, { color: amountColor }]}>{formattedAmount}</Text>
      </View>
      <View style={styles.detailCard}>
        <Text style={styles.label}>Categoria:</Text>
        <Text style={styles.value}>{transaction.category}</Text>
      </View>
      <View style={styles.detailCard}>
        <Text style={styles.label}>Tipo:</Text>
        <Text style={styles.value}>{transaction.type === 'expense' ? 'Despesa' : 'Receita'}</Text>
      </View>
      <View style={styles.detailCard}>
        <Text style={styles.label}>Data:</Text>
        <Text style={styles.value}>{new Date(transaction.date).toLocaleDateString('pt-BR')}</Text>
      </View>
      <View style={styles.detailCard}>
        <Text style={styles.label}>Status:</Text>
        <Text style={styles.value}>{transaction.status === 'paid' ? 'Pago' : 'Pendente'}</Text>
      </View>
      {/* Detalhes de Frequência */}
      {transaction.frequency === 'monthly' && (
        <>
          <View style={styles.detailCard}>
            <Text style={styles.label}>Frequência:</Text>
            <Text style={styles.value}>Recorrente (Mensal)</Text>
          </View>
          <View style={styles.detailCard}>
            <Text style={styles.label}>Início da Recorrência:</Text>
            <Text style={styles.value}>{transaction.startDate ? new Date(transaction.startDate).toLocaleDateString('pt-BR') : 'N/A'}</Text>
          </View>
          {transaction.endDate && (
            <View style={styles.detailCard}>
              <Text style={styles.label}>Fim da Recorrência:</Text>
              <Text style={styles.value}>{new Date(transaction.endDate).toLocaleDateString('pt-BR')}</Text>
            </View>
          )}
        </>
      )}

      {transaction.frequency === 'installment' && (
        <>
          <View style={styles.detailCard}>
            <Text style={styles.label}>Frequência:</Text>
            <Text style={styles.value}>Parcelada</Text>
          </View>
          <View style={styles.detailCard}>
            <Text style={styles.label}>Valor Total da Compra:</Text>
            <Text style={styles.value}>R$ {formatAmountWithThousandsSeparator(transaction.totalAmount || 0) || 'N/A'}</Text>
          </View>
          <View style={styles.detailCard}>
            <Text style={styles.label}>Parcela Atual:</Text>
            <Text style={styles.value}>{transaction.currentInstallment || 'N/A'} de {transaction.totalInstallments || 'N/A'}</Text>
          </View>
          <View style={styles.detailCard}>
            <Text style={styles.label}>Data da Compra Original:</Text>
            <Text style={styles.value}>{transaction.originalPurchaseDate ? new Date(transaction.originalPurchaseDate).toLocaleDateString('pt-BR') : 'N/A'}</Text>
          </View>
        </>
      )}
      {/* Botões de Ação */}
      <View style={styles.actionButtonsContainer}>
        {transaction.type === 'expense' && transaction.status === 'pending' && (
          <TouchableOpacity style={[styles.actionButton, styles.markAsPaidButton]} onPress={handleMarkAsPaid}>
            <Text style={styles.actionButtonText}>Marcar como Pago</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={[styles.actionButton, styles.editButton]} onPress={handleEditTransaction}>
          <Text style={styles.actionButtonText}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={handleDeleteTransaction}>
          <Text style={styles.actionButtonText}>Excluir</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f8', },
  contentContainer: { padding: 20, paddingBottom: 40, },
  header: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 25, textAlign: 'center', },
  detailCard: {
    backgroundColor: '#fff', borderRadius: 10, padding: 15, marginBottom: 10,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 2,
  },
  label: { fontSize: 16, color: '#666', fontWeight: '500', },
  value: { fontSize: 16, color: '#333', fontWeight: '600', flexShrink: 1, textAlign: 'right', marginLeft: 10, },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8f8f8', },
  loadingText: { marginTop: 10, fontSize: 16, color: '#888', },
  errorText: { fontSize: 16, color: '#E74C3C', },
  actionButtonsContainer: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 30, flexWrap: 'wrap' },
  actionButton: {
    paddingVertical: 12, paddingHorizontal: 15, borderRadius: 10, elevation: 3,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 3,
    margin: 5,
  },
  editButton: { backgroundColor: '#007AFF', },
  deleteButton: { backgroundColor: '#E74C3C', },
  markAsPaidButton: { backgroundColor: '#2ECC71', },
  actionButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold', },
});

export default TransactionDetailScreen;