import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
  Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import TransactionService, { Transaction } from '../services/TransactionService';
import Icon from 'react-native-vector-icons/MaterialIcons';

const TransactionHistoryScreen: React.FC = () => {
  const navigation = useNavigation();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Usuario temporal para demostración - en una implementación real, esto vendría del contexto de autenticación
  const currentUserId = 'usuario1'; 

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const data = await TransactionService.getUserTransactions(currentUserId);
      setTransactions(data);
    } catch (error) {
      Alert.alert(
        'Error',
        'No se pudieron cargar las transacciones. Intenta nuevamente.'
      );
      console.error('Error cargando transacciones:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadTransactions();
  };

  const handleTransactionPress = (transaction: Transaction) => {
    // Aquí se puede implementar la navegación al detalle de la transacción
    Alert.alert(
      `Detalles de transacción`,
      `ID: ${transaction.id}\nMonto: $${transaction.amount.toFixed(2)}\nFecha: ${TransactionService.formatTransactionDate(transaction.timestamp)}\nDescripción: ${transaction.description}`
    );
  };

  // Renderizar cada item de transacción
  const renderTransactionItem = ({ item }: { item: Transaction }) => {
    const isPayment = item.type.toLowerCase() === 'payment';
    const amountColor = isPayment ? '#e53935' : '#43a047'; // Rojo para pagos, verde para otros tipos
    const amountPrefix = isPayment ? '-' : '+';

    return (
      <TouchableOpacity 
        style={styles.transactionItem}
        onPress={() => handleTransactionPress(item)}
      >
        <View style={styles.iconContainer}>
          <Icon 
            name={TransactionService.getTransactionIcon(item.type)} 
            size={28} 
            color={isPayment ? '#e53935' : '#43a047'} 
          />
        </View>
        
        <View style={styles.transactionInfo}>
          <Text style={styles.transactionDescription}>
            {item.description}
          </Text>
          <Text style={styles.transactionDate}>
            {TransactionService.formatTransactionDate(item.timestamp)}
          </Text>
        </View>
        
        <View style={styles.amountContainer}>
          <Text style={[styles.transactionAmount, { color: amountColor }]}>
            {amountPrefix}${item.amount.toFixed(2)}
          </Text>
          <Text style={styles.transactionStatus}>
            {item.status === 'completed' ? 'Completada' : 'Pendiente'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  // Renderizar separador entre items
  const renderSeparator = () => <View style={styles.separator} />;

  // Renderizar cuando no hay transacciones
  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Icon name="receipt-long" size={64} color="#bdbdbd" />
      <Text style={styles.emptyText}>No hay transacciones disponibles</Text>
      <TouchableOpacity style={styles.refreshButton} onPress={loadTransactions}>
        <Text style={styles.refreshButtonText}>Actualizar</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#1976d2" barStyle="light-content" />
      
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Historial de Transacciones</Text>
      </View>
      
      {loading && !refreshing ? (
        <ActivityIndicator style={styles.loader} size="large" color="#1976d2" />
      ) : (
        <FlatList
          data={transactions}
          renderItem={renderTransactionItem}
          keyExtractor={(item) => item.id}
          ItemSeparatorComponent={renderSeparator}
          contentContainerStyle={transactions.length === 0 ? styles.flatListEmpty : styles.flatList}
          ListEmptyComponent={renderEmptyList}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#1976d2']}
            />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#1976d2',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 16,
    padding: 4,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  transactionItem: {
    backgroundColor: '#fff',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 12,
    color: '#757575',
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  transactionStatus: {
    fontSize: 12,
    color: '#757575',
    marginTop: 4,
  },
  separator: {
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#757575',
    marginTop: 16,
    marginBottom: 24,
  },
  refreshButton: {
    backgroundColor: '#1976d2',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  flatList: {
    paddingBottom: 16,
  },
  flatListEmpty: {
    flex: 1,
  },
});

export default TransactionHistoryScreen;