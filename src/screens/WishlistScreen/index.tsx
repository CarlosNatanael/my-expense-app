import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, TextInput } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../../App';
import { WishlistItem, WishlistItemStatus } from '../../types';
import { formatAmountWithThousandsSeparator } from '../../utils/currencyFormatter';
import { getWishlistItems, addWishlistItem, updateWishlistItem, deleteWishlistItem, populateWithMockWishlistData } from '../../data/wishlist';
import { v4 as uuidv4 } from 'uuid';
import { Ionicons } from '@expo/vector-icons';

// Dados mockados para a lista de desejos
const MOCKED_WISHLIST_ITEMS: WishlistItem[] = [
  { id: uuidv4(), name: 'Novo Celular', estimatedPrice: 1500.00, desiredDate: '30/06/2025', status: 'pending', creationDate: '01/06/2025' },
  { id: uuidv4(), name: 'Tênis de Corrida', estimatedPrice: 400.00, desiredDate: '15/07/2025', status: 'pending', creationDate: '05/06/2025' },
  { id: uuidv4(), name: 'Fone de Ouvido Bluetooth', estimatedPrice: 250.00, desiredDate: '10/06/2025', status: 'pending', creationDate: '08/06/2025' },
  { id: uuidv4(), name: 'Livro "A Arte de Lidar com o Dinheiro"', estimatedPrice: 80.00, desiredDate: '20/05/2025', status: 'bought', creationDate: '15/05/2025' },
];


type WishlistScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Wishlist'>;

const WishlistScreen: React.FC = () => {
  const navigation = useNavigation<WishlistScreenNavigationProp>();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');

  const loadWishlist = useCallback(async () => {
    let items = await getWishlistItems();
    if (items.length === 0) {
      Alert.alert(
        "Lista de Desejos Vazia",
        "Adicionar itens de exemplo à sua lista de desejos?",
        [{ text: "Não", style: "cancel" }, { text: "Sim", onPress: async () => {
          await populateWithMockWishlistData(MOCKED_WISHLIST_ITEMS);
          items = await getWishlistItems();
          setWishlistItems(items);
        }}]
      );
    }
    setWishlistItems(items);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadWishlist();
    }, [loadWishlist])
  );

  const handleAddItem = async () => {
    if (!newItemName.trim() || isNaN(parseFloat(newItemPrice))) {
      Alert.alert('Erro', 'Preencha o nome do item e um preço estimado válido.');
      return;
    }

    const today = new Date().toLocaleDateString('pt-BR'); // Data de criação
    const newItem: WishlistItem = {
      id: uuidv4(),
      name: newItemName.trim(),
      estimatedPrice: parseFloat(newItemPrice.replace(',', '.')),
      status: 'pending',
      creationDate: today,
    };

    try {
      const updatedList = await addWishlistItem(newItem);
      setWishlistItems(updatedList);
      setNewItemName('');
      setNewItemPrice('');
    } catch (error) {
      console.error('Erro ao adicionar item à lista de desejos:', error);
      Alert.alert('Erro', 'Não foi possível adicionar o item.');
    }
  };

  const handleMarkAsBought = async (item: WishlistItem) => {
    Alert.alert(
      'Marcar como Comprado?',
      `Marcar "${item.name}" como comprado?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sim', onPress: async () => {
          try {
            const updatedItem = { ...item, status: 'bought' as WishlistItemStatus };
            const updatedList = await updateWishlistItem(updatedItem);
            setWishlistItems(updatedList);
            Alert.alert('Sucesso', `"${item.name}" marcado como comprado!`);
          } catch (error) {
            console.error('Erro ao marcar item como comprado:', error);
            Alert.alert('Erro', 'Não foi possível marcar o item.');
          }
        }},
      ]
    );
  };

  const handleDeleteItem = async (itemId: string) => {
    Alert.alert(
      'Excluir Item',
      'Tem certeza que deseja excluir este item?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', onPress: async () => {
          try {
            const updatedList = await deleteWishlistItem(itemId);
            setWishlistItems(updatedList);
            Alert.alert('Sucesso', 'Item excluído.');
          } catch (error) {
            console.error('Erro ao excluir item:', error);
            Alert.alert('Erro', 'Não foi possível excluir o item.');
          }
        }},
      ]
    );
  };

  const renderItem = ({ item }: { item: WishlistItem }) => (
    <View style={styles.itemContainer}>
      <View style={styles.itemDetails}>
        <Text style={[styles.itemName, item.status === 'bought' && styles.itemBought]}>{item.name}</Text>
        <Text style={styles.itemPrice}>R$ {formatAmountWithThousandsSeparator(item.estimatedPrice)}</Text>
        {item.desiredDate && <Text style={styles.itemDate}>Data Desejada: {item.desiredDate}</Text>}
      </View>
      <View style={styles.itemActions}>
        {item.status === 'pending' && (
          <TouchableOpacity onPress={() => handleMarkAsBought(item)} style={styles.actionButton}>
            <Ionicons name="checkmark-circle-outline" size={24} color="#2ECC71" />
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={() => handleDeleteItem(item.id)} style={styles.actionButton}>
          <Ionicons name="trash-outline" size={24} color="#E74C3C" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Minha Lista de Desejos</Text>

      <View style={styles.addForm}>
        <TextInput
          style={styles.input}
          placeholder="Nome do Item"
          value={newItemName}
          onChangeText={setNewItemName}
        />
        <TextInput
          style={styles.input}
          placeholder="Preço Estimado"
          keyboardType="numeric"
          value={newItemPrice}
          onChangeText={text => setNewItemPrice(text.replace('.', ',').replace(/[^0-9,]/g, ''))}
        />
        <TouchableOpacity style={styles.addButton} onPress={handleAddItem}>
          <Text style={styles.addButtonText}>Adicionar à Lista</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={wishlistItems}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.emptyListText}>Sua lista de desejos está vazia!</Text>}
        style={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    padding: 20,
    paddingTop: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  addForm: {
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  input: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  addButton: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  list: {
    flex: 1,
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  itemBought: {
    textDecorationLine: 'line-through',
    color: '#888',
  },
  itemPrice: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  itemDate: {
    fontSize: 13,
    color: '#999',
    marginTop: 3,
  },
  itemActions: {
    flexDirection: 'row',
    marginLeft: 10,
  },
  actionButton: {
    marginLeft: 10,
    padding: 5,
  },
  emptyListText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#888',
  },
});

export default WishlistScreen;