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
import { generateMonthlyTransactions } from '../../utils/transactionGenerators'; // Importe a nova função!
import FloatingActionButton from '../../components/FloatingActionButton';

// Os dados mockados agora serão usados apenas para popular a primeira vez
const INITIAL_MOCKED_TRANSACTIONS: Transaction[] = [
  { id: '1', description: 'Futebol (Carlos)', amount: 50.00, date: '2025-06-06', category: 'Lazer', type: 'expense', status: 'paid', frequency: 'once' },
  { id: '2', description: 'Pagamento Salário', amount: 5100.00, date: '2025-06-06', category: 'Salário', type: 'income', status: 'paid', frequency: 'once' },
  { id: '3', description: 'Aluguel', amount: 490.00, date: '2025-01-09', category: 'Moradia', type: 'expense', status: 'paid', frequency: 'monthly', startDate: '2025-01-01' },
  { id: '4', description: 'Mãe', amount: 200.00, date: '2025-06-09', category: 'Outros', type: 'expense', status: 'paid', frequency: 'once' },
  { id: '5', description: 'Internet', amount: 109.90, date: '2025-01-12', category: 'Contas', type: 'expense', status: 'paid', frequency: 'monthly', startDate: '2025-01-01' },
  { id: '6', description: 'Plano Chip (Carlos)', amount: 29.99, date: '2025-01-12', category: 'Contas', type: 'expense', status: 'paid', frequency: 'monthly', startDate: '2025-01-01' },
  { id: '7', description: 'Plano Chip (Marcela)', amount: 40.00, date: '2025-01-13', category: 'Contas', type: 'expense', status: 'pending', frequency: 'monthly', startDate: '2025-01-01' },
  { id: '8', description: 'Cartão Picpay (Carlos)', amount: 400.00, date: '2025-06-15', category: 'Outros', type: 'expense', status: 'paid', frequency: 'once' },
  { id: '9', description: 'Condomínio', amount: 160.00, date: '2025-01-15', category: 'Moradia', type: 'expense', status: 'paid', frequency: 'monthly', startDate: '2025-01-01' },
  // Importante: A data original da compra e o formato YYYY-MM-DD
  { id: '10', description: 'Magalu Carne', amount: 251.37, date: '2025-03-18', category: 'Compras', type: 'expense', status: 'paid', frequency: 'installment', totalAmount: 3770.55, totalInstallments: 15, currentInstallment: 1, originalPurchaseDate: '2025-03-18', installmentGroupId: 'magalu-carne-1' },
  { id: '11', description: 'Banco do Brasil (Marcela)', amount: 730.00, date: '2025-06-26', category: 'Outros', type: 'expense', status: 'paid', frequency: 'once' },
];

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

interface HomeScreenProps {}

const HomeScreen: React.FC<HomeScreenProps> = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();

  const [currentDate, setCurrentDate] = useState(new Date(2025, 5, 1)); // Junho de 2025 (mês 5 é junho)
  const [currentFilter, setCurrentFilter] = useState<FilterType>('all');
  const [displayedTransactions, setDisplayedTransactions] = useState<Transaction[]>([]); // Transações geradas e filtradas
  const [allStoredTransactions, setAllStoredTransactions] = useState<Transaction[]>([]); // Todas as transações salvas (mestres)

  // ATENÇÃO: As datas nos MOCKED_TRANSACTIONS foram ajustadas para YYYY-MM-DD
  // e startDate/originalPurchaseDate para datas de início real, não do mês atual de exibição.

  // Função para calcular o balanço, receitas e despesas
  const calculateFinancialSummary = useCallback((trans: Transaction[]) => {
    let income = 0;
    let expenses = 0;

    trans.forEach(t => {
      // Ajusta o valor para ser sempre positivo na soma, se for despesa
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

  // Função para carregar TUDO e então gerar as transações para o mês atual
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
          // Agora, geramos as transações para o mês a partir de reloadedTransactions
          const generated = generateMonthlyTransactions(reloadedTransactions, currentDate);
          const filtered = generated.filter(t => currentFilter === 'all' || t.type === currentFilter);
          setDisplayedTransactions(filtered);
        }}]
      );
      return;
    }

    setAllStoredTransactions(loadedTransactions); // Armazenar todas as transações mestres
    
    // Gerar as transações para o mês atual a partir de todas as transações mestres
    const generated = generateMonthlyTransactions(loadedTransactions, currentDate);
    const filtered = generated.filter(t => currentFilter === 'all' || t.type === currentFilter);
    setDisplayedTransactions(filtered);

  }, [currentDate, currentFilter]); // Dependências do useCallback

  // Use useFocusEffect para recarregar sempre que a tela voltar ao foco
  useFocusEffect(
    useCallback(() => {
      loadAndGenerateTransactions();
    }, [loadAndGenerateTransactions]) // Passa a função para o useFocusEffect
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
    // A lógica de geração e filtragem será re-executada via useFocusEffect/loadAndGenerateTransactions
    // quando currentFilter mudar.
  };

  const handlePressTransactionItem = (transaction: Transaction) => {
    // TODO: Implementar navegação para tela de detalhes da transação
    console.log('Detalhes da transação:', transaction);
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
        data={displayedTransactions} // Agora usa displayedTransactions
        keyExtractor={(item) => item.id} // ID único para a instância
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