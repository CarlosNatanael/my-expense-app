import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, Text, View, FlatList, Alert, TouchableOpacity } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../../App';

import Header from '../../components/Header';
import SummaryCards from '../../components/SummaryCards';
import FilterTabs, { FilterType } from '../../components/FilterTabs';
import TransactionListItem from '../../components/TransactionListItem';
import { Transaction, TransactionType } from '../../types';
import { getTransactionsFromAsyncStorage } from '../../data/transactions';
import { generateMonthlyTransactions } from '../../utils/transactionGenerators';
import FloatingActionButton from '../../components/FloatingActionButton';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

interface HomeScreenProps{}

const HomeScreen: React.FC<HomeScreenProps> = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();

  const [currentDate, setCurrentDate] = useState(new Date(2025, 6, 1));
  const [currentFilter, setCurrentFilter] = useState<FilterType>('all');
  const [displayedTransactions, setDisplayedTransactions] = useState<Transaction[]>([]);
  const [allStoredTransactions, setAllStoredTransactions] = useState<Transaction[]>([]);
  const calculateFinancialSummary = useCallback((trans: Transaction[]) => {
    let income = 0;
    let totalPaidExpenses = 0;
    let totalPendingExpenses = 0;

    trans.forEach(t => {
      const amountValue = Math.abs(t.amount);
      if (t.type === 'income') {
        income += amountValue;
      } else {
        if (t.status === 'paid') {
          totalPaidExpenses += amountValue;
        } else {
          totalPendingExpenses += amountValue;
        }
      }
    });

    const totalExpenses = totalPaidExpenses + totalPendingExpenses;
    const balance = income - totalExpenses;

    return { income, totalPaidExpenses, totalPendingExpenses, balance };
  }, []);

  const { income: totalIncome, totalPaidExpenses, totalPendingExpenses, balance } = calculateFinancialSummary(displayedTransactions);

  // loadAndGenerateTransactions vai voltar a usar AsyncStorage
  const loadAndGenerateTransactions = useCallback(async () => { // REMOVER userId?: string de argumento

    const loadedTransactions = await getTransactionsFromAsyncStorage(); // Nova função para AsyncStorage
    
    setAllStoredTransactions(loadedTransactions);
    
    const generated = generateMonthlyTransactions(loadedTransactions, currentDate);
    const filtered = generated.filter(t => currentFilter === 'all' || t.type === currentFilter);
    setDisplayedTransactions(filtered);

  }, [currentDate, currentFilter]); // user NÃO É MAIS DEPENDÊNCIA

  useFocusEffect(
    useCallback(() => {
      loadAndGenerateTransactions(); // Simplesmente chama, sem userId
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

  const handleDateSelected = (newDate: Date) => {
    const firstDayOfMonth = new Date(newDate.getFullYear(), newDate.getMonth(), 1);
    setCurrentDate(firstDayOfMonth);
  };


  const handleSelectFilter = (filter: FilterType) => {
    setCurrentFilter(filter);
  };

  const handlePressTransactionItem = (transaction: Transaction) => {
    // Não passa userId
    navigation.navigate('TransactionDetail', { transactionId: transaction.id });
  };

  const handleAddTransaction = () => {
    // Não precisa de login para adicionar, volta ao AsyncStorage
    navigation.navigate('AddTransaction');
  };

  const handleGoToWishlist = () => {
    // Não precisa de login para Wishlist, volta ao AsyncStorage
    navigation.navigate('Wishlist');
  };

  // Ícone de Conta volta a ser apenas um alerta ou placeholder
  const handlePressAccountIcon = async () => {
    // Não faz mais login Google aqui
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