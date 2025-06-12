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

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

interface HomeScreenProps{}

const HomeScreen: React.FC<HomeScreenProps> = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();

  const [currentDate, setCurrentDate] = useState(new Date(2025, 5, 1));
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

  const loadAndGenerateTransactions = useCallback(async () => {
    const loadedTransactions = await getTransactions();
    
    if (loadedTransactions.length === 0) {
      Alert.alert(
        "Dados de Exemplo",
        "Nenhum dado encontrado. Adicionando dados de exemplo para você começar!",
        [{ text: "OK", onPress: async () => {
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

  // Reintroduzindo as funções handlePreviousMonth e handleNextMonth
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

  // Função para atualizar a data quando o seletor de calendário é usado
  const handleDateSelected = (newDate: Date) => {
    // Certifica-se de que a data selecionada seja o primeiro dia do mês, para evitar problemas de fuso horário
    const firstDayOfMonth = new Date(newDate.getFullYear(), newDate.getMonth(), 1);
    setCurrentDate(firstDayOfMonth); // Atualiza o estado da data, o que vai recarregar a lista
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

  return (
    <View style={styles.container}>
      <Header
        currentMonth={formatMonth(currentDate)}
        balance={balance}
        onPressPreviousMonth={handlePreviousMonth} // <-- Agora a função existe
        onPressNextMonth={handleNextMonth}     // <-- Agora a função existe
        onDateChange={handleDateSelected}
        selectedDate={currentDate}
        currentFilter={currentFilter}
      />

      <SummaryCards
        totalIncome={totalIncome}
        totalExpenses={totalPaidExpenses} // Corrija aqui
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