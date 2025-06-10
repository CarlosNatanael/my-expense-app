import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Para o ícone de círculo com sinal de + e -

interface SummaryCardsProps {
  totalIncome: number;
  totalExpenses: number;
}

const SummaryCards: React.FC<SummaryCardsProps> = ({ totalIncome, totalExpenses }) => {
  return (
    <View style={styles.container}>
      {/* Card de Receitas */}
      <View style={[styles.card, styles.incomeCard]}>
        <View style={styles.cardHeader}>
          <Ionicons name="add-circle" size={24} color="#2ECC71" />{/* Ícone verde */}
          <Text style={styles.cardTitle}>Receitas</Text>
        </View>
        <Text style={styles.cardValue}>R$ {totalIncome.toFixed(2).replace('.', ',')}</Text>
      </View>

      {/* Card de Despesas */}
      <View style={[styles.card, styles.expenseCard]}>
        <View style={styles.cardHeader}>
          <Ionicons name="remove-circle" size={24} color="#E74C3C" />{/* Ícone vermelho */}
          <Text style={styles.cardTitle}>Despesas</Text>
        </View>
        <Text style={styles.cardValue}>R$ {totalExpenses.toFixed(2).replace('.', ',')}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row', // Para colocar os cards lado a lado
    justifyContent: 'space-around', // Espaçamento entre os cards
    width: '100%',
    paddingHorizontal: 20,
    marginTop: 20, // Margem superior para separar do cabeçalho
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    width: '48%', // Quase metade da largura, com um pequeno espaço entre eles
    alignItems: 'flex-start', // Alinha o conteúdo à esquerda
    elevation: 2, // Sombra para Android
    shadowColor: '#000', // Sombra para iOS
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
    fontSize: 16,
    fontWeight: '500',
    color: '#555',
    marginLeft: 8,
  },
  cardValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  incomeCard: {
    // Estilos específicos para o card de receita (fundo e borda se quiser)
    // borderColor: '#2ECC71',
    // borderWidth: 1,
  },
  expenseCard: {
    // Estilos específicos para o card de despesa
    // borderColor: '#E74C3C',
    // borderWidth: 1,
  },
});

export default SummaryCards;