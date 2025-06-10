import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, Text, View, Button, FlatList, Alert } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../../App';

import Header from '../../components/Header';
import SummaryCards from '../../components/SummaryCards';
import FilterTabs, { FilterType } from '../../components/FilterTabs';
import TransactionListItem from '../../components/TransactionListItem';
import { Transaction, TransactionType } from '../../types';
import { getTransactions, populateWithMockData, saveTransactions } from '../../data/transactions';
import { generateMonthlyTransactions } from '../../utils/transactionGenerators';
import FloatingActionButton from '../../components/FloatingActionButton';

// Os dados mockados agora serão usados apenas para popular a primeira vez
const INITIAL_MOCKED_TRANSACTIONS: Transaction[] = [
  // ... (Seus dados mockados existentes com datas no formato DD/MM/YYYY)
  { id: '1', description: 'Futebol (Carlos)', amount: 50.00, date: '06/06/2025', category: 'Lazer', type: 'expense', status: 'paid', frequency: 'once' },
  { id: '2', description: 'Pagamento Salário', amount: 5100.00, date: '06/06/2025', category: 'Salário', type: 'income', status: 'paid', frequency: 'once' },
  { id: '3', description: 'Aluguel', amount: 490.00, date: '09/01/2025', category: 'Moradia', type: 'expense', status: 'paid', frequency: 'monthly', startDate: '01/01/2025' },
  { id: '4', description: 'Mãe', amount: 200.00, date: '09/06/2025', category: 'Outros', type: 'expense', status: 'paid', frequency: 'once' },
  { id: '5', description: 'Internet', amount: 109.90, date: '12/01/2025', category: 'Contas', type: 'expense', status: 'paid', frequency: 'monthly', startDate: '01/01/2025' },
  { id: '6', description: 'Plano Chip (Carlos)', amount: 29.99, date: '12/01/2025', category: 'Contas', type: 'expense', status: 'paid', frequency: 'monthly', startDate: '01/01/2025' },
  { id: '7', description: 'Plano Chip (Marcela)', amount: 40.00, date: '13/01/2025', category: 'Contas', type: 'expense', status: 'pending', frequency: 'monthly', startDate: '01/01/2025' },
  { id: '8', description: 'Cartão Picpay (Carlos)', amount: 400.00, date: '15/06/2025', category: 'Outros', type: 'expense', status: 'paid', frequency: 'once' },
  { id: '9', description: 'Condomínio', amount: 160.00, date: '15/01/2025', category: 'Moradia', type: 'expense', status: 'paid', frequency: 'monthly', startDate: '01/01/2025' },
  { id: '10', description: 'Magalu Carne', amount: 251.37, date: '18/03/2025', category: 'Compras', type: 'expense', status: 'paid', frequency: 'installment', totalAmount: 3770.55, totalInstallments: 15, currentInstallment: 1, originalPurchaseDate: '18/03/2025', installmentGroupId: 'magalu-carne-1' },
  { id: '11', description: 'Banco do Brasil (Marcela)', amount: 730.00, date: '26/06/2025', category: 'Outros', type: 'expense', status: 'paid', frequency: 'once' },
];

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

interface HomeScreenProps {}

const HomeScreen: React.FC<HomeScreenProps> = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();

  const [currentDate, setCurrentDate] = useState(new Date(2025, 5, 1)); // Junho de 2025 (mês 5 é junho)
  const [currentFilter, setCurrentFilter] = useState<FilterType>('all');
  const [displayedTransactions, setDisplayedTransactions] = useState<Transaction[]>([]);
  const [allStoredTransactions, setAllStoredTransactions] = useState<Transaction[]>([]);

  const calculateFinancialSummary = useCallback((trans: Transaction[]) => {
    let income = 0;
    let expenses = 0;

    trans.forEach(t => {
      const amount = t.type === 'expense' ? Math.abs(t.amount) : t.amount;
      if (t.type === 'income') {
        income += amount;
      } else {
        expenses += amount;
      }
    });

    const balance = income - expenses;
    return { income, expenses, balance };
  }, []);

  const { income: totalIncome, expenses: totalExpenses, balance } = calculateFinancialSummary(displayedTransactions);

  const loadAndGenerateTransactions = useCallback(async () => {
    const loadedTransactions = await getTransactions();
    
    if (loadedTransactions.length === 0) {
      Alert.alert(
        "Dados de Exemplo",
        "Nenhum dado encontrado. Adicionando dados de exemplo para você começar!",
        [{ text: "OK", onPress: async () => {
          await populateWithMockData(INITIAL_MOCKED_TRANSACTIONS);
          const reloadedTransactions = await getTransactions();
          setAllStoredTransactions(reloadedTransactions);
          const generated = generateMonthlyTransactions(reloadedTransactions, currentDate);
          const filtered = generated.filter(t => currentFilter === 'all' || t.type === currentFilter);
          setDisplayedTransactions(filtered);
        }}]
      );
      return;
    }

    setAllStoredTransactions(loadedTransactions);
    
    const generated = generateMonthlyTransactions(loadedTransactions, currentDate);
    const filtered = generated.filter(t => currentFilter === 'all' || t.type === currentFilter);
    setDisplayedTransactions(filtered);

  }, [currentDate, currentFilter]);

  useFocusEffect(
    useCallback(() => {
      loadAndGenerateTransactions();
    }, [loadAndGenerateTransactions])
  );

  const formatMonth = (date: Date) => {
    return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  };

  const handlePreviousMonth = () => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  };

  const handleNextMonth = () => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  };

  const handleOpenCalendar = () => {
    alert('Abrir seletor de calendário!');
  };

  const handleSelectFilter = (filter: FilterType) => {
    setCurrentFilter(filter);
  };

  const handlePressTransactionItem = (transaction: Transaction) => {
    // Navega para a tela de detalhes, passando o ID da transação
    navigation.navigate('TransactionDetail', { transactionId: transaction.id }); // <--- Novo: Passa o ID
  };

  const handleAddTransaction = () => {
    navigation.navigate('AddTransaction');
  };

  return (
    <View style={styles.container}>
      <Header
        currentMonth={formatMonth(currentDate)}
        balance={balance}
        onPressPreviousMonth={handlePreviousMonth}
        onPressNextMonth={handleNextMonth}
        onPressCalendar={handleOpenCalendar}
      />

      <SummaryCards
        totalIncome={totalIncome}
        totalExpenses={totalExpenses}
      />

      <FilterTabs
        currentFilter={currentFilter}
        onSelectFilter={handleSelectFilter}
      />

      <FlatList
        data={displayedTransactions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TransactionListItem transaction={item} onPressItem={handlePressTransactionItem} />
        )}
        style={styles.transactionsList}
        contentContainerStyle={styles.transactionsListContent}
        ListEmptyComponent={() => (
          <Text style={styles.emptyListText}>Nenhum lançamento para este mês ou filtro.</Text>
        )}
      />

      <FloatingActionButton onPress={handleAddTransaction} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  transactionsList: {
    flex: 1,
  },
  transactionsListContent: {
    paddingTop: 5,
    paddingBottom: 80,
  },
  emptyListText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#888',
  },
});

export default HomeScreen;