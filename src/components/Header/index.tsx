import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Para os ícones de seta e calendário

interface HeaderProps {
  currentMonth: string;
  balance: number;
  onPressPreviousMonth: () => void;
  onPressNextMonth: () => void;
  onPressCalendar: () => void; // Para o ícone de calendário
}

const Header: React.FC<HeaderProps> = ({
  currentMonth,
  balance,
  onPressPreviousMonth,
  onPressNextMonth,
  onPressCalendar,
}) => {
  return (
    <View style={styles.container}>
      {/* Top Section: Month Navigation and Calendar Icon */}
      <View style={styles.monthNavigationContainer}>
        <TouchableOpacity onPress={onPressPreviousMonth}>
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.monthText}>{currentMonth}</Text>
        <TouchableOpacity onPress={onPressNextMonth}>
          <Ionicons name="chevron-forward" size={24} color="#333" />
        </TouchableOpacity>
        <TouchableOpacity onPress={onPressCalendar} style={styles.calendarIcon}>
          <Ionicons name="calendar-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Balance Section */}
      <View style={styles.balanceContainer}>
        <Text style={styles.balanceLabel}>Balanço do mês</Text>
        <Text style={styles.balanceValue}>R$ {balance.toFixed(2).replace('.', ',')}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 20,
    paddingTop: 10, // Ajuste conforme a barra de status do seu device
    paddingBottom: 15,
    backgroundColor: '#fff', // Fundo branco como na UI
    borderBottomLeftRadius: 20, // Bordas arredondadas na parte inferior
    borderBottomRightRadius: 20,
    elevation: 3, // Sombra para Android
    shadowColor: '#000', // Sombra para iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  monthNavigationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center', // Centraliza as setas e o texto
    marginBottom: 10,
    position: 'relative', // Para posicionar o calendário absoluto
  },
  monthText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginHorizontal: 15,
  },
  calendarIcon: {
    position: 'absolute',
    right: 0, // Alinha à direita
    padding: 5, // Área clicável
  },
  balanceContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  balanceValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default Header;