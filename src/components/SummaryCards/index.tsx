import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Para o ícone de círculo com sinal de + e -
import { formatAmountWithThousandsSeparator } from '../../utils/currencyFormatter';

interface SummaryCardsProps {
  totalIncome: number;
  totalPaidExpenses: number;
  totalPendingExpenses: number;
}

const SummaryCards: React.FC<SummaryCardsProps> = ({ totalIncome, totalPaidExpenses, totalPendingExpenses }) => {
  return (
    <View style={styles.container}>
      {/* Card de Receitas */}
      <View style={[styles.card, styles.incomeCard]}>
        <View style={styles.cardHeader}>
          <Ionicons name="add-circle" size={24} color="#2ECC71" />
          <Text style={styles.cardTitle}>Receitas do Mês</Text>
        </View>
        <Text style={styles.cardValue}>R$ {formatAmountWithThousandsSeparator(totalIncome)}</Text>
      </View>
      {/* Card de Despesas - Total Pago */}
      <View style={[styles.card, styles.paidExpenseCard]}>
        <View style={styles.cardHeader}>
          <Ionicons name="checkmark-circle" size={24} color="#888" />
          <Text style={styles.cardTitle}>Total Pago</Text>
        </View>
        <Text style={styles.cardValue}>R$ {formatAmountWithThousandsSeparator(totalPaidExpenses)}</Text>
      </View>
      {/* Card de Despesas - A Pagar */}
      <View style={[styles.card, styles.pendingExpenseCard]}>
        <View style={styles.cardHeader}>
          <Ionicons name="at-circle" size={24} color="#E74C3C" />
          <Text style={styles.cardTitle}>A Pagar</Text>
        </View>
        <Text style={styles.cardValue}>R$ {formatAmountWithThousandsSeparator(totalPendingExpenses)}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 10,
    marginTop: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    width: '32%',
    alignItems: 'flex-start',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#555',
    marginLeft: 5,
  },
  cardValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  incomeCard: {},
  paidExpenseCard: {},
  pendingExpenseCard: {},
});

export default SummaryCards;