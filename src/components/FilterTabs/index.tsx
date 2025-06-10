import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

// Definindo os tipos para os filtros
export type FilterType = 'all' | 'income' | 'expense';

interface FilterTabsProps {
  currentFilter: FilterType;
  onSelectFilter: (filter: FilterType) => void;
}

const FilterTabs: React.FC<FilterTabsProps> = ({ currentFilter, onSelectFilter }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.tabButton, currentFilter === 'all' && styles.activeTabButton]}
        onPress={() => onSelectFilter('all')}
      >
        <Text style={[styles.tabText, currentFilter === 'all' && styles.activeTabText]}>
          Todos
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tabButton, currentFilter === 'income' && styles.activeTabButton]}
        onPress={() => onSelectFilter('income')}
      >
        <Text style={[styles.tabText, currentFilter === 'income' && styles.activeTabText]}>
          Receitas
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tabButton, currentFilter === 'expense' && styles.activeTabButton]}
        onPress={() => onSelectFilter('expense')}
      >
        <Text style={[styles.tabText, currentFilter === 'expense' && styles.activeTabText]}>
          Despesas
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around', // Distribui os botões igualmente
    width: '100%',
    paddingHorizontal: 20, // Padding lateral para não grudar nas bordas
    marginTop: 20, // Espaço acima das abas
    marginBottom: 15, // Espaço abaixo das abas, antes da lista
    backgroundColor: '#fff', // Fundo branco para a área das abas
    borderRadius: 10,
    elevation: 1, // Sombra sutil para Android
    shadowColor: '#000', // Sombra sutil para iOS
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  tabButton: {
    flex: 1, // Faz com que cada botão ocupe o mesmo espaço
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
    marginHorizontal: 4, // Pequeno espaço entre os botões
    // borderColor: '#ddd', // Pode adicionar borda para não ativos
    // borderWidth: 1,
  },
  activeTabButton: {
    // backgroundColor: '#007AFF', // Cor azul para a aba ativa (pode ajustar)
    // Para a UI que você mostrou, a aba ativa é um fundo branco com borda preta
    // Então, pode ajustar:
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#333',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#666',
  },
  activeTabText: {
    color: '#333', // Texto mais escuro para a aba ativa
    fontWeight: '700',
  },
});

export default FilterTabs;