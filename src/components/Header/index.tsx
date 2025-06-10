import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';

interface HeaderProps {
  currentMonth: string;
  balance: number;
  onPressPreviousMonth: () => void;
  onPressNextMonth: () => void;
  onPressCalendar: () => void;
}

const Header: React.FC<HeaderProps> = ({
  currentMonth,
  balance,
  onPressPreviousMonth,
  onPressNextMonth,
  onPressCalendar,
}) => {
    
  const statusBarHeight = Constants.statusBarHeight;

  return (
    <View style={[styles.container, { paddingTop: statusBarHeight + 10 }]}>{/* Adicione um padding extra de 10 */}
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