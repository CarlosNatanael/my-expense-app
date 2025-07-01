import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../../App';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { formatCurrency } from '../../utils/currencyFormatter';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuth } from '../../contexts/AuthContext';

type HeaderNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

interface HeaderProps {
  currentMonth: string;
  balance: number;
  onPressPreviousMonth: () => void;
  onPressNextMonth: () => void;
  onDateChange: (date: Date) => void;
  selectedDate: Date;
}

const Header: React.FC<HeaderProps> = ({
  currentMonth,
  balance,
  onPressPreviousMonth,
  onPressNextMonth,
  onDateChange,
  selectedDate,
}) => {
  const navigation = useNavigation<HeaderNavigationProp>();
  const { user, signOut } = useAuth();
  const [showDatePicker, setShowDatePicker] = React.useState(false);

  const handleDateChange = (event: any, date?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (date) {
      onDateChange(date);
    }
  };

  const handlePressAccount = () => {
    Alert.alert(
      `Olá, ${user?.fullName || 'Usuário'}!`, // Mostra o nome do usuário
      'O que você gostaria de fazer?',
      [
        {
          text: 'Sair',
          onPress: () => signOut(), // Chama a função de logout
          style: 'destructive',
        },
        {
          text: 'Cancelar',
          style: 'cancel',
        },
      ]
    );
  };

  return (
    <View style={styles.header}>
      <View style={styles.topRow}>
        {/* O botão agora chama a nova função */}
        <TouchableOpacity onPress={handlePressAccount} style={styles.iconButton}>
          <MaterialCommunityIcons name="account-circle-outline" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.balanceTitle}>Saldo do Mês</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Settings')} style={styles.iconButton}>
          <MaterialCommunityIcons name="cog-outline" size={26} color="#fff" />
        </TouchableOpacity>
      </View>
      <Text style={styles.balanceValue}>{formatCurrency(balance)}</Text>
      <View style={styles.monthSelector}>
        <TouchableOpacity onPress={onPressPreviousMonth} style={styles.arrowButton}>
          <MaterialCommunityIcons name="chevron-left" size={30} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setShowDatePicker(true)}>
            <Text style={styles.monthText}>{currentMonth}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onPressNextMonth} style={styles.arrowButton}>
          <MaterialCommunityIcons name="chevron-right" size={30} color="#fff" />
        </TouchableOpacity>
      </View>
       {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
    header: {
        backgroundColor: '#007AFF',
        paddingTop: 40,
        paddingBottom: 20,
        paddingHorizontal: 15,
        borderBottomLeftRadius: 25,
        borderBottomRightRadius: 25,
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    iconButton: {
        padding: 5,
    },
    balanceTitle: {
        color: '#fff',
        fontSize: 16,
        opacity: 0.9,
    },
    balanceValue: {
        color: '#fff',
        fontSize: 36,
        fontWeight: 'bold',
        textAlign: 'center',
        marginVertical: 10,
    },
    monthSelector: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10,
    },
    arrowButton: {
        padding: 5,
    },
    monthText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: '600',
        textTransform: 'capitalize',
    },
});

export default Header;
