import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiFetch from '../services/api';

// A interface User continua a mesma, esperando fullName
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

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

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

    // --- INÍCIO DA CORREÇÃO ---
    // Mapeamos a resposta da API para a nossa interface User.
    const userFromApi = response.usuario;
    const tokenData = response.token;

    const userToStore: User = {
      id: userFromApi.id,
      email: email, // O email não vem na resposta, então usamos o que o utilizador digitou
      fullName: userFromApi.nome // Mapeamos 'nome' para 'fullName'
    };
    // --- FIM DA CORREÇÃO ---

    setUser(userToStore);
    setToken(tokenData);

    await AsyncStorage.setItem('@MinhasDispesas:user', JSON.stringify(userToStore));
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

export function useAuth(): AuthContextData {
  const context = useContext(AuthContext);
  return context;
}
