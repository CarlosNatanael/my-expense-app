import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, Platform, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import Toast from 'react-native-toast-message';

import { useAuth } from '../../contexts/AuthContext';
import { addTransactionToServer } from '../../services/api';
import { TransactionType, TransactionStatus } from '../../types';

const CATEGORIES = [
  'Alimentação', 'Transporte', 'Moradia', 'Lazer', 'Saúde', 'Educação',
  'Contas', 'Salário', 'Compras', 'Cartão', 'Outros', 'Esporte', 'Pets', 'Família'
];

const AddTransactionScreen: React.FC = () => {
  const navigation = useNavigation();
  const { token } = useAuth(); // Pega o token do usuário logado

  // Mantemos todos os seus estados para a UI
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [type, setType] = useState<TransactionType>('expense');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [status, setStatus] = useState<TransactionStatus>('paid');
  const [frequency, setFrequency] = useState<'once' | 'installment' | 'monthly'>('once');
  const [isLoading, setIsLoading] = useState(false);

  // A lógica de edição foi removida por enquanto, pois o backend ainda não tem essa rota.
  // Focaremos em adicionar novos lançamentos.

  const onDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === 'ios');
    setDate(currentDate);
  };

  const handleSaveTransaction = async () => {
    if (!token) {
      return Alert.alert('Erro', 'Você precisa estar logado para adicionar uma transação.');
    }

    // Por enquanto, vamos conectar apenas a funcionalidade de transação 'Única'
    if (frequency !== 'once') {
        return Alert.alert('Em desenvolvimento', 'A funcionalidade de salvar parcelas e recorrências no servidor ainda está sendo construída.');
    }

    const parsedAmount = parseFloat(amount.replace(',', '.'));
    if (!description || isNaN(parsedAmount) || parsedAmount <= 0) {
      return Alert.alert('Erro', 'Preencha a descrição e um valor válido.');
    }

    setIsLoading(true);
    try {
      // O objeto enviado deve corresponder ao que o tipo Transaction espera
      const transactionData = {
        description: description,
        amount: parsedAmount,
        type: type,
        date: date.toISOString().split('T')[0],
        category: category,
        status: status,
        frequency: frequency,
      };

      await addTransactionToServer(transactionData, token);
      
      Toast.show({ type: 'success', text1: 'Sucesso!', text2: 'Lançamento salvo no servidor.' });
      navigation.goBack();

    } catch (error) {
      console.error("Erro ao salvar transação:", error);
      // O alerta de erro já é mostrado pela nossa função `apiFetch`
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>Novo Lançamento</Text>

      {/* Tipo de Lançamento (Receita/Despesa) */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Tipo de Lançamento</Text>
        <View style={styles.typeSelector}>
          <TouchableOpacity
            style={[styles.typeButton, type === 'expense' && styles.selectedTypeButton]}
            onPress={() => setType('expense')}
          >
            <Text style={[styles.typeButtonText, type === 'expense' && styles.selectedTypeButtonText]}>Despesa</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.typeButton, type === 'income' && styles.selectedTypeButton]}
            onPress={() => setType('income')}
          >
            <Text style={[styles.typeButtonText, type === 'income' && styles.selectedTypeButtonText]}>Receita</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Descrição */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Descrição</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Almoço com amigos"
          value={description}
          onChangeText={setDescription}
        />
      </View>

      {/* Valor */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Valor</Text>
        <TextInput
          style={styles.input}
          placeholder="R$ 0,00"
          keyboardType="numeric"
          value={amount}
          onChangeText={text => setAmount(text.replace('.', ',').replace(/[^0-9,]/g, ''))}
        />
      </View>

      {/* Categoria */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Categoria</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={category}
            onValueChange={(itemValue: string) => setCategory(itemValue)}
            style={styles.picker}
            mode="dropdown"
          >
            {CATEGORIES.map((cat) => (
              <Picker.Item key={cat} label={cat} value={cat} />
            ))}
          </Picker>
        </View>
      </View>

      {/* Data */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Data</Text>
        <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.datePickerButton}>
          <Text style={styles.datePickerText}>{date.toLocaleDateString('pt-BR')}</Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            onChange={onDateChange}
          />
        )}
      </View>

      {/* Frequência (Única, Parcelada, Recorrente) */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Frequência</Text>
        <View style={styles.frequencySelector}>
          <TouchableOpacity
            style={[styles.frequencyButton, frequency === 'once' && styles.selectedFrequencyButton]}
            onPress={() => setFrequency('once')}
          >
            <Text style={[styles.frequencyButtonText, frequency === 'once' && styles.selectedFrequencyButtonText]}>Única</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.frequencyButton, frequency === 'installment' && styles.selectedFrequencyButton]}
            onPress={() => setFrequency('installment')}
          >
            <Text style={[styles.frequencyButtonText, frequency === 'installment' && styles.selectedFrequencyButtonText]}>Parcelada</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.frequencyButton, frequency === 'monthly' && styles.selectedFrequencyButton]}
            onPress={() => setFrequency('monthly')}
          >
            <Text style={[styles.frequencyButtonText, frequency === 'monthly' && styles.selectedFrequencyButtonText]}>Recorrente</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Salvar Botão */}
      <TouchableOpacity style={styles.saveButton} onPress={handleSaveTransaction} disabled={isLoading}>
        {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>Salvar Lançamento</Text>}
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