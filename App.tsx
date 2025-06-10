import 'react-native-gesture-handler';

import React from 'react';
import { StyleSheet } from 'react-native'; // <--- Verifique se você removeu 'Text' e 'View' daqui
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from './src/screens/HomeScreen';
import AddTransactionScreen from './src/screens/AddTransactionScreen';

const Stack = createNativeStackNavigator();

export type RootStackParamList = {
  Home: undefined;
  AddTransaction: undefined;
};

export default function App() {
  return (
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
          options={{ title: 'Novo Lançamento' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// Remova os estilos de App.tsx, eles não serão mais necessários aqui
const styles = StyleSheet.create({
  // Garanta que não há texto solto aqui, apenas propriedades de estilo
});