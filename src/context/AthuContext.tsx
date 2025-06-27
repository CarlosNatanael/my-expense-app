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

// Cria o Contexto com um valor padrão
const AuthContext = createContext<AuthContextData>({} as AuthContextData);

// Cria o Provedor do Contexto
export const AuthProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Efeito para carregar o usuário salvo no AsyncStorage ao iniciar o app
  useEffect(() => {
    async function loadStoragedData() {
      const storagedUser = await AsyncStorage.getItem('@MinhasDispesas:user');
      const storagedToken = await AsyncStorage.getItem('@MinhasDispesas:token');

      if (storagedUser && storagedToken) {
        setUser(JSON.parse(storagedUser));
        setToken(storagedToken);
      }
      setIsLoading(false);
    }
    loadStoragedData();
  }, []);

  const signIn = async (email: string, password: string) => {
    const response = await apiFetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    setUser(response.user);
    setToken(response.token);

    // Salva os dados no AsyncStorage para manter o usuário logado
    await AsyncStorage.setItem('@MinhasDispesas:user', JSON.stringify(response.user));
    await AsyncStorage.setItem('@MinhasDispesas:token', response.token);
  };

  const signUp = async (fullName: string, email: string, password: string): Promise<void> => {
    await apiFetch('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ fullName, email, password }),
    });
    // Após o cadastro, o usuário pode fazer o login
  };

  const signOut = async () => {
    // Limpa os dados do estado e do AsyncStorage
    await AsyncStorage.clear();
    setUser(null);
    setToken(null);
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
