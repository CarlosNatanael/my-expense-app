import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Transaction, TransactionType } from '../../types';

interface TransactionListItemProps {
  transaction: Transaction;
  onPressItem?: (transaction: Transaction) => void;
}

const categoryIcons: { [key: string]: keyof typeof Ionicons.glyphMap } = {
  'Lazer': 'game-controller-outline',
  'Salário': 'wallet-outline',
  'Moradia': 'home-outline',
  'Contas': 'receipt-outline',
  'Transporte': 'car-outline',
  'Alimentação': 'fast-food-outline',
  'Saúde': 'medkit-outline',
  'Educação': 'school-outline',
  'Compras': 'cart-outline',
  'Cartão': 'card-outline',
  'Outros': 'help-circle-outline',
};

// Mapeamento para o ícone e COR de status (pago/pendente)
const statusDisplay: { [key: string]: { icon: keyof typeof Ionicons.glyphMap, color: string } } = {
  'paid': { icon: 'checkmark-circle', color: '#2ECC71' }, // Verde para pago
  'pending': { icon: 'time-outline', color: '#E74C3C' },     // Relógio vermelho para pendente
  'overdue': { icon: 'warning', color: '#FFD700' },       // <--- NOVO: Alerta amarelo para atrasado
};


const TransactionListItem: React.FC<TransactionListItemProps> = ({ transaction, onPressItem }) => {
  const isExpense = transaction.type === 'expense';
  const iconName = categoryIcons[transaction.category] || categoryIcons['Outros'];
  
  // Lógica para verificar se a despesa está pendente e atrasada
  const isOverdue = React.useMemo(() => {
    if (transaction.type === 'expense' && transaction.status === 'pending') {
      const transactionDate = parseDateString(transaction.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      return transactionDate.getTime() < today.getTime();
    }
    return false;
  }, [transaction.type, transaction.status, transaction.date]);

  // Define o ícone e a cor do status com base na condição de atraso
  let currentStatusDisplay;
  if (isOverdue) {
    currentStatusDisplay = statusDisplay['overdue']; // Se atrasada, usa o ícone de alerta
  } else {
    currentStatusDisplay = statusDisplay[transaction.status] || statusDisplay['paid']; // Caso contrário, usa o status normal
  }


  const formattedAmount = `${transaction.type === 'expense' ? '- ' : '+ '}R$ ${transaction.amount.toFixed(2).replace('.', ',')}`;
  const amountColor = isExpense ? '#E74C3C' : '#2ECC71';

  let installmentText = '';
  if (transaction.frequency === 'installment' && transaction.currentInstallment && transaction.totalInstallments) {
    installmentText = ` (${transaction.currentInstallment}/${transaction.totalInstallments})`;
  }

  return (
    <TouchableOpacity style={styles.container} onPress={() => onPressItem && onPressItem(transaction)}>
      {/* Icone de Status - Usa a cor e o ícone do statusDisplay */}
      <Ionicons name={currentStatusDisplay.icon} size={22} color={currentStatusDisplay.color} style={styles.statusIcon} />

      {/* Conteúdo Principal */}
      <View style={styles.detailsContainer}>
        <View style={styles.descriptionRow}>
          <Text style={styles.descriptionText}>{transaction.description}</Text>
          {transaction.frequency === 'monthly' && ( // Ícone de recorrência
            <Ionicons name="repeat-outline" size={16} color="#666" style={styles.recurringIcon} />
          )}
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.dateText}>{transaction.date}</Text>
          <Ionicons name={iconName} size={16} color="#666" style={styles.categoryIcon} />
          {/* O ícone de alerta NÃO é mais renderizado separadamente aqui, pois foi integrado ao statusIcon */}
        </View>
      </View>

      {/* Valor e Ícone de Seta (se aplicável) */}
      <View style={styles.amountContainer}>
        <Text style={[styles.amountText, { color: amountColor }]}>
          {formattedAmount}
          {installmentText}
        </Text>
        {/* Ícone de "seta" para indicar que pode ser clicável para detalhes */}
        {onPressItem && <Ionicons name="chevron-forward-outline" size={18} color="#bbb" />}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    marginHorizontal: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  statusIcon: {
    marginRight: 10,
  },
  detailsContainer: {
    flex: 1,
    marginRight: 10,
  },
  descriptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  descriptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  recurringIcon: {
    marginLeft: 5,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  dateText: {
    fontSize: 13,
    color: '#888',
    marginRight: 8,
  },
  categoryIcon: {},
  // O estilo overdueIcon pode ser removido, pois o ícone não é mais um componente separado
  // overdueIcon: {
  //   marginLeft: 5,
  // },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  amountText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 5,
  },
});

export default TransactionListItem;

export function parseDateString(dateString: string): Date {
  // Adapte esta função conforme sua implementação real
  return new Date(dateString);
}