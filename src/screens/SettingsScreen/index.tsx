import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import Toast from 'react-native-toast-message';

import { getTransactionsFromAsyncStorage, saveTransactionsToAsyncStorage } from '../../data/transactions';
import { getWishlistItemsFromAsyncStorage, saveWishlistItemsToAsyncStorage } from '../../data/wishlist';
import { useNavigation } from '@react-navigation/native';

const SettingsScreen: React.FC = () => {
  const navigation = useNavigation();

  const handleExportData = async () => {
    try {
      // 1. Coletar todos os dados do aplicativo
      const transactions = await getTransactionsFromAsyncStorage();
      const wishlist = await getWishlistItemsFromAsyncStorage();

      const backupData = {
        transactions,
        wishlist,
        exportDate: new Date().toISOString(),
      };

      const backupJson = JSON.stringify(backupData, null, 2);
      const fileName = `MinhasDispesas_Backup_${new Date().toISOString().split('T')[0]}.json`;
      const fileUri = FileSystem.documentDirectory + fileName;

      // 2. Salvar os dados em um arquivo JSON temporário
      await FileSystem.writeAsStringAsync(fileUri, backupJson, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      // 3. Usar a API de compartilhamento para o usuário salvar o arquivo
      if (!(await Sharing.isAvailableAsync())) {
        Alert.alert('Erro', 'O compartilhamento não está disponível neste dispositivo.');
        return;
      }
      
      await Sharing.shareAsync(fileUri);
      Toast.show({ type: 'success', text1: 'Arquivo de backup pronto para compartilhar!' });

    } catch (error) {
      console.error('Erro ao exportar dados:', error);
      Alert.alert('Erro', 'Ocorreu um erro ao exportar seus dados.');
    }
  };

  const handleImportData = async () => {
    try {
      // 1. Abrir o seletor de documentos para o usuário escolher o backup
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return; // O usuário cancelou
      }

      const fileUri = result.assets[0].uri;
      const fileContent = await FileSystem.readAsStringAsync(fileUri);
      const importedData = JSON.parse(fileContent);

      // 2. Validar se o arquivo parece ser um backup válido
      if (!importedData.transactions || !importedData.wishlist) {
        throw new Error('Arquivo de backup inválido ou corrompido.');
      }
      
      // 3. ALERTA CRÍTICO: Confirmar com o usuário antes de sobrescrever os dados
      Alert.alert(
        'Confirmar Importação',
        'Tem certeza? A importação irá substituir TODOS os seus dados atuais. Esta ação não pode ser desfeita.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { 
            text: 'Confirmar e Substituir', 
            style: 'destructive', 
            onPress: async () => {
              // 4. Salvar os dados importados no AsyncStorage
              await saveTransactionsToAsyncStorage(importedData.transactions);
              await saveWishlistItemsToAsyncStorage(importedData.wishlist);
              
              Toast.show({ type: 'success', text1: 'Sucesso!', text2: 'Seus dados foram importados.' });

              // Opcional: navegar de volta ou forçar a atualização da home
              if(navigation.canGoBack()) {
                navigation.goBack();
              }
            }
          },
        ]
      );

    } catch (error) {
      console.error('Erro ao importar dados:', error);
      Alert.alert('Erro', 'Ocorreu um erro ao importar o arquivo. Verifique se o arquivo é um backup válido.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Backup e Restauração</Text>
        <Text style={styles.subtitle}>
          Exporte seus dados para um arquivo ou importe um backup para restaurar suas informações.
        </Text>
      </View>

      {/* Card de Exportação */}
      <View style={styles.card}>
        <MaterialCommunityIcons name="database-export-outline" size={40} color="#007AFF" />
        <View style={styles.cardTextContainer}>
          <Text style={styles.cardTitle}>Exportar Dados</Text>
          <Text style={styles.cardDescription}>
            Cria um arquivo de backup (JSON) com todos os seus lançamentos e lista de desejos. Você poderá salvar este arquivo em seu dispositivo ou compartilhá-lo na nuvem.
          </Text>
        </View>
        <TouchableOpacity style={styles.button} onPress={handleExportData}>
          <Text style={styles.buttonText}>Exportar</Text>
        </TouchableOpacity>
      </View>

      {/* Card de Importação */}
      <View style={styles.card}>
        <MaterialCommunityIcons name="database-import-outline" size={40} color="#28A745" />
        <View style={styles.cardTextContainer}>
          <Text style={styles.cardTitle}>Importar Dados</Text>
          <Text style={styles.cardDescription}>
            Restaura seus dados a partir de um arquivo de backup. ATENÇÃO: Isso substituirá todos os dados existentes no aplicativo.
          </Text>
        </View>
        <TouchableOpacity style={[styles.button, styles.importButton]} onPress={handleImportData}>
          <Text style={styles.buttonText}>Importar</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f8f8',
    },
    header: {
        padding: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 15,
        color: '#666',
        textAlign: 'center',
        marginTop: 8,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        margin: 20,
        padding: 20,
        alignItems: 'center',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    cardTextContainer: {
        marginVertical: 15,
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#333',
        textAlign: 'center',
    },
    cardDescription: {
        fontSize: 14,
        color: '#555',
        textAlign: 'center',
        marginTop: 8,
        lineHeight: 20,
    },
    button: {
        backgroundColor: '#007AFF',
        borderRadius: 10,
        paddingVertical: 12,
        paddingHorizontal: 30,
        width: '100%',
        alignItems: 'center',
    },
    importButton: {
        backgroundColor: '#28A745',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default SettingsScreen;

