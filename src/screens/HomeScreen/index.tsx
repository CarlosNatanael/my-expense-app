import React, { useState, useCallback, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, ActivityIndicator } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../../App';
import { TouchableOpacity } from 'react-native';

import Header from '../../components/Header';
import SummaryCards from '../../components/SummaryCards';
import FilterTabs, { FilterType } from '../../components/FilterTabs';
import TransactionListItem from '../../components/TransactionListItem';
import { Transaction } from '../../types';
import FloatingActionButton from '../../components/FloatingActionButton';

// --- 1. Importar o contexto e os novos serviços ---
import { useAuth } from '../../contexts/AuthContext';
import { getTransactionsFromServer } from '../../services/api';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { token } = useAuth(); // 2. Pegar o token do usuário logado

  const [isLoading, setIsLoading] = useState(true);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]); // Guarda todas as transações
  const [displayedTransactions, setDisplayedTransactions] = useState<Transaction[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentFilter, setCurrentFilter] = useState<FilterType>('all');
  
  // 3. A lógica de carregamento agora busca os dados do servidor
  const loadTransactions = useCallback(async () => {
    if (!token) return; // Se não há token, não faz nada

    setIsLoading(true);
    try {
      const serverTransactions = await getTransactionsFromServer(token);
      setAllTransactions(serverTransactions);
    } catch (error) {
        console.error("Falha ao buscar transações:", error);
        setAllTransactions([]); // Em caso de erro, limpa a lista
    } finally {
        setIsLoading(false);
    }
  }, [token]);

  // Filtra as transações sempre que a data ou o filtro mudar
  useEffect(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const filtered = allTransactions
      .filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate.getFullYear() === year && transactionDate.getMonth() === month;
      })
      .filter(t => currentFilter === 'all' || t.type === currentFilter);
      
    filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    setDisplayedTransactions(filtered);
  }, [allTransactions, currentDate, currentFilter]);
  
  // useFocusEffect é chamado toda vez que a tela entra em foco
  useFocusEffect(
    useCallback(() => {
      loadTransactions();
    }, [loadTransactions])
  );
  
  const calculateFinancialSummary = useCallback((trans: Transaction[]) => {
    let income = 0, totalPaidExpenses = 0, totalPendingExpenses = 0;
    trans.forEach(t => {
      const amountValue = Math.abs(t.amount);
      if (t.type === 'income') income += amountValue;
      else if (t.status === 'paid') totalPaidExpenses += amountValue;
      else totalPendingExpenses += amountValue;
    });
    const balance = income - (totalPaidExpenses + totalPendingExpenses);
    return { income, totalPaidExpenses, totalPendingExpenses, balance };
  }, []);

  const { income: totalIncome, totalPaidExpenses, totalPendingExpenses, balance } = calculateFinancialSummary(displayedTransactions);

  const handlePressTransactionItem = (transaction: Transaction) => {
    navigation.navigate('TransactionDetail', { 
        transactionId: transaction.id,
        instanceDate: transaction.date 
    });
  };
  
  const formatMonth = (date: Date) => date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  const handlePreviousMonth = () => setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  const handleNextMonth = () => setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  const handleDateSelected = (newDate: Date) => setCurrentDate(new Date(newDate.getFullYear(), newDate.getMonth(), 1));
  const handleSelectFilter = (filter: FilterType) => setCurrentFilter(filter);
  const handleAddTransaction = () => navigation.navigate({ name: 'AddTransaction', params: {} });
  const handleGoToWishlist = () => navigation.navigate('Wishlist');

  return (
    <View style={styles.container}>
      <Header
        currentMonth={formatMonth(currentDate)}
        balance={balance}
        onPressPreviousMonth={handlePreviousMonth}
        onPressNextMonth={handleNextMonth}
        onDateChange={handleDateSelected}
        selectedDate={currentDate}
      />
      <SummaryCards
        totalIncome={totalIncome}
        totalPaidExpenses={totalPaidExpenses}
        totalPendingExpenses={totalPendingExpenses}
      />
      <FilterTabs
        currentFilter={currentFilter}
        onSelectFilter={handleSelectFilter}
      />
      <View style={styles.wishlistButtonWrapper}>
        <TouchableOpacity style={styles.wishlistButton} onPress={handleGoToWishlist}>
          <Text style={styles.wishlistButtonText}>IR PARA LISTA DE DESEJOS</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={displayedTransactions}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        renderItem={({ item }) => (
          <TransactionListItem 
            transaction={item} 
            onPressItem={handlePressTransactionItem} 
          />
        )}
        style={styles.transactionsList}
        contentContainerStyle={styles.transactionsListContent}
        ListEmptyComponent={() => (
          <Text style={styles.emptyListText}>Nenhum lançamento para este mês.</Text>
        )}
      />
      <FloatingActionButton onPress={handleAddTransaction} />
    </View>
  );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8f8f8' },
    transactionsList: { flex: 1 },
    transactionsListContent: { paddingTop: 5, paddingBottom: 80 },
    emptyListText: { textAlign: 'center', marginTop: 50, fontSize: 16, color: '#888' },
    wishlistButtonWrapper: { marginHorizontal: 20, marginTop: 15, marginBottom: 15, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 3, backgroundColor: '#007AFF', borderRadius: 10 },
    wishlistButton: { backgroundColor: '#007AFF', borderRadius: 10, paddingVertical: 15, alignItems: 'center', justifyContent: 'center' },
    wishlistButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});

export default HomeScreen;
