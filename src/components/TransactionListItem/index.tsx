import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Transaction, TransactionType } from '../../types';
import { formatAmountWithThousandsSeparator } from '../../utils/currencyFormatter';

interface TransactionListItemProps {
  transaction: Transaction;
  onPressItem?: (transaction: Transaction) => void;
}

const categoryIcons: { [key: string]: keyof typeof Ionicons.glyphMap } = {
  'Lazer': 'game-controller-outline',
  'Salário': 'wallet-outline',
  'Moradia': 'home-outline',
  'Pets': 'paw-outline',
  'Contas': 'receipt-outline',
  'Transporte': 'car-outline',
  'Alimentação': 'fast-food-outline',
  'Família': 'people-outline',
  'Saúde': 'medkit-outline',
  'Educação': 'school-outline',
  'Compras': 'cart-outline',
  'Cartão': 'card-outline',
  'Esporte': 'football-outline',
  'Outros': 'help-circle-outline',
};

const statusDisplay: { [key: string]: { icon: keyof typeof Ionicons.glyphMap, color: string } } = {
  'paid': { icon: 'checkmark-circle', color: '#2ECC71' },
  'pending': { icon: 'time-outline', color: '#E74C3C' },
  'overdue': { icon: 'warning', color: '#FFD700' },
};


const TransactionListItem: React.FC<TransactionListItemProps> = ({ transaction, onPressItem }) => {
  const isExpense = transaction.type === 'expense';
  const iconName = categoryIcons[transaction.category] || categoryIcons['Outros'];
  
  const isOverdue = React.useMemo(() => {
    if (transaction.type === 'expense' && transaction.status === 'pending') {
      const transactionDate = parseDateString(transaction.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      return transactionDate.getTime() < today.getTime();
    }
    return false;
  }, [transaction.type, transaction.status, transaction.date]);

  let currentStatusDisplay;
  if (isOverdue) {
    currentStatusDisplay = statusDisplay['overdue'];
  } else {
    currentStatusDisplay = statusDisplay[transaction.status] || statusDisplay['paid'];
  }

  const formattedAmount = `${transaction.type === 'expense' ? '-' : '+'} R$ ${formatAmountWithThousandsSeparator(transaction.amount)}`;
  const amountColor = isExpense ? '#E74C3C' : '#2ECC71';

  // Verifica se é uma transação parcelada para exibir o número da parcela
  const isInstallment = transaction.frequency === 'installment' && 
                        transaction.currentInstallment !== undefined && 
                        transaction.totalInstallments !== undefined;

  return (
    <TouchableOpacity style={styles.container} onPress={() => onPressItem && onPressItem(transaction)}>
      {/* Icone de Status */}
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
        </View>
      </View>

      {/* Valor e Número da Parcela (dentro do amountContainer) */}
      <View style={styles.amountContainer}>
        <Text style={[styles.amountText, { color: amountColor }]}>
          {formattedAmount}
        </Text>
        {isInstallment && ( // Renderiza o número da parcela apenas se for parcelada
          <Text style={styles.installmentText}>
            {transaction.currentInstallment}/{transaction.totalInstallments}
          </Text>
        )}
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
  amountContainer: {
    // AQUI ESTÁ A MUDANÇA PRINCIPAL: flexDirection para 'column' e alinhamento
    flexDirection: 'column',
    alignItems: 'flex-end', // Alinha o texto à direita
    justifyContent: 'center', // Centraliza verticalmente se houver espaço
  },
  amountText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 5, // Mantém espaço se tiver o chevron
    textAlign: 'right', // Garante alinhamento à direita
  },
  installmentText: { // <-- AJUSTADO AQUI
    fontSize: 14, // Aumenta o tamanho da fonte (era 12)
    fontWeight: 'bold', // Deixa em negrito
    color: '#888',
    marginTop: 2,
    textAlign: 'right',
  },
  chevronIcon: { // Estilo para o ícone de seta para não afetar o alinhamento
    position: 'absolute',
    right: 0,
    top: '50%', // Ajusta para o meio
    transform: [{ translateY: -9 }], // Centraliza verticalmente (-metade do tamanho)
  },
});

export default TransactionListItem;

export function parseDateString(dateString: string): Date {
  // Adapte esta função conforme sua implementação real
  return new Date(dateString);
}