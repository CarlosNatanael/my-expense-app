import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type FloatingActionButtonProps = {
  onPress: () => void;
};

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ onPress }) => {
  return (
    <TouchableOpacity style={styles.fab} onPress={onPress}>
      <Ionicons name="add" size={30} color="#fff" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: 'absolute', // Posiciona o botão de forma absoluta na tela
    width: 60,
    height: 60,
    borderRadius: 30, // Metade da largura/altura para um círculo perfeito
    backgroundColor: '#007AFF', // Azul, como na UI
    justifyContent: 'center',
    alignItems: 'center',
    bottom: 25, // Distância do fundo
    right: 25, // Distância da direita
    elevation: 6, // Sombra para Android
    shadowColor: '#000', // Sombra para iOS
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    zIndex: 10, // Garante que o botão fique por cima de outros elementos
  },
});

export default FloatingActionButton;