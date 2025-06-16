// src/components/Header/index.tsx

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import DateTimePicker from '@react-native-community/datetimepicker';
import { FilterType } from '../FilterTabs';
import { formatAmountWithThousandsSeparator } from '../../utils/currencyFormatter'; // <--- IMPORTAR

interface HeaderProps {
  currentMonth: string;
  balance: number;
  onPressPreviousMonth: () => void;
  onPressNextMonth: () => void;
  onDateChange: (newDate: Date) => void;
  selectedDate: Date;
  currentFilter: FilterType;
}

const Header: React.FC<HeaderProps> = ({
  currentMonth,
  balance,
  onPressPreviousMonth,
  onPressNextMonth,
  onDateChange,
  selectedDate,
  currentFilter,
}) => {
  const statusBarHeight = Constants.statusBarHeight;
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleDateChange = (event: any, date?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (date) {
      onDateChange(date);
    }
  };

  // Lógica para formatar o balanço: remove o sinal se o filtro for 'expense'
  const formattedBalance = currentFilter === 'expense'
    ? `R$ ${formatAmountWithThousandsSeparator(Math.abs(balance))}` // Usar a nova função
    : `R$ ${formatAmountWithThousandsSeparator(balance)}`; // Usar a nova função

  console.log('Header: currentFilter recebido:', currentFilter);
  console.log('Header: formattedBalance calculado:', formattedBalance);
  console.log('Header: balance original:', balance);


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
        <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.calendarIcon}>
          <Ionicons name="calendar-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {/* DatePicker */}
      {showDatePicker && (
        <DateTimePicker
          testID="monthYearPicker"
          value={selectedDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'calendar'}
          onChange={handleDateChange}
        />
      )}

      {/* Balance Section */}
      <View style={styles.balanceContainer}>
        <Text style={styles.balanceLabel}>Balanço do mês</Text>
        <Text style={styles.balanceValue}>{formattedBalance}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 20,
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