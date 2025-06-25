import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Transaction } from '../../types';
import { Ionicons } from '@expo/vector-icons';
import { formatAmountWithThousandsSeparator as formatCurrency } from '../../utils/currencyFormatter';
import { FontAwesome5 , MaterialCommunityIcons } from '@expo/vector-icons';

interface TransactionListItemProps {
  transaction: Transaction;
  onPressItem: (transaction: Transaction) => void;
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

const TransactionListItem: React.FC<TransactionListItemProps> = ({ transaction, onPressItem }) => {
  const isExpense = transaction.type === 'expense';
  const iconName = categoryIcons[transaction.category] || categoryIcons['Outros']

const StatusIcon: React.FC<{ transaction: Transaction }> = ({ transaction }) => {
    const isExpense = transaction.type === 'expense';
    const isPending = transaction.status === 'pending';
    // Remove a parte do horário da data para uma comparação precisa.
    const transactionDate = new Date(transaction.date.split('T')[0]);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Zera o horário para comparar apenas o dia.
    
    const isOverdue = isPending && transactionDate < today;

    if (isExpense) {
        if (isOverdue) {
            // Atrasado (Vermelho)
            return <MaterialCommunityIcons name="alert-circle" size={24} color="#d9534f" />;
        }
        if (isPending) {
            // Pendente (Laranja)
            return <MaterialCommunityIcons name="clock-time-three" size={24} color="#f0ad4e" />;
        }
        // Pago (Verde)
        return <MaterialCommunityIcons name="check-circle" size={24} color="#5cb85c" />;
    }
    
    // Receita (Verde)
    return <MaterialCommunityIcons name="check-circle" size={24} color="#5cb85c" />;
};

  // **Mantém a correção da data**
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      timeZone: 'UTC',
    });
  };
  const formattedDate = formatDate(transaction.date);

  return (
    <TouchableOpacity style={styles.container} onPress={() => onPressItem(transaction)}>
      {/* Ícone de Status (Estilo Original) */}
      <View style={styles.iconContainer}>
        <StatusIcon transaction={transaction} />
      </View>

      {/* Conteúdo Principal */}
      <View style={styles.detailsContainer}>
        <View style={styles.dateAndIcons}>
           <Text style={styles.descriptionText}>{transaction.description}</Text>
            {/* Ícone para transação recorrente */}
           {transaction.frequency === 'monthly' && (
              <MaterialCommunityIcons name="calendar-refresh-outline" size={16} color="#888" style={styles.extraIcon}/>
           )}
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.date}>{formattedDate}</Text>
          <Ionicons name={iconName} size={16} color="#666" style={styles.categoryIcon} />
        </View>
      </View>

      {/* Valor e Informação da Parcela */}
      <View style={styles.amountContainer}>
        <Text style={[styles.amount, { color: isExpense ? '#d9534f' : '#5cb85c' }]}>
          {isExpense ? '- ' : '+ '}
          {formatCurrency(transaction.amount)}
        </Text>
        {transaction.frequency === 'installment' && (
          <Text style={styles.installmentInfo}>
            {`${transaction.currentInstallment}/${transaction.totalInstallments}`}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        paddingVertical: 12,
        paddingHorizontal: 15,
        marginHorizontal: 15,
        marginBottom: 10,
        backgroundColor: '#fff',
        borderRadius: 12,
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 2,
    },
    iconContainer: {
        marginRight: 15,
        width: 24, // Garante alinhamento
        alignItems: 'center',
    },
    detailsContainer: {
        flex: 1,
    },
    description: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
    },
    dateAndIcons: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    date: {
        fontSize: 14,
        color: '#888',
    },
    extraIcon: {
        marginLeft: 8,
    },
    amountContainer: {
        alignItems: 'flex-end',
    },
    amount: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    installmentInfo: {
        fontSize: 12,
        color: '#888',
        marginTop: 4,
    },
  categoryIcon: {
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  dateText: {
    fontSize: 14,
    color: '#888',
    marginRight: 9,
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
  chevronIcon: { // Estilo para o ícone de seta para não afetar o alinhamento
    position: 'absolute',
    right: 0,
    top: '50%', // Ajusta para o meio
    transform: [{ translateY: -9 }], // Centraliza verticalmente (-metade do tamanho)
  },
});

export default TransactionListItem;
