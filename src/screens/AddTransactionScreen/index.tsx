// src/screens/AddTransactionScreen/index.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// Se no futuro você receber props de navegação, pode tipar aqui
interface AddTransactionScreenProps {}

const AddTransactionScreen: React.FC<AddTransactionScreenProps> = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Adicionar Novo Lançamento</Text>
      <Text>Formulário de adição de despesas/receitas virá aqui.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
});

export default AddTransactionScreen;