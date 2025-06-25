import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, Platform } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../../App';
import { Transaction, TransactionType, TransactionStatus } from '../../types';
import { addTransactionToAsyncStorage, getTransactionsFromAsyncStorage, updateTransactionInAsyncStorage } from '../../data/transactions';
import { v4 as uuidv4 } from 'uuid';

import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import Toast from 'react-native-toast-message';

type AddTransactionScreenRouteProp = RouteProp<RootStackParamList, 'AddTransaction'>;
type AddTransactionScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AddTransaction'>;


const CATEGORIES = [
  'Alimentação', 'Transporte', 'Moradia', 'Lazer', 'Saúde', 'Educação',
  'Contas', 'Salário', 'Compras', 'Cartão', 'Outros', 'Esporte', 'Pets', 'Família'
];

const INSTALLMENT_FREQUENCIES = ['monthly', 'bimonthly', 'quarterly', 'semiannual', 'yearly'];

const AddTransactionScreen: React.FC = () => {
  const navigation = useNavigation<AddTransactionScreenNavigationProp>();
  const route = useRoute<AddTransactionScreenRouteProp>();

  const [id, setId] = useState(uuidv4());
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [type, setType] = useState<TransactionType>('expense');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [status, setStatus] = useState<TransactionStatus>('paid');

  const [frequency, setFrequency] = useState<'once' | 'installment' | 'monthly'>('once');
  const [totalInstallments, setTotalInstallments] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [installmentFrequency, setInstallmentFrequency] = useState(INSTALLMENT_FREQUENCIES[0]);

  useEffect(() => {
    const loadTransactionForEdit = async () => {
      if (route.params?.transactionId) {
        // Usa getTransactionsFromAsyncStorage
        const transactionToEdit = (await getTransactionsFromAsyncStorage()).find(t => t.id === route.params?.transactionId); // <--- USA ASYNCSTORAGE
        
        if (transactionToEdit) {
          setId(transactionToEdit.id);
          setDescription(transactionToEdit.description);
          setAmount(transactionToEdit.amount.toString().replace('.', ','));
          setCategory(transactionToEdit.category);
          setType(transactionToEdit.type);
          setDate(new Date(transactionToEdit.date));
          setFrequency(transactionToEdit.frequency);
          setStatus(transactionToEdit.status);

          if (transactionToEdit.frequency === 'installment') {
            setTotalInstallments(transactionToEdit.totalInstallments?.toString() || '');
            setTotalAmount(transactionToEdit.totalAmount?.toFixed(2).replace('.', ',') || '');
            setInstallmentFrequency(transactionToEdit.installmentFrequency || INSTALLMENT_FREQUENCIES[0]);
          }
        } else {
          Alert.alert('Erro', 'Lançamento não encontrado para edição.');
          navigation.goBack();
        }
      }
    };
    loadTransactionForEdit();
  }, [route.params?.transactionId, navigation]);

  const onDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === 'ios');
    setDate(currentDate);
  };

  const handleSaveTransaction = async () => {
    const parsedAmount = parseFloat(amount.replace(',', '.'));

    if (!description || isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Erro', 'Preencha a descrição e um valor válido.');
      return;
    }

    const formattedDate = date.toISOString().split('T')[0];

    let transactionToSave: Transaction = {
      id: uuidv4(),
      userId: 'default-user', // Substitua por um valor real de userId se necessário
      description,
      amount: parsedAmount,
      date: formattedDate,
      category,
      type,
      status: status,
      frequency,
    };

    if (frequency === 'installment') {
      const parsedTotalInstallments = parseInt(totalInstallments);
      const parsedTotalAmount = parseFloat(totalAmount.replace(',', '.'));

      if (isNaN(parsedTotalInstallments) || parsedTotalInstallments <= 0) {
        Alert.alert('Erro', 'Preencha o número de parcelas válido.');
        return;
      }
      if (isNaN(parsedTotalAmount) || parsedTotalAmount <= 0) {
        Alert.alert('Erro', 'Preencha o valor total da compra válido.');
        return;
      }

      transactionToSave = {
        ...transactionToSave,
        amount: parsedAmount,
        totalAmount: parsedTotalAmount,
        totalInstallments: parsedTotalInstallments,
        currentInstallment: transactionToSave.currentInstallment || 1,
        originalPurchaseDate: transactionToSave.originalPurchaseDate || formattedDate,
        installmentGroupId: transactionToSave.installmentGroupId || uuidv4(),
        installmentFrequency: installmentFrequency,
      };
    } else if (frequency === 'monthly') {
      transactionToSave = {
        ...transactionToSave,
        startDate: transactionToSave.startDate || formattedDate,
      };
    }

    try {
      if (route.params?.transactionId) {
        const existingTransId = route.params.transactionId;
        const updatedTransWithId: Transaction = { ...transactionToSave, id: existingTransId };
        await updateTransactionInAsyncStorage(updatedTransWithId); // <--- USA ASYNCSTORAGE
        Toast.show({ type: 'success', text1: 'Sucesso!', text2: 'Lançamento atualizado com êxito.', visibilityTime: 2000, autoHide: true, topOffset: 30 });
      } else {
        await addTransactionToAsyncStorage(transactionToSave); // <--- USA ASYNCSTORAGE
        Toast.show({ type: 'success', text1: 'Sucesso!', text2: 'Lançamento salvo com êxito.', visibilityTime: 2000, autoHide: true, topOffset: 30 });
      }
      navigation.goBack();
    } catch (error) {
      console.error('Erro ao salvar/atualizar transação:', error);
      Alert.alert('Erro', 'Não foi possível salvar/atualizar o lançamento.');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>{route.params?.transactionId ? 'Editar Lançamento' : 'Novo Lançamento'}</Text>

      {/* ... (campos do formulário) ... */}

      <TouchableOpacity style={styles.saveButton} onPress={handleSaveTransaction}>
        <Text style={styles.saveButtonText}>Salvar Lançamento</Text>
      </TouchableOpacity>

      <View style={{ height: 50 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  contentContainer: {
    padding: 20,
    paddingTop: 0,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 25,
    marginTop: 15,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    color: '#555',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  typeSelector: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  selectedTypeButton: {
    backgroundColor: '#007AFF',
    borderRadius: 7,
  },
  typeButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  selectedTypeButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  pickerItem: {
    fontSize: 16,
  },
  datePickerButton: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  datePickerText: {
    fontSize: 16,
    color: '#333',
  },
  frequencySelector: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  frequencyButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  selectedFrequencyButton: {
    backgroundColor: '#007AFF',
    borderRadius: 7,
  },
  frequencyButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  selectedFrequencyButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#28A745',
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 30,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default AddTransactionScreen;