import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Button, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../../App';

import Header from '../../components/Header';
import SummaryCards from '../../components/SummaryCards'; // Importe seu novo componente SummaryCards

// Tipamos a prop de navegação para esta tela
type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

interface HomeScreenProps {
  // Se HomeScreen recebesse alguma prop, seria definida aqui
}

const HomeScreen: React.FC<HomeScreenProps> = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();

  const [currentDate, setCurrentDate] = useState(new Date());
  // Valores fixos por enquanto, vamos torná-los dinâmicos em breve
  const [balance, setBalance] = useState(721.38);
  const [totalIncome, setTotalIncome] = useState(5100.00);
  const [totalExpenses, setTotalExpenses] = useState(4378.62);

  const formatMonth = (date: Date) => {
    return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  };

  const handlePreviousMonth = () => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
    // TODO: Recalcular balanço, receitas e despesas para o novo mês
  };

  const handleNextMonth = () => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
    // TODO: Recalcular balanço, receitas e despesas para o novo mês
  };

  const handleOpenCalendar = () => {
    alert('Abrir seletor de calendário!');
  };

  const handleAddTransaction = () => {
    navigation.navigate('AddTransaction');
  };

  const containerPaddingTop = Platform.OS === 'android' ? 25 : 50;

  return (
    <View style={[styles.container, { paddingTop: containerPaddingTop }]}>
      <Header
        currentMonth={formatMonth(currentDate)}
        balance={balance}
        onPressPreviousMonth={handlePreviousMonth}
        onPressNextMonth={handleNextMonth}
        onPressCalendar={handleOpenCalendar}
      />

      {/* Adicione o SummaryCards aqui */}
      <SummaryCards
        totalIncome={totalIncome}
        totalExpenses={totalExpenses}
      />

      {/* Conteúdo abaixo dos cards (onde a lista e o botão de adicionar estarão) */}
      <View style={styles.content}>
        <Text>Esta é a área principal do seu app de despesas.</Text>
        <Button
          title="Ir para Adicionar Lançamento"
          onPress={handleAddTransaction}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
});

export default HomeScreen;