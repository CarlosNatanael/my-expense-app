import 'react-native-get-random-values';
import 'react-native-gesture-handler';

import React, { useEffect } from 'react';
import { StyleSheet, SafeAreaView } from 'react-native';
import { NavigationContainer, RouteProp } from '@react-navigation/native';
import { createNativeStackNavigator, NativeStackScreenProps } from '@react-navigation/native-stack';

import HomeScreen from './src/screens/HomeScreen';
import AddTransactionScreen from './src/screens/AddTransactionScreen';
import TransactionDetailScreen from './src/screens/TransactionDetailScreen';
import WishlistScreen from './src/screens/WishlistScreen/index'; // <--- NOVA IMPORTAÇÃO
import Toast from 'react-native-toast-message';

import * as Notifications from 'expo-notifications';

const Stack = createNativeStackNavigator();

export type RootStackParamList = {
  Home: undefined;
  AddTransaction: { transactionId?: string } | undefined;
  TransactionDetail: { transactionId: string };
  Wishlist: undefined; // <--- NOVA ROTA
};

type AddTransactionScreenProps = NativeStackScreenProps<RootStackParamList, 'AddTransaction'>;

export default function App() {
  useEffect(() => {
    // Código para permissões de notificação e agendamento (se ainda quiser manter)
    // Se não quiser notificações por enquanto, pode remover o bloco useEffect
    // e os imports de 'expo-notifications' e 'notificationScheduler'.
    const requestPermissions = async () => {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        alert('As notificações são necessárias para lembrar sobre despesas pendentes!');
        return;
      }
      console.log('Permissão de notificação concedida!');
    };

    requestPermissions();
    // scheduleDailyCheck(); // Se não for usar as notificações, remova esta linha

    const subscription = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notificação recebida:', notification);
    });

    const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notificação clicada:', response);
    });

    return () => {
      Notifications.removeNotificationSubscription(subscription);
      Notifications.removeNotificationSubscription(responseSubscription);
    };
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
          <Stack.Screen // <--- NOVA TELA
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