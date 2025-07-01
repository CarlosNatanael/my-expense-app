import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../contexts/AuthContext'; // Garante que está importando do lugar certo

// Importa as telas
import HomeScreen from '../screens/HomeScreen';
import AddTransactionScreen from '../screens/AddTransactionScreen';
import TransactionDetailScreen from '../screens/TransactionDetailScreen';
import WishlistScreen from '../screens/WishlistScreen';
import SettingsScreen from '../screens/SettingsScreen';
import AuthScreen from '../screens/AuthScreen'; // Importa a tela com o nome correto

const AppStack = createNativeStackNavigator();
const AuthStack = createNativeStackNavigator();

const AuthRoutes: React.FC = () => (
  <AuthStack.Navigator>
    <AuthStack.Screen name="Auth" component={AuthScreen} options={{ headerShown: false }} />
  </AuthStack.Navigator>
);

const AppRoutes: React.FC = () => (
    <AppStack.Navigator initialRouteName="Home">
        <AppStack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
        <AppStack.Screen name="AddTransaction" component={AddTransactionScreen} options={{ title: 'Novo Lançamento' }} />
        <AppStack.Screen name="TransactionDetail" component={TransactionDetailScreen} options={{ title: 'Detalhes' }} />
        <AppStack.Screen name="Wishlist" component={WishlistScreen} options={{ title: 'Lista de Desejos' }} />
        <AppStack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Configurações' }} />
    </AppStack.Navigator>
);

const Routes: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return user ? <AppRoutes /> : <AuthRoutes />;
};

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f8f8',
    }
})

export default Routes;
