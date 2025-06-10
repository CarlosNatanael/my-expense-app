import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Transaction, TransactionType } from '../../types'; // Importe os tipos de transação

interface TransactionListItemProps {
  transaction: Transaction; // O objeto de transação que será exibido
  onPressItem?: (transaction: Transaction) => void; // Opcional: para abrir detalhes
}

// Mapeamento de categorias para ícones (adicione mais conforme suas categorias)
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
  'Outros': 'help-circle-outline',
  // Adicione mais ícones conforme suas necessidades
};

// Mapeamento para o ícone de status (pago/pendente)
const statusIcons: { [key: string]: keyof typeof Ionicons.glyphMap } = {
  'paid': 'checkmark-circle-outline', // Círculo com check para pago
  'pending': 'time-outline',         // Relógio para pendente
};


const TransactionListItem: React.FC<TransactionListItemProps> = ({ transaction, onPressItem }) => {
  const isExpense = transaction.type === 'expense';
  const iconName = categoryIcons[transaction.category] || categoryIcons['Outros'];
  const statusIconName = statusIcons[transaction.status] || statusIcons['paid']; // Default para pago

  // Formata o valor com sinal e cor
  const formattedAmount = `${isExpense ? '- ' : '+ '}R$ ${transaction.amount.toFixed(2).replace('.', ',')}`;
  const amountColor = isExpense ? '#E74C3C' : '#2ECC71'; // Vermelho para despesa, verde para receita

  // Lógica para exibir parcelas (se for o caso)
  let installmentText = '';
  if (transaction.frequency === 'installment') {
    installmentText = ` (${transaction.currentInstallment}/${transaction.totalInstallments})`;
  }

  return (
    <TouchableOpacity style={styles.container} onPress={() => onPressItem && onPressItem(transaction)}>
      {/* Icone de Status */}
      <Ionicons name={statusIconName} size={22} color="#888" style={styles.statusIcon} />

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

      {/* Valor e Ícone de Seta (se aplicável) */}
      <View style={styles.amountContainer}>
        <Text style={[styles.amountText, { color: amountColor }]}>
          {formattedAmount}
          {installmentText} {/* Adiciona o texto da parcela */}
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
    marginBottom: 10, // Espaço entre os itens da lista
    marginHorizontal: 20, // Padding lateral para a lista
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
    flex: 1, // Faz com que ocupe o máximo de espaço possível
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
  categoryIcon: {
    // Estilos para o ícone de categoria
  },
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