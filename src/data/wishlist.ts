import AsyncStorage from '@react-native-async-storage/async-storage';
import { WishlistItem } from '../types';

const WISHLIST_STORAGE_KEY = '@myExpenseApp:wishlist';

export const getWishlistItems = async (): Promise<WishlistItem[]> => {
  try {
    const jsonValue = await AsyncStorage.getItem(WISHLIST_STORAGE_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.error('Erro ao carregar itens da lista de desejos:', e);
    return [];
  }
};

export const saveWishlistItems = async (items: WishlistItem[]): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(items);
    await AsyncStorage.setItem(WISHLIST_STORAGE_KEY, jsonValue);
  } catch (e) {
    console.error('Erro ao salvar itens da lista de desejos:', e);
  }
};

export const addWishlistItem = async (newItem: WishlistItem): Promise<WishlistItem[]> => {
  const currentItems = await getWishlistItems();
  const updatedItems = [...currentItems, newItem];
  await saveWishlistItems(updatedItems);
  return updatedItems;
};

export const updateWishlistItem = async (updatedItem: WishlistItem): Promise<WishlistItem[]> => {
  const currentItems = await getWishlistItems();
  const updatedItems = currentItems.map(item =>
    item.id === updatedItem.id ? updatedItem : item
  );
  await saveWishlistItems(updatedItems);
  return updatedItems;
};

export const deleteWishlistItem = async (itemId: string): Promise<WishlistItem[]> => {
  const currentItems = await getWishlistItems();
  const updatedItems = currentItems.filter(item => item.id !== itemId);
  await saveWishlistItems(updatedItems);
  return updatedItems;
};

// Função para popular com dados mockados (para testes iniciais)
export const populateWithMockWishlistData = async (mockData: WishlistItem[]): Promise<void> => {
  await saveWishlistItems(mockData);
  console.log('Dados mockados da lista de desejos salvos.');
};