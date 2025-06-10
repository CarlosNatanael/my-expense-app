import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

// Definimos o tipo para as props do nosso componente App (neste caso, não tem props, mas é uma boa prática)
interface AppProps {
  // Nenhuma propriedade por enquanto
}

// Usamos React.FC (Function Component) para tipar nosso componente
const App: React.FC<AppProps> = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Meu App de Despesas</Text>
      <Text>Bem-vindo ao seu controle financeiro!</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
});

export default App;