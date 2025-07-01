import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiFetch from '../services/api';

// Define a estrutura das informações do usuário e do contexto
interface User {
  id: string;
  email: string;
  fullName: string;
}

interface AuthContextData {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (fullName: string, email: string, password: string) => Promise<void>;
  signOut: () => void;
}

// Cria o Contexto
const AuthContext = createContext<AuthContextData>({} as AuthContextData);

// Cria o Provedor do Contexto
export const AuthProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadStoragedData() {
      try {
        const storagedUser = await AsyncStorage.getItem('@MinhasDispesas:user');
        const storagedToken = await AsyncStorage.getItem('@MinhasDispesas:token');

        if (storagedUser && storagedToken) {
          setUser(JSON.parse(storagedUser));
          setToken(storagedToken);
        }
      } catch (error) {
        console.error("Falha ao carregar dados do armazenamento:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadStoragedData();
  }, []);

  const signIn = async (email: string, password: string) => {
    const response = await apiFetch('/api/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    const userData = response.usuario;
    const tokenData = response.token;
    setUser(userData);
    setToken(tokenData);
    await AsyncStorage.setItem('@MinhasDispesas:user', JSON.stringify(userData));
    await AsyncStorage.setItem('@MinhasDispesas:token', tokenData);
  };

  const signUp = async (fullName: string, email: string, password: string) => {
    await apiFetch('/api/register', {
        method: 'POST',
        body: JSON.stringify({ nome: fullName, email, senha: password }),
    });
  };

  const signOut = async () => {
    try {
      await AsyncStorage.removeItem('@MinhasDispesas:user');
      await AsyncStorage.removeItem('@MinhasDispesas:token');
      setUser(null);
      setToken(null);
    } catch (error) {
        console.error("Erro ao fazer logout:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook customizado para facilitar o uso do contexto
export function useAuth(): AuthContextData {
  const context = useContext(AuthContext);
  return context;
}
