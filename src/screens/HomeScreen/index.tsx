import React, { useState, useCallback } from 'react';
import { StyleSheet, Text, View, FlatList, Alert, TouchableOpacity } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../../App';

import Header from '../../components/Header';
import SummaryCards from '../../components/SummaryCards';
import FilterTabs, { FilterType } from '../../components/FilterTabs';
import TransactionListItem from '../../components/TransactionListItem';
import { Transaction } from '../../types';
import { getTransactionsFromAsyncStorage } from '../../data/transactions';
import FloatingActionButton from '../../components/FloatingActionButton';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentFilter, setCurrentFilter] = useState<FilterType>('all');
  const [displayedTransactions, setDisplayedTransactions] = useState<Transaction[]>([]);
  
  const loadAndFilterTransactions = useCallback(async () => {
    const allTransactions = await getTransactionsFromAsyncStorage();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const transactionsForMonth = allTransactions.filter(t => {
        if (t.frequency === 'once' || t.frequency === 'installment') {
            const transactionDate = new Date(t.date);
            return transactionDate.getFullYear() === year && transactionDate.getMonth() === month;
        }
        if (t.frequency === 'monthly') {
            const startDate = new Date(t.startDate || t.date);
            return startDate.getFullYear() < year || (startDate.getFullYear() === year && startDate.getMonth() <= month);
        }
        return false;
    }).map(t => {
        if (t.frequency === 'monthly') {
            const dateForCurrentMonth = new Date(t.date);
            dateForCurrentMonth.setFullYear(year);
            dateForCurrentMonth.setMonth(month);
            const monthKey = `${year}-${(month + 1).toString().padStart(2, '0')}`;
            const isPaid = t.paidOccurrences?.includes(monthKey);
            return { 
                ...t, 
                date: dateForCurrentMonth.toISOString(),
                status: (isPaid ? 'paid' : 'pending') as Transaction['status']
            };
        }
        return t;
    });
    
    const filteredByTab = transactionsForMonth.filter(t => currentFilter === 'all' || t.type === currentFilter);
    // Ordena as transações por data, da mais antiga para a mais nova.
    filteredByTab.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    setDisplayedTransactions(filteredByTab);
  }, [currentDate, currentFilter]);
  
  useFocusEffect(useCallback(() => { loadAndFilterTransactions(); }, [loadAndFilterTransactions]));
  
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
    // **CORREÇÃO**: Passa a data da instância para a tela de detalhes
    navigation.navigate('TransactionDetail', { 
        transactionId: transaction.id,
        instanceDate: transaction.date 
    });
  };
  
  // ... (resto do componente HomeScreen, que já está correto)
  const formatMonth = (date: Date) => date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  const handlePreviousMonth = () => setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  const handleNextMonth = () => setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  const handleDateSelected = (newDate: Date) => setCurrentDate(new Date(newDate.getFullYear(), newDate.getMonth(), 1));
  const handleSelectFilter = (filter: FilterType) => setCurrentFilter(filter);
  const handleAddTransaction = () => navigation.navigate({ name: 'AddTransaction', params: {} });
  const handleGoToWishlist = () => navigation.navigate('Wishlist');
  const handlePressAccountIcon = () => Alert.alert('Conta', 'Funcionalidade de conta/login será implementada no futuro.');

  return (
    <View style={styles.container}>
      <Header
        currentMonth={formatMonth(currentDate)}
        balance={balance}
        onPressPreviousMonth={handlePreviousMonth}
        onPressNextMonth={handleNextMonth}
        onDateChange={handleDateSelected}
        selectedDate={currentDate}
        onPressAccount={handlePressAccountIcon}
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
        keyExtractor={(item, index) => `${item.id}-${index}`} // Chave mais robusta para recorrências
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
