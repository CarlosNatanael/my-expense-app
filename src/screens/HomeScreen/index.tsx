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
import { getTransactionsFromAsyncStorage, deleteTransactionFromAsyncStorage } from '../../data/transactions';
import FloatingActionButton from '../../components/FloatingActionButton';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();

  const [currentDate, setCurrentDate] = useState(new Date()); // Inicia com a data atual
  const [currentFilter, setCurrentFilter] = useState<FilterType>('all');
  const [displayedTransactions, setDisplayedTransactions] = useState<Transaction[]>([]);
  
  // Função que carrega, filtra e exibe as transações
  const loadAndFilterTransactions = useCallback(async () => {
    const allTransactions = await getTransactionsFromAsyncStorage();

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const transactionsForMonth = allTransactions.filter(t => {
      const transactionDate = new Date(t.date);
      
      // Para transações 'once' (única) e 'installment' (parcelada),
      // a data já está correta, então apenas verificamos se pertence ao mês/ano atual.
      if (t.frequency === 'once' || t.frequency === 'installment') {
        return transactionDate.getFullYear() === year && transactionDate.getMonth() === month;
      }
      
      // Para transações 'monthly' (recorrente)
      if (t.frequency === 'monthly') {
        const startDate = new Date(t.startDate || t.date);
        // Verifica se a transação recorrente já começou
        const hasStarted = startDate.getFullYear() < year || (startDate.getFullYear() === year && startDate.getMonth() <= month);
        // (Opcional) Adicionar lógica de data final se houver
        return hasStarted;
      }
      
      return false;
    }).map(t => {
      // Se for recorrente, ajusta a data para o mês atual para exibição correta
      if (t.frequency === 'monthly') {
        const dateForCurrentMonth = new Date(t.date);
        dateForCurrentMonth.setFullYear(year);
        dateForCurrentMonth.setMonth(month);
        return { ...t, date: dateForCurrentMonth.toISOString() };
      }
      return t;
    });

    // Aplica o filtro da aba ('Todos', 'Receitas', 'Despesas')
    const filteredByTab = transactionsForMonth.filter(t => currentFilter === 'all' || t.type === currentFilter);
    
    // Ordena as transações por data
    filteredByTab.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    setDisplayedTransactions(filteredByTab);
  }, [currentDate, currentFilter]);


  // useFocusEffect é chamado toda vez que a tela entra em foco
  useFocusEffect(
    useCallback(() => {
      loadAndFilterTransactions();
    }, [loadAndFilterTransactions])
  );
  
  // Calcula os totais para os cards de resumo
  const calculateFinancialSummary = useCallback((trans: Transaction[]) => {
    let income = 0;
    let totalPaidExpenses = 0;
    let totalPendingExpenses = 0;

    trans.forEach(t => {
      const amountValue = Math.abs(t.amount);
      if (t.type === 'income') {
        income += amountValue;
      } else { // type === 'expense'
        if (t.status === 'paid') {
          totalPaidExpenses += amountValue;
        } else { // status === 'pending'
          totalPendingExpenses += amountValue;
        }
      }
    });

    const balance = income - (totalPaidExpenses + totalPendingExpenses);

    return { income, totalPaidExpenses, totalPendingExpenses, balance };
  }, []);

  const { income: totalIncome, totalPaidExpenses, totalPendingExpenses, balance } = calculateFinancialSummary(displayedTransactions);


  const formatMonth = (date: Date) => {
    return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  };

  const handlePreviousMonth = () => {
    setCurrentDate(prevDate => new Date(prevDate.getFullYear(), prevDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(prevDate => new Date(prevDate.getFullYear(), prevDate.getMonth() + 1, 1));
  };

  const handleDateSelected = (newDate: Date) => {
    setCurrentDate(new Date(newDate.getFullYear(), newDate.getMonth(), 1));
  };


  const handleSelectFilter = (filter: FilterType) => {
    setCurrentFilter(filter);
  };

  const handlePressTransactionItem = (transaction: Transaction) => {
    navigation.navigate('TransactionDetail', { transactionId: transaction.id });
  };
  
  const handleAddTransaction = () => {
    navigation.navigate('AddTransaction');
  };

  const handleGoToWishlist = () => {
    navigation.navigate('Wishlist');
  };
  
  const handlePressAccountIcon = () => {
    Alert.alert('Conta', 'Funcionalidade de conta/login será implementada no futuro.');
  };

  return (
    <View style={styles.container}>
      <Header
        currentMonth={formatMonth(currentDate)}
        balance={balance}
        onPressPreviousMonth={handlePreviousMonth}
        onPressNextMonth={handleNextMonth}
        onDateChange={handleDateSelected}
        selectedDate={currentDate}
        currentFilter={currentFilter}
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
        keyExtractor={(item) => item.id}
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
  wishlistButtonWrapper: {
    marginHorizontal: 20,
    marginTop: 15,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    backgroundColor: '#007AFF',
    borderRadius: 10,
  },
  wishlistButton: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wishlistButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default HomeScreen;