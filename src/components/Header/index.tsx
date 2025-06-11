import React, { useState } from 'react'; // Importe useState
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native'; // Importe Platform
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import DateTimePicker from '@react-native-community/datetimepicker'; // <--- Nova Importação

interface HeaderProps {
  currentMonth: string;
  balance: number;
  onPressPreviousMonth: () => void;
  onPressNextMonth: () => void;
  onDateChange: (newDate: Date) => void; // <--- Alterado: agora passa a nova data
  selectedDate: Date; // <--- Novo: para inicializar o calendário
}

const Header: React.FC<HeaderProps> = ({
  currentMonth,
  balance,
  onPressPreviousMonth,
  onPressNextMonth,
  onDateChange,
  selectedDate, // Recebe a data atual do mês da HomeScreen
}) => {
  const statusBarHeight = Constants.statusBarHeight;
  const [showDatePicker, setShowDatePicker] = useState(false); // Estado para controlar o DatePicker

  const handleDateChange = (event: any, date?: Date) => {
    setShowDatePicker(Platform.OS === 'ios'); // Fecha o picker no iOS após seleção
    if (date) {
      onDateChange(date); // Chama a função de callback passada pela HomeScreen
    }
  };

  return (
    <View style={[styles.container, { paddingTop: statusBarHeight + 10 }]}>
      {/* Top Section: Month Navigation and Calendar Icon */}
      <View style={styles.monthNavigationContainer}>
        <TouchableOpacity onPress={onPressPreviousMonth}>
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.monthText}>{currentMonth}</Text>
        <TouchableOpacity onPress={onPressNextMonth}>
          <Ionicons name="chevron-forward" size={24} color="#333" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.calendarIcon}> {/* <-- Altera o onPress */}
          <Ionicons name="calendar-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {/* DatePicker */}
      {showDatePicker && (
        <DateTimePicker
          testID="monthYearPicker"
          value={selectedDate} // Usa a data da HomeScreen
          mode="date" // Modo 'date' permite selecionar mês e ano
          display={Platform.OS === 'ios' ? 'spinner' : 'calendar'} // 'spinner' para iOS é bom para seleção de mês/ano
          onChange={handleDateChange}
        />
      )}

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
    // Remova o paddingTop fixo que estava aqui antes (ex: paddingTop: 10,)
    paddingBottom: 15,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  monthNavigationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    position: 'relative',
  },
  monthText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginHorizontal: 15,
  },
  calendarIcon: {
    position: 'absolute',
    right: 0,
    padding: 5,
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