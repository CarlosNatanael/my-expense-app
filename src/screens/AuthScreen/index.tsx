import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
// Ajuste o caminho abaixo conforme a localização real do AuthContext em seu projeto
import { useAuth } from '../../contexts/AuthContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const AuthScreen: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true); // Controla se o formulário é de login ou cadastro
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { signIn, signUp } = useAuth();

  const handleAuthAction = async () => {
    if (!email || !password) {
      return Alert.alert('Erro', 'Por favor, preencha e-mail e senha.');
    }
    if (!isLogin && !fullName) {
        return Alert.alert('Erro', 'Por favor, preencha o nome completo.');
    }

    setIsLoading(true);
    try {
      if (isLogin) {
        await signIn(email, password);
        // O app vai navegar automaticamente após o sucesso
      } else {
        await signUp(fullName, email, password);
        Alert.alert('Sucesso!', 'Sua conta foi criada. Agora você pode fazer o login.');
        setIsLogin(true); // Muda para a tela de login após o cadastro
      }
    } catch (error) {
      // O erro já é tratado e exibido pelo apiFetch, não precisa fazer nada aqui.
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <MaterialCommunityIcons name="finance" size={64} color="#007AFF" />
      <Text style={styles.title}>Minhas Despesas</Text>
      
      {!isLogin && (
        <TextInput
          style={styles.input}
          placeholder="Nome Completo"
          value={fullName}
          onChangeText={setFullName}
          autoCapitalize="words"
        />
      )}
      <TextInput
        style={styles.input}
        placeholder="E-mail"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Senha"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleAuthAction} disabled={isLoading}>
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>{isLogin ? 'Entrar' : 'Criar Conta'}</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
        <Text style={styles.toggleText}>
          {isLogin ? 'Não tem uma conta? Cadastre-se' : 'Já tem uma conta? Faça o login'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#f8f8f8',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 40,
        marginTop: 10,
    },
    input: {
        width: '100%',
        height: 50,
        backgroundColor: '#fff',
        borderRadius: 8,
        paddingHorizontal: 15,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#ddd',
        marginBottom: 15,
    },
    button: {
        width: '100%',
        height: 50,
        backgroundColor: '#007AFF',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    toggleText: {
        marginTop: 20,
        color: '#007AFF',
        fontSize: 16,
    },
});

export default AuthScreen;
