import 'react-native-get-random-values';
import 'react-native-gesture-handler';

import React from 'react';
import { StyleSheet, SafeAreaView } from 'react-native';
import { NavigationContainer, RouteProp } from '@react-navigation/native';
import { createNativeStackNavigator, NativeStackScreenProps } from '@react-navigation/native-stack';

import HomeScreen from './src/screens/HomeScreen';
import AddTransactionScreen from './src/screens/AddTransactionScreen';
import TransactionDetailScreen from './src/screens/TransactionDetailScreen';
import WishlistScreen from './src/screens/WishlistScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import Toast from 'react-native-toast-message'; 

const Stack = createNativeStackNavigator();

export type RootStackParamList = {
  Home: undefined;
  AddTransaction: { transactionId?: string } | undefined;
  TransactionDetail: { transactionId: string };
  Wishlist: undefined;
  Settings: undefined;
};

type AddTransactionScreenProps = NativeStackScreenProps<RootStackParamList, 'AddTransaction'>;

export default function App() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Home">
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="AddTransaction"
            component={AddTransactionScreen}
            options={({
            route,
            }: {
              route: RouteProp<RootStackParamList, 'AddTransaction'>;
            }) => ({
              title: route.params?.transactionId ? 'Editar Lançamento' : 'Novo Lançamento',
            })}
          />
          <Stack.Screen
            name="TransactionDetail"
            component={TransactionDetailScreen}
            options={{ title: 'Detalhes do Lançamento' }}
          />
          <Stack.Screen
            name="Wishlist"
            component={WishlistScreen}
            options={{ title: 'Minha Lista de Desejos' }}
          />
          {/* Adicione rota para configurações se criar tela dedicada */}
          <Stack.Screen 
            name="Settings"
            component={SettingsScreen}
            options={{ title: 'Backup e Restauração' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
      <Toast />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
});