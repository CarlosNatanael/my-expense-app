import 'react-native-get-random-values';
import 'react-native-gesture-handler';

import React from 'react';
import { StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import Toast from 'react-native-toast-message';

import { AuthProvider } from './src/contexts/AuthContext'; // Importa o provedor
import Routes from './src/navigation'; // Importa nosso novo roteador principal

export type RootStackParamList = {
  Home: undefined;
  Auth: undefined;
  AddTransaction: { transactionId?: string };
  TransactionDetail: { transactionId: string; instanceDate?: string };
  Wishlist: undefined;
  Settings: undefined;
};

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <SafeAreaView style={styles.safeArea}>
          <StatusBar barStyle="light-content" backgroundColor="#007AFF" />
          <Routes />
        </SafeAreaView>
      </NavigationContainer>
      <Toast />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
});
