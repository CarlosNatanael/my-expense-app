import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Modal,
  TextInput, Alert, Platform
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { v4 as uuidv4 } from 'uuid';
import { WishlistItem } from '../../types';
import { getWishlistItemsFromAsyncStorage, saveWishlistItemsToAsyncStorage } from '../../data/wishlist';
import { formatCurrency } from '../../utils/currencyFormatter';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import FloatingActionButton from '../../components/FloatingActionButton';

const WishlistScreen: React.FC = () => {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentItem, setCurrentItem] = useState<WishlistItem | null>(null);
  const [name, setName] = useState('');
  const [estimatedPrice, setEstimatedPrice] = useState('');
  
  const [desiredDate, setDesiredDate] = useState<Date | undefined>(undefined);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const loadWishlist = useCallback(async () => {
    const items = await getWishlistItemsFromAsyncStorage();
    setWishlist(items);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadWishlist();
    }, [loadWishlist])
  );

  const openModalToAdd = () => {
    setCurrentItem(null);
    setName('');
    setEstimatedPrice('');
    setDesiredDate(undefined);
    setModalVisible(true);
  };

  const openModalToEdit = (item: WishlistItem) => {
    setCurrentItem(item);
    setName(item.name);
    setEstimatedPrice(item.estimatedPrice.toString());
    setDesiredDate(item.desiredDate ? new Date(item.desiredDate) : undefined);
    setModalVisible(true);
  };

  const handleSaveItem = async () => {
    const price = parseFloat(estimatedPrice.replace(',', '.'));
    if (!name || isNaN(price) || price <= 0) {
      Alert.alert('Erro', 'Por favor, preencha o nome e um preço válido.');
      return;
    }

    let updatedList: WishlistItem[];

    if (currentItem) {
      updatedList = wishlist.map(item =>
        item.id === currentItem.id
          ? {
              ...item,
              name,
              estimatedPrice: price,
              desiredDate: desiredDate?.toISOString().split('T')[0],
              status: item.status as WishlistItem['status'],
            }
          : item
      );
    } else {
      const newItem: WishlistItem = {
        id: uuidv4(),
        name,
        estimatedPrice: price,
        status: 'pending' as WishlistItem['status'],
        creationDate: new Date().toISOString(),
        desiredDate: desiredDate?.toISOString().split('T')[0],
      };
      updatedList = [...wishlist, newItem];
    }

    await saveWishlistItemsToAsyncStorage(updatedList);
    setWishlist(updatedList);
    setModalVisible(false);
  };

  const handleDeleteItem = async (id: string) => {
    Alert.alert('Confirmar Exclusão', 'Tem certeza que deseja apagar este item?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Apagar',
        style: 'destructive',
        onPress: async () => {
          const updatedList = wishlist.filter(item => item.id !== id);
          await saveWishlistItemsToAsyncStorage(updatedList);
          setWishlist(updatedList);
        },
      },
    ]);
  };

  const handleToggleStatus = async (item: WishlistItem) => {
    const updatedList = wishlist.map(i =>
      i.id === item.id
        ? { ...i, status: (i.status === 'pending' ? 'bought' : 'pending') as WishlistItem['status'] }
        : i
    );
    await saveWishlistItemsToAsyncStorage(updatedList);
    setWishlist(updatedList);
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
        setDesiredDate(selectedDate);
    }
  };

  const renderItem = ({ item }: { item: WishlistItem }) => (
    <View style={styles.itemContainer}>
      <TouchableOpacity onPress={() => handleToggleStatus(item)} style={styles.statusIcon}>
        <MaterialCommunityIcons
          name={item.status === 'bought' ? 'check-circle' : 'circle-outline'}
          size={26}
          color={item.status === 'bought' ? '#28a745' : '#888'}
        />
      </TouchableOpacity>
      <View style={styles.itemDetails}>
        <Text style={[styles.itemName, item.status === 'bought' && styles.itemNameBought]}>
          {item.name}
        </Text>
        <Text style={styles.itemPrice}>{formatCurrency(item.estimatedPrice)}</Text>
        {item.desiredDate && (
            <View style={styles.dateContainer}>
                <MaterialCommunityIcons name="calendar-clock" size={14} color="#888" />
                <Text style={styles.dateText}>
                    Desejado para: {new Date(item.desiredDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                </Text>
            </View>
        )}
      </View>
      <View style={styles.itemActions}>
        <TouchableOpacity onPress={() => openModalToEdit(item)}>
          <MaterialCommunityIcons name="pencil-outline" size={24} color="#007AFF" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDeleteItem(item.id)} style={{ marginLeft: 15 }}>
          <MaterialCommunityIcons name="trash-can-outline" size={24} color="#d9534f" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={wishlist}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Sua lista de desejos está vazia. Toque no '+' para adicionar um item.</Text>
        }
      />
      <FloatingActionButton onPress={openModalToAdd} />
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{currentItem ? 'Editar Item' : 'Novo Desejo'}</Text>
            <TextInput
              style={styles.input}
              placeholder="Nome do item (ex: Tênis novo)"
              value={name}
              onChangeText={setName}
            />
            <TextInput
              style={styles.input}
              placeholder="Preço estimado (ex: 299,90)"
              keyboardType="numeric"
              value={estimatedPrice}
              onChangeText={setEstimatedPrice}
            />
            <Text style={styles.modalLabel}>Data Desejada (Opcional)</Text>
            <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.datePickerButton}>
                <Text style={styles.datePickerText}>
                    {desiredDate ? desiredDate.toLocaleDateString('pt-BR') : 'Selecione uma data'}
                </Text>
            </TouchableOpacity>
            {showDatePicker && (
                <DateTimePicker
                    value={desiredDate || new Date()}
                    mode="date"
                    display="default"
                    onChange={onDateChange}
                />
            )}
            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={() => setModalVisible(false)}>
                <Text style={styles.buttonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleSaveItem}>
                <Text style={styles.buttonText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8f8f8' },
    listContent: { padding: 15, paddingBottom: 100 },
    emptyText: { textAlign: 'center', marginTop: 50, fontSize: 16, color: '#888' },
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 15,
        marginBottom: 15,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    statusIcon: { marginRight: 15 },
    itemDetails: { flex: 1 },
    itemName: { fontSize: 18, fontWeight: '500', color: '#333' },
    itemNameBought: { textDecorationLine: 'line-through', color: '#aaa' },
    itemPrice: { fontSize: 16, color: '#007AFF', fontWeight: 'bold', marginTop: 4 },
    dateContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
    dateText: { marginLeft: 6, fontSize: 13, color: '#888' },
    itemActions: { flexDirection: 'row' },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        width: '90%',
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 20,
        elevation: 10,
    },
    modalTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        marginBottom: 15,
        fontSize: 16,
    },
    modalLabel: { fontSize: 16, color: '#555', marginBottom: 8, fontWeight: '500' },
    datePickerButton: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        marginBottom: 20,
        alignItems: 'center',
    },
    datePickerText: { fontSize: 16, color: '#333' },
    modalActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
    button: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    cancelButton: { backgroundColor: '#aaa', marginRight: 10 },
    saveButton: { backgroundColor: '#007AFF', marginLeft: 10 },
    buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});

export default WishlistScreen;