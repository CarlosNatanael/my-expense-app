// src/data/wishlist.ts

import AsyncStorage from '@react-native-async-storage/async-storage';
import { WishlistItem } from '../types'; // Importe a interface WishlistItem

const WISHLIST_STORAGE_KEY = '@myExpenseApp:wishlist';

// Função para carregar todos os itens da lista de desejos do AsyncStorage
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

// Função para salvar uma lista de itens no AsyncStorage
export const saveWishlistItemsToAsyncStorage = async (items: WishlistItem[]): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(items);
    await AsyncStorage.setItem(WISHLIST_STORAGE_KEY, jsonValue);
    console.log('AsyncStorage Wishlist: Itens salvos:', items);
  } catch (e) {
    console.error('Erro ao salvar itens da lista de desejos no AsyncStorage:', e);
  }
};

// Função para adicionar um novo item à lista de desejos no AsyncStorage
export const addWishlistItemToAsyncStorage = async (newItem: WishlistItem): Promise<WishlistItem[]> => {
  const currentItems = await getWishlistItemsFromAsyncStorage();
  const updatedItems = [...currentItems, newItem];
  await saveWishlistItemsToAsyncStorage(updatedItems);
  return updatedItems;
};

// Função para atualizar um item existente na lista de desejos no AsyncStorage
export const updateWishlistItemInAsyncStorage = async (updatedItem: WishlistItem): Promise<WishlistItem[]> => {
  const currentItems = await getWishlistItemsFromAsyncStorage();
  const updatedItems = currentItems.map(item =>
    item.id === updatedItem.id ? updatedItem : item
  );
  await saveWishlistItemsToAsyncStorage(updatedItems);
  return updatedItems;
};

// Função para deletar um item da lista de desejos do AsyncStorage
export const deleteWishlistItemFromAsyncStorage = async (itemId: string): Promise<void> => {
  const currentItems = await getWishlistItemsFromAsyncStorage();
  const updatedItems = currentItems.filter(item => item.id !== itemId);
  await saveWishlistItemsToAsyncStorage(updatedItems);
};

// Função para popular com dados mockados (para testes iniciais) no AsyncStorage
export const populateWithMockWishlistDataToAsyncStorage = async (mockData: WishlistItem[]): Promise<void> => {
  await saveWishlistItemsToAsyncStorage(mockData);
  console.log('Dados mockados da lista de desejos salvos no AsyncStorage.');
};