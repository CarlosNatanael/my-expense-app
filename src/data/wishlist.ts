import AsyncStorage from '@react-native-async-storage/async-storage';
import { WishlistItem } from '../types';
import { Alert } from 'react-native';

const WISHLIST_STORAGE_KEY = '@myExpenseApp:wishlist';

export const getWishlistItemsFromAsyncStorage = async (): Promise<WishlistItem[]> => {
  try {
    const jsonValue = await AsyncStorage.getItem(WISHLIST_STORAGE_KEY);
    const items = jsonValue != null ? JSON.parse(jsonValue) : [];
    console.log('AsyncStorage Wishlist: Itens carregados:', items);
    return items;
  } catch (e) {
    console.error('Erro ao carregar itens da lista de desejos do AsyncStorage:', e);
    return [];
  }
};

export const saveWishlistItemsToAsyncStorage = async (items: WishlistItem[]): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(items);
    await AsyncStorage.setItem(WISHLIST_STORAGE_KEY, jsonValue);
    console.log('AsyncStorage Wishlist: Itens salvos:', items);
  } catch (e) {
    console.error('Erro ao salvar itens da lista de desejos no AsyncStorage:', e);
  }
};

export const addWishlistItemToAsyncStorage = async (newItem: WishlistItem): Promise<WishlistItem[]> => {
  const currentItems = await getWishlistItemsFromAsyncStorage();
  const updatedItems = [...currentItems, newItem];
  await saveWishlistItemsToAsyncStorage(updatedItems);
  return updatedItems;
};

export const updateWishlistItemInAsyncStorage = async (updatedItem: WishlistItem): Promise<WishlistItem[]> => {
  const currentItems = await getWishlistItemsFromAsyncStorage();
  const updatedItems = currentItems.map(item =>
    item.id === updatedItem.id ? updatedItem : item
  );
  await saveWishlistItemsToAsyncStorage(updatedItems);
  return updatedItems;
};

export const deleteWishlistItemFromAsyncStorage = async (itemId: string): Promise<void> => {
  const currentItems = await getWishlistItemsFromAsyncStorage();
  const updatedItems = currentItems.filter(item => item.id !== itemId);
  await saveWishlistItemsToAsyncStorage(updatedItems);
};

export const populateWithMockWishlistDataToAsyncStorage = async (mockData: WishlistItem[]): Promise<void> => {
  await saveWishlistItemsToAsyncStorage(mockData);
  console.log('Dados mockados da lista de desejos salvos no AsyncStorage.');
};