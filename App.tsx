// carlosnatanael/minhadispesas/MinhaDespesas-1707fc6d5067d715666c9dabd9560bb22b7a156b/App.tsx
import 'react-native-get-random-values';
import 'react-native-gesture-handler';

import React, { useEffect } from 'react';
import { StyleSheet, SafeAreaView } from 'react-native';
import { NavigationContainer, RouteProp } from '@react-navigation/native';
import { createNativeStackNavigator, NativeStackScreenProps } from '@react-navigation/native-stack';

import HomeScreen from './src/screens/HomeScreen';
import AddTransactionScreen from './src/screens/AddTransactionScreen';
import TransactionDetailScreen from './src/screens/TransactionDetailScreen';
import WishlistScreen from './src/screens/WishlistScreen';
import Toast from 'react-native-toast-message';

const Stack = createNativeStackNavigator();

export type RootStackParamList = {
  Home: undefined;
  AddTransaction: { transactionId?: string } | undefined;
  TransactionDetail: { transactionId: string };
  Wishlist: undefined;
};

type AddTransactionScreenProps = NativeStackScreenProps<RootStackParamList, 'AddTransaction'>;

export default function App() {
  useEffect(() => {
  }, []);
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