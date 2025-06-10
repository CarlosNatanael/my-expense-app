import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../../App';
import { Transaction, TransactionType } from '../../types'; // Importe os tipos
import { addTransaction } from '../../data/transactions'; // Importe a função para adicionar transações
import { v4 as uuidv4 } from 'uuid'; // Para gerar IDs únicos (precisa instalar)

// Importe o DateTimePicker e Picker
import DateTimePicker from '@react-native-community/datetimepicker'; // Para selecionar data
import { Picker } from '@react-native-picker/picker'; // Para selecionar categoria/tipo (se preferir)

// Tipando as props de navegação
type AddTransactionScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AddTransaction'>;

// Definindo as categorias padrão (você pode expandir isso)
const CATEGORIES = [
  'Alimentação', 'Transporte', 'Moradia', 'Lazer', 'Saúde', 'Educação',
  'Contas', 'Salário', 'Compras', 'Outros'
];

const AddTransactionScreen: React.FC = () => {
  const navigation = useNavigation<AddTransactionScreenNavigationProp>();

  // Estados para os campos do formulário
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState(''); // Armazenar como string para TextInput
  const [category, setCategory] = useState(CATEGORIES[0]); // Categoria inicial
  const [type, setType] = useState<TransactionType>('expense'); // 'expense' ou 'income'
  const [date, setDate] = useState(new Date()); // Data da transação
  const [showDatePicker, setShowDatePicker] = useState(false); // Para controlar a visibilidade do date picker

  // Estados para a frequência (única, parcelada, recorrente)
  const [frequency, setFrequency] = useState<'once' | 'installment' | 'monthly'>('once');
  const [totalInstallments, setTotalInstallments] = useState(''); // Número de parcelas
  const [totalAmountInstallment, setTotalAmountInstallment] = useState(''); // Valor total da compra parcelada

  const onDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === 'ios'); // Fecha em iOS, Android já fecha
    setDate(currentDate);
  };

  const handleSaveTransaction = async () => {
    const parsedAmount = parseFloat(amount.replace(',', '.')); // Converte para número float

    if (!description || isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Erro', 'Preencha a descrição e um valor válido.');
      return;
    }

    // Lógica para determinar o amount final (receita é positiva, despesa é negativa)
    const finalAmount = type === 'income' ? parsedAmount : -parsedAmount;

    // Converte a data para o formato YYYY-MM-DD para salvar
    const formattedDate = date.toISOString().split('T')[0];

    // Cria a transação base
    let newTransaction: Transaction = {
      id: uuidv4(), // Gera um ID único
      description,
      amount: parsedAmount, // Mantemos o amount como positivo para a interface base
      date: formattedDate,
      category,
      type,
      status: 'paid', // Por padrão, consideramos paga ao adicionar
      frequency,
    };

    // Adiciona campos específicos com base na frequência
    if (frequency === 'installment') {
      const parsedTotalInstallments = parseInt(totalInstallments);
      const parsedTotalAmountInstallment = parseFloat(totalAmountInstallment.replace(',', '.'));

      if (isNaN(parsedTotalInstallments) || parsedTotalInstallments <= 0 ||
          isNaN(parsedTotalAmountInstallment) || parsedTotalAmountInstallment <= 0) {
        Alert.alert('Erro', 'Preencha o valor total da compra e o número de parcelas válidos.');
        return;
      }

      // Calcula o valor de uma única parcela
      const installmentAmount = parsedTotalAmountInstallment / parsedTotalInstallments;

      // Cuidado aqui: para parceladas, o "amount" na lista é o da parcela
      // Mas o "totalAmount" é o da compra original.
      // O `amount` que vai ser usado na `FlatList` é o `installmentAmount`
      // A `TransactionListItem` já está preparada para exibir `totalAmount` e `totalInstallments`
      newTransaction = {
        ...newTransaction,
        amount: installmentAmount, // Valor da parcela para exibição na lista
        totalAmount: parsedTotalAmountInstallment,
        totalInstallments: parsedTotalInstallments,
        currentInstallment: 1, // Assumimos que estamos adicionando a primeira parcela
        originalPurchaseDate: formattedDate, // Data da compra original
        installmentGroupId: uuidv4(), // ID para agrupar todas as parcelas dessa compra
      } as Transaction; // Type assertion para garantir que os campos opcionais são adicionados

      // IMPORTANTE: Para despesas parceladas, você pode querer adicionar todas as parcelas de uma vez
      // ou apenas a primeira e gerar as outras dinamicamente.
      // Por enquanto, vamos adicionar apenas a primeira parcela para simplificar.
      // A lógica de exibição em HomeScreen precisa evoluir para gerar as parcelas futuras.
    } else if (frequency === 'monthly') {
      newTransaction = {
        ...newTransaction,
        startDate: formattedDate, // Data de início da recorrência
      } as Transaction;
    }

    const updatedTransactions = await addTransaction(newTransaction);
    console.log('Transação salva:', newTransaction);
    // TODO: Recarregar transações na HomeScreen após salvar (usando useFocusEffect)
    navigation.goBack(); // Volta para a tela anterior
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>Adicionar Novo Lançamento</Text>

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
          onChangeText={text => setAmount(text.replace('.', ',').replace(/[^0-9,]/g, ''))} // Permite apenas números e vírgula
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
            itemStyle={styles.pickerItem}
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
            testID="datePicker"
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

      {/* Campos Condicionais para Frequência */}
      {frequency === 'installment' && (
        <>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Valor Total da Compra</Text>
            <TextInput
              style={styles.input}
              placeholder="R$ 0,00"
              keyboardType="numeric"
              value={totalAmountInstallment}
              onChangeText={text => setTotalAmountInstallment(text.replace('.', ',').replace(/[^0-9,]/g, ''))}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Número de Parcelas</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: 12"
              keyboardType="numeric"
              value={totalInstallments}
              onChangeText={text => setTotalInstallments(text.replace(/[^0-9]/g, ''))} // Apenas números
            />
          </View>
        </>
      )}

      {/* Salvar Botão */}
      <TouchableOpacity style={styles.saveButton} onPress={handleSaveTransaction}>
        <Text style={styles.saveButtonText}>Salvar Lançamento</Text>
      </TouchableOpacity>

      <View style={{ height: 50 }} />{/* Espaço para o final do scroll */}
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
    backgroundColor: '#007AFF', // Azul para selecionado
    borderRadius: 7, // Arredondamento interno
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
    overflow: 'hidden', // Importante para o Picker no Android
  },
  picker: {
    height: 50,
    width: '100%',
  },
  pickerItem: {
    fontSize: 16, // Pode não ser totalmente controlável em todas as plataformas
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
    backgroundColor: '#28A745', // Verde para salvar
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