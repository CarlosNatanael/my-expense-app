import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRoute, useNavigation, RouteProp, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../../App';
import { Transaction } from '../../types';
import { getTransactionsFromAsyncStorage, markAsPaid, deleteTransactionFromAsyncStorage } from '../../data/transactions';
import { formatAmountWithThousandsSeparator as formatCurrency } from '../../utils/currencyFormatter';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

// Tipagem da rota e da navegação
type DetailScreenRouteProp = RouteProp<RootStackParamList, 'TransactionDetail'>;
type DetailScreenNavigationProp = StackNavigationProp<RootStackParamList, 'TransactionDetail'>;

// Componente para exibir uma linha de detalhe
const DetailRow: React.FC<{ icon: any; label: string; value: string; color?: string }> = ({ icon, label, value, color = '#333' }) => (
  <View style={styles.detailRow}>
    <MaterialCommunityIcons name={icon} size={22} color="#555" style={styles.detailIcon} />
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={[styles.detailValue, { color }]}>{value}</Text>
  </View>
);


const TransactionDetailScreen: React.FC = () => {
  const route = useRoute<DetailScreenRouteProp>();
  const navigation = useNavigation<DetailScreenNavigationProp>();
  const { transactionId } = route.params;

  const [transaction, setTransaction] = useState<Transaction | null>(null);

  // Função para carregar os dados da transação
  const loadTransaction = useCallback(async () => {
    const transactions = await getTransactionsFromAsyncStorage();
    const foundTransaction = transactions.find(t => t.id === transactionId);
    setTransaction(foundTransaction || null);
  }, [transactionId]);

  // useFocusEffect para recarregar os dados sempre que a tela for focada
  useFocusEffect(
    useCallback(() => {
      loadTransaction();
    }, [loadTransaction])
  );

  if (!transaction) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Carregando detalhes...</Text>
      </View>
    );
  }
  
  const handleMarkAsPaid = async () => {
    if (transaction.status === 'paid') {
      Toast.show({type: 'info', text1: 'Esta despesa já está paga.'})
      return;
    }
    await markAsPaid(transaction.id);
    Toast.show({type: 'success', text1: 'Sucesso!', text2: 'Despesa marcada como paga.'});
    // Força a atualização dos dados na tela
    loadTransaction();
  };
  
  const handleEdit = () => {
    navigation.navigate('AddTransaction', { transactionId: transaction.id });
  };

  const handleDelete = () => {
    Alert.alert(
        "Confirmar Exclusão",
        "Você tem certeza que deseja apagar este lançamento?",
        [
            { text: "Cancelar", style: "cancel" },
            { 
                text: "Confirmar", 
                style: "destructive", 
                onPress: async () => {
                    await deleteTransactionFromAsyncStorage(transaction);
                    Toast.show({type: 'success', text1: 'Lançamento apagado.'});
                    navigation.goBack();
                }
            }
        ]
    );
  };

  // Formata a data para um padrão legível
  const formattedDate = new Date(transaction.date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });

  const isExpense = transaction.type === 'expense';

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.description}>{transaction.description}</Text>
        <Text style={[styles.amount, { color: isExpense ? '#d9534f' : '#5cb85c' }]}>
            {isExpense ? '- ' : '+ '}
            {formatCurrency(transaction.amount)}
        </Text>
      </View>

      <View style={styles.detailsCard}>
        <DetailRow 
            icon="calendar" 
            label="Data" 
            value={formattedDate}
        />
        <DetailRow 
            icon="shape-outline" 
            label="Categoria" 
            value={transaction.category} 
        />
        <DetailRow 
            icon={isExpense ? "arrow-down-bold-circle" : "arrow-up-bold-circle"}
            label="Tipo" 
            value={isExpense ? 'Despesa' : 'Receita'}
            color={isExpense ? '#d9534f' : '#5cb85c'}
        />
        {isExpense && (
            <DetailRow
                icon={transaction.status === 'paid' ? 'check-circle' : 'clock-alert-outline'}
                label="Status"
                value={transaction.status === 'paid' ? 'Pago' : 'Pendente'}
                color={transaction.status === 'paid' ? '#5cb85c' : '#f0ad4e'}
            />
        )}
      </View>

      {/* Detalhes de Parcelamento (se aplicável) */}
      {transaction.frequency === 'installment' && (
        <View style={styles.detailsCard}>
             <Text style={styles.sectionTitle}>Detalhes da Compra Parcelada</Text>
             <DetailRow 
                icon="view-carousel-outline" 
                label="Parcela" 
                value={`${transaction.currentInstallment} de ${transaction.totalInstallments}`}
            />
            <DetailRow 
                icon="cash-multiple" 
                label="Valor Total da Compra" 
                value={formatCurrency(transaction.totalAmount || 0)}
            />
        </View>
      )}

      {/* Botões de Ação */}
      <View style={styles.actionsContainer}>
        {isExpense && transaction.status === 'pending' && (
            <TouchableOpacity style={[styles.button, styles.paidButton]} onPress={handleMarkAsPaid}>
                <MaterialCommunityIcons name="check" size={20} color="#fff" />
                <Text style={styles.buttonText}>Marcar como Pago</Text>
            </TouchableOpacity>
        )}
        <TouchableOpacity style={[styles.button, styles.editButton]} onPress={handleEdit}>
            <MaterialCommunityIcons name="pencil-outline" size={20} color="#fff" />
            <Text style={styles.buttonText}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.deleteButton]} onPress={handleDelete}>
            <MaterialCommunityIcons name="trash-can-outline" size={20} color="#fff" />
            <Text style={styles.buttonText}>Excluir</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f8f8',
    },
    loadingText: {
        textAlign: 'center',
        marginTop: 50,
        fontSize: 18,
        color: '#888',
    },
    header: {
        backgroundColor: '#fff',
        padding: 20,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    description: {
        fontSize: 22,
        fontWeight: '500',
        color: '#333',
        textAlign: 'center',
    },
    amount: {
        fontSize: 36,
        fontWeight: 'bold',
        marginTop: 10,
    },
    detailsCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        margin: 15,
        padding: 15,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingBottom: 10,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
    },
    detailIcon: {
        marginRight: 15,
    },
    detailLabel: {
        fontSize: 16,
        color: '#555',
        flex: 1,
    },
    detailValue: {
        fontSize: 16,
        fontWeight: '600',
    },
    actionsContainer: {
        paddingHorizontal: 15,
        marginTop: 10,
        marginBottom: 30,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 10,
        marginBottom: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 10,
    },
    paidButton: {
        backgroundColor: '#28A745',
    },
    editButton: {
        backgroundColor: '#007AFF',
    },
    deleteButton: {
        backgroundColor: '#d9534f',
    },
});

export default TransactionDetailScreen;
