import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  const renderItem = ({ item }) => (
    <View style={styles.transactionItem}>
      <Text style={styles.date}>{item.date}</Text>
      <Text style={styles.description}>{item.description}</Text>
      <Text style={styles.amount}>{item.amount}</Text>
      <TouchableOpacity style={styles.viewButton}>
        <Text style={styles.viewButtonText}>👁️</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Transaction History</Text>
      </View>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={(item) => item.id?.toString() || item.description}
          renderItem={renderItem}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
          <Text style={styles.emptyMessage}>No transactions available</Text>
            </View>
        }
        contentContainerStyle={{ flexGrow: 1 }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0', // Consistent background color
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#6200ee', // Header background color
    padding: 15,
    elevation: 4, // for shadow on Android
    shadowColor: '#000', // for shadow on iOS
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  headerText: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF', // Header text color
    textAlign: 'center',
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFF', // Card background color
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginHorizontal: 10,
    marginVertical: 5,
    borderRadius: 5,
  },
  date: {
    fontSize: 16,
    color: '#333',
  },
  description: {
    fontSize: 16,
    color: '#333',
    flex: 1,
    marginLeft: 10,
  },
  amount: {
    fontSize: 16,
    color: '#333',
    fontWeight: 'bold',
  },
  viewButton: {
    padding: 8,
    backgroundColor: '#6200ee', // Button background color
    borderRadius: 5,
  },
  viewButtonText: {
    fontSize: 16,
    color: '#FFF', // Button text color
  },
  emptyMessage: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default TransactionHistory;
