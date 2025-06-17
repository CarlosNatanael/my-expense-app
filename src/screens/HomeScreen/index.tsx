import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, Text, View, Button, FlatList, Alert,TouchableOpacity  } from 'react-native';
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

import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { auth } from '../../config/firebase'; // Importa a instância de autenticação do Firebase
import { signInWithCredential, GoogleAuthProvider, onAuthStateChanged } from 'firebase/auth';

WebBrowser.maybeCompleteAuthSession(); // Necessário para expo-auth-session

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

interface HomeScreenProps{}

const HomeScreen: React.FC<HomeScreenProps> = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();

  const [currentDate, setCurrentDate] = useState(new Date(2025, 6, 1));
  const [currentFilter, setCurrentFilter] = useState<FilterType>('all');
  const [displayedTransactions, setDisplayedTransactions] = useState<Transaction[]>([]);
  const [allStoredTransactions, setAllStoredTransactions] = useState<Transaction[]>([]);
  const [user, setUser] = useState<any>(null); // Estado para o usuário logado

  // --- CONFIGURAÇÃO GOOGLE SIGN-IN ---
  // ID do cliente web OAuth 2.0 (do Firebase Console -> Authentication -> Sign-in method -> Google -> Web SDK configuration)
  // Se for usar Android standalone app, precisará do ID do cliente Android também.
  const WEB_CLIENT_ID = "230612860751-duo5soke81ijdab8gompc7e3790ht360.apps.googleusercontent.com"; // <-- OBTENHA ESTE VALOR DO CONSOLE DO FIREBASE
  // Android Client ID para builds nativos (se precisar testar em APKs compilados)
  const ANDROID_CLIENT_ID = "230612860751-7vk5ofbsihkjqfk7mboditviutl0ue2m.apps.googleusercontent.com"; // <-- OBTENHA ESTE VALOR DO CONSOLE DO FIREBASE

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: WEB_CLIENT_ID,
    androidClientId: ANDROID_CLIENT_ID,
  });

  // Efeito para lidar com a resposta da autenticação Google
  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      const credential = GoogleAuthProvider.credential(id_token);
      signInWithCredential(auth, credential)
        .then((userCredential) => {
          // Usuário logado com sucesso no Firebase
          const loggedInUser = userCredential.user;
          setUser(loggedInUser);
          Alert.alert('Sucesso!', `Bem-vindo, ${loggedInUser.displayName || loggedInUser.email}!`);
          console.log('Usuário logado no Firebase:', loggedInUser);
          // TODO: Migrar dados do AsyncStorage para Firestore para este usuário
        })
        .catch((error) => {
          Alert.alert('Erro de Login', error.message);
          console.error('Erro ao fazer login no Firebase com Google:', error);
        });
    } else if (response?.type === 'error') {
      Alert.alert('Erro de Autenticação', 'Não foi possível completar o login com Google.');
      console.error('Erro de autenticação Google:', response.error);
    }
  }, [response]);

  // Observar o estado de autenticação do Firebase (se o usuário está logado ou não)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      console.log('Estado de autenticação do Firebase mudou:', firebaseUser);
      // Aqui você pode recarregar transações específicas do usuário logado se os dados já estivessem no Firestore
    });
    return () => unsubscribe();
  }, []);
  // --- FIM CONFIGURAÇÃO GOOGLE SIGN-IN ---

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
    // TODO: No futuro, filtrar transações por user.uid do Firestore
    const loadedTransactions = await getTransactions(); // Ainda carregando do AsyncStorage

    if (loadedTransactions.length === 0 && !user) { // Popula mock data apenas se não tiver dados E não estiver logado
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

  }, [currentDate, currentFilter, user]); // Adiciona 'user' como dependência

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

  const handleDateSelected = (newDate: Date) => {
    const firstDayOfMonth = new Date(newDate.getFullYear(), newDate.getMonth(), 1);
    setCurrentDate(firstDayOfMonth);
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

  const handlePressAccountIcon = async () => {
    if (user) {
      // Se já estiver logado, pode oferecer logout
      Alert.alert('Usuário Logado', `Você está logado como: ${user.displayName || user.email}.\nDeseja fazer logout?`, [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Logout', onPress: () => auth.signOut() }
      ]);
    } else {
      // Tenta fazer login com Google
      try {
        await promptAsync(); // Dispara o fluxo de autenticação
      } catch (error) {
        console.error('Erro ao iniciar prompt de autenticação:', error);
        Alert.alert('Erro', 'Não foi possível iniciar o login com Google.');
      }
    }
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