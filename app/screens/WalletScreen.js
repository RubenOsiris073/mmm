import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  FlatList,
  StatusBar,
  Platform
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';

const WalletScreen = () => {
  const { user, logout } = useAuth();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  // Datos de ejemplo - después conectaremos con Firebase
  const mockTransactions = [
    {
      id: '1',
      type: 'entrada',
      amount: 500,
      description: 'Depósito inicial',
      date: new Date('2025-06-01'),
      status: 'completada'
    },
    {
      id: '2',
      type: 'salida',
      amount: 120,
      description: 'Compra en MMM Aguachile',
      date: new Date('2025-06-02'),
      status: 'completada'
    },
    {
      id: '3',
      type: 'entrada',
      amount: 200,
      description: 'Recarga de saldo',
      date: new Date('2025-06-05'),
      status: 'pendiente'
    }
  ];

  useEffect(() => {
    loadWalletData();
  }, []);

  const loadWalletData = async () => {
    setLoading(true);
    try {
      // Aquí cargaremos los datos reales desde Firebase
      // Por ahora usamos datos de ejemplo
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simular carga
      
      setTransactions(mockTransactions);
      const calculatedBalance = mockTransactions
        .filter(t => t.status === 'completada')
        .reduce((sum, t) => {
          return t.type === 'entrada' ? sum + t.amount : sum - t.amount;
        }, 0);
      setBalance(calculatedBalance);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los datos del wallet');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro que deseas cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Cerrar Sesión', 
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              Alert.alert('Error', 'No se pudo cerrar la sesión');
            }
          }
        }
      ]
    );
  };

  const formatCurrency = (amount) => {
    return `$${amount.toFixed(2)}`;
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderTransaction = ({ item }) => (
    <View style={styles.transactionItem}>
      <View style={styles.transactionMain}>
        <View style={styles.transactionInfo}>
          <Text style={styles.transactionDescription}>{item.description}</Text>
          <Text style={styles.transactionDate}>{formatDate(item.date)}</Text>
        </View>
        <View style={styles.transactionAmount}>
          <Text style={[
            styles.transactionAmountText,
            item.type === 'entrada' ? styles.transactionIncome : styles.transactionExpense
          ]}>
            {item.type === 'entrada' ? '+' : '-'}{formatCurrency(item.amount)}
          </Text>
          <Text style={[
            styles.transactionStatus,
            item.status === 'completada' ? styles.statusCompleted : styles.statusPending
          ]}>
            {item.status}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
      <SafeAreaView style={styles.container}>
        {/* Header con espaciado desde el status bar */}
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeText}>Bienvenido</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Salir</Text>
          </TouchableOpacity>
        </View>

        <ScrollView 
          style={styles.content}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={loadWalletData} />
          }
        >
          {/* Balance Card */}
          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Saldo Disponible</Text>
            <Text style={styles.balanceAmount}>{formatCurrency(balance)}</Text>
            <View style={styles.balanceActions}>
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionButtonText}>Recargar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionButton, styles.actionButtonSecondary]}>
                <Text style={[styles.actionButtonText, styles.actionButtonTextSecondary]}>
                  Enviar
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Transactions */}
          <View style={styles.transactionsSection}>
            <Text style={styles.sectionTitle}>Transacciones Recientes</Text>
            
            {transactions.length > 0 ? (
              <FlatList
                data={transactions}
                renderItem={renderTransaction}
                keyExtractor={item => item.id}
                scrollEnabled={false}
                showsVerticalScrollIndicator={false}
              />
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No hay transacciones aún</Text>
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    // Agregar padding top para separar del status bar
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 30, // Espaciado adicional desde el status bar
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  welcomeText: {
    fontSize: 16,
    color: '#666',
  },
  userEmail: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  logoutButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#dc3545',
  },
  logoutButtonText: {
    color: '#dc3545',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  balanceCard: {
    backgroundColor: '#2c5530',
    borderRadius: 16,
    padding: 24,
    marginVertical: 20,
    alignItems: 'center',
  },
  balanceLabel: {
    color: '#ffffff',
    fontSize: 16,
    marginBottom: 8,
  },
  balanceAmount: {
    color: '#ffffff',
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  balanceActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  actionButtonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#ffffff',
  },
  actionButtonText: {
    color: '#2c5530',
    fontWeight: 'bold',
    fontSize: 16,
  },
  actionButtonTextSecondary: {
    color: '#ffffff',
  },
  transactionsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  transactionItem: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  transactionMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 14,
    color: '#666',
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  transactionAmountText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  transactionIncome: {
    color: '#28a745',
  },
  transactionExpense: {
    color: '#dc3545',
  },
  transactionStatus: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  statusCompleted: {
    color: '#28a745',
  },
  statusPending: {
    color: '#ffc107',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
  },
});

export default WalletScreen;