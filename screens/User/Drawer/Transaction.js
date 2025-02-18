import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  ActivityIndicator, 
  TouchableOpacity, 
  Animated, 
  RefreshControl,
  Modal,
  Pressable 
} from 'react-native';
import { collection, query, where, orderBy, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { auth, firestore } from '../../../firebaseConfig';
import { MaterialIcons } from '@expo/vector-icons';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/FontAwesome';



const theme = {
  primary: '#4A90E2',
  secondary: '#50E3C2',
  background: '#F5F7FA',
  surface: '#FFFFFF',
  accent1: '#FF6B6B',
  accent2: '#FFA400',
  accent3: '#4ECDC4',
  text: {
    primary: '#1A1F36',
    secondary: '#4E5D78',
    light: '#FFFFFF',
  },
  status: {
    completed: '#10B981',
    pending: '#F59E0B',
    failed: '#EF4444',
  },
  delete: '#DC2626',
  border: '#E5E7EB',
};

const BORDER_RADIUS = 16;
const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

const Transaction = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  let row = [];
  let prevOpenedRow;

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      console.log('No user logged in');
      setLoading(false);
      return;
    }

    const q = query(
      collection(firestore, 'payments'),
      where('userId', '==', user.uid),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, 
      (querySnapshot) => {
        const transactionData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setTransactions(transactionData);
        setLoading(false);
        setRefreshing(false);
      },
      (error) => {
        console.error('Error listening to transactions:', error);
        setLoading(false);
        setRefreshing(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return theme.status.completed;
      case 'pending':
        return theme.status.pending;
      case 'failed':
        return theme.status.failed;
      default:
        return theme.text.secondary;
    }
  };

  
  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'check-circle';
      case 'pending':
        return 'schedule';
      case 'failed':
        return 'error';
      default:
        return 'help';
    }
  };

  const formatDate = (timestamp) => {
    const date = timestamp.toDate();
    return new Intl.DateTimeFormat('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
    }).format(amount);
  };

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleDeletePress = (transaction) => {
    setSelectedTransaction(transaction);
    setDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    if (selectedTransaction) {
      try {
        await deleteDoc(doc(firestore, 'payments', selectedTransaction.id));
        if (prevOpenedRow) {
          prevOpenedRow.close();
        }
        Toast.show({
          type: 'success',
          text1: 'Deleted Successfully',
          text2: 'Transaction has been deleted.',
          position: 'top',
          visibilityTime: 4000
        });
      } catch (error) {
        console.error('Error deleting transaction:', error);
        Toast.show({
          type: 'error',
          text1: 'Delete Failed',
          text2: 'Could not delete the transaction. Please try again.',
          position: 'top',
          visibilityTime: 4000
        });
      } finally {
        setDeleteModalVisible(false);
        setSelectedTransaction(null);
      }
    }
   };

  const cancelDelete = () => {
    setDeleteModalVisible(false);
    setSelectedTransaction(null);
    if (prevOpenedRow) {
      prevOpenedRow.close();
    }
  };

  const closeRow = (index) => {
    if (prevOpenedRow && prevOpenedRow !== row[index]) {
      prevOpenedRow.close();
    }
    prevOpenedRow = row[index];
  };

  const renderRightActions = (progress, dragX, item) => {
    const trans = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [0, 100],
    });

    const opacity = dragX.interpolate({
      inputRange: [-100, -20],
      outputRange: [1, 0],
    });

    return (
      <View style={styles.rightActionsContainer}>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeletePress(item)}
        >
          <Animated.View
            style={[
              styles.deleteButtonContent,
              {
                transform: [{ translateX: trans }],
                opacity,
              },
            ]}
          >
            <MaterialIcons name="delete" size={24} color={theme.text.light} />
            <Text style={styles.deleteButtonText}>Delete</Text>
          </Animated.View>
        </TouchableOpacity>
      </View>
    );
  };

  const renderTransaction = ({ item, index }) => (
    <View style={styles.itemContainer}>
      <Swipeable
        ref={(ref) => (row[index] = ref)}
        renderRightActions={(progress, dragX) => 
          renderRightActions(progress, dragX, item)
        }
        onSwipeableOpen={() => closeRow(index)}
        rightOpenValue={-100}
        overshootRight={false}
      >
        <View style={styles.transactionItem}>
          <View style={styles.transactionHeader}>
            <View style={styles.headerLeft}>
              <Text style={styles.transactionDate}>
                {formatDate(item.timestamp)}
              </Text>
              <Text style={styles.transactionId}>ID: {item.paymentId}</Text>
            </View>
            <View style={[styles.statusContainer, { backgroundColor: getStatusColor(item.paymentStatus) + '20' }]}>
              <MaterialIcons 
                name={getStatusIcon(item.paymentStatus)} 
                size={16} 
                color={getStatusColor(item.paymentStatus)} 
                style={styles.statusIcon}
              />
              <Text style={[styles.statusText, { color: getStatusColor(item.paymentStatus) }]}>
                {item.paymentStatus}
              </Text>
            </View>
          </View>

          <View style={styles.transactionBody}>
            <View style={styles.amountContainer}>
              <Text style={styles.amountLabel}>Amount</Text>
              <Text style={styles.amountText}>{formatAmount(item.amount)}</Text>
            </View>

            <View style={styles.detailsGrid}>
              <View style={styles.detailItem}>
                <MaterialIcons name="payment" size={20} color={theme.accent1} />
                <View style={styles.detailTextContainer}>
                  <Text style={styles.detailLabel}>Payment Method</Text>
                  <Text style={styles.detailValue}>{item.paymentMethod}</Text>
                </View>
              </View>

              <View style={styles.detailItem}>
                <MaterialIcons name="description" size={20} color={theme.accent3} />
                <View style={styles.detailTextContainer}>
                  <Text style={styles.detailLabel}>Certificate Type</Text>
                  <Text style={styles.detailValue}>{item.certificateType}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </Swipeable>
    </View>
  );

  const DeleteConfirmationModal = () => (
    <Modal
      animationType="fade"
      transparent={true}
      visible={deleteModalVisible}
      onRequestClose={cancelDelete}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <MaterialIcons name="warning" size={32} color={theme.status.pending} />
            <Text style={styles.modalTitle}>Confirm Delete</Text>
          </View>
          
          <Text style={styles.modalText}>
            Are you sure you want to delete this transaction?
          </Text>
          
          {selectedTransaction && (
            <View style={styles.transactionPreview}>
              <Text style={styles.previewText}>
                Payment ID: {selectedTransaction.paymentId}
              </Text>
              <Text style={styles.previewText}>
                Amount: {formatAmount(selectedTransaction.amount)}
              </Text>
            </View>
          )}

          <View style={styles.modalButtons}>
            <Pressable
              style={[styles.modalButton, styles.cancelButton]}
              onPress={cancelDelete}
            >
              <Text style={[styles.buttonText, styles.cancelButtonText]}>Cancel</Text>
            </Pressable>
            <Pressable
              style={[styles.modalButton, styles.deleteModalButton]}
              onPress={confirmDelete}
            >
              <Text style={[styles.buttonText, styles.deleteModalButtonText]}>Delete</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <DeleteConfirmationModal />
      <View style={styles.contentContainer}>
        {transactions.length > 0 ? (
          <FlatList
            data={transactions}
            renderItem={renderTransaction}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[theme.primary]}
                tintColor={theme.primary}
              />
            }
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Icon name="exchange" size={48} color="#9CA3AF" />
            <Text style={styles.noTransactions}>No Transaction found</Text>
          </View>
        )}
      </View>
    </GestureHandlerRootView>
  );
};


const styles = StyleSheet.create({
  // Container Styles
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  contentContainer: {
    flex: 1,
    padding: SPACING.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    flexGrow: 1,
  },

  // Transaction Item Styles
  itemContainer: {
    marginBottom: SPACING.md,
    borderRadius: BORDER_RADIUS,
    overflow: 'hidden',
  },
  transactionItem: {
    backgroundColor: theme.surface,
    borderRadius: BORDER_RADIUS,
    shadowColor: theme.text.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },

  // Header Styles
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  headerLeft: {
    flex: 1,
  },
  transactionDate: {
    fontSize: 12,
    color: theme.text.secondary,
    marginBottom: SPACING.xs,
  },
  transactionId: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text.primary,
  },

  // Status Styles
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS / 2,
    marginLeft: SPACING.sm,
  },
  statusIcon: {
    marginRight: SPACING.xs,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // Transaction Body Styles
  transactionBody: {
    padding: SPACING.md,
  },
  amountContainer: {
    marginBottom: SPACING.md,
  },
  amountLabel: {
    fontSize: 12,
    color: theme.text.secondary,
    marginBottom: SPACING.xs,
  },
  amountText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.text.primary,
  },

  // Details Grid Styles
  detailsGrid: {
    gap: SPACING.md,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.background,
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS / 2,
  },
  detailTextContainer: {
    marginLeft: SPACING.sm,
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: theme.text.secondary,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    color: theme.text.primary,
    fontWeight: '500',
  },

  // Delete Action Styles
  rightActionsContainer: {
    width: 100,
    height: '100%',
  },
  deleteButton: {
    flex: 1,
    backgroundColor: theme.delete,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopRightRadius: BORDER_RADIUS,
    borderBottomRightRadius: BORDER_RADIUS,
  },
  deleteButtonContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButtonText: {
    color: theme.text.light,
    fontSize: 12,
    marginTop: 4,
    fontWeight: '600',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: theme.surface,
    borderRadius: BORDER_RADIUS,
    padding: SPACING.xl,
    width: '85%',
    maxWidth: 400,
    elevation: 5,
    shadowColor: theme.text.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.text.primary,
    marginTop: SPACING.sm,
  },
  modalText: {
    fontSize: 16,
    color: theme.text.secondary,
    marginBottom: SPACING.lg,
    textAlign: 'center',
    lineHeight: 22,
  },
  
  // Transaction Preview in Modal
  transactionPreview: {
    backgroundColor: theme.background,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS / 2,
    marginBottom: SPACING.lg,
  },
  previewText: {
    fontSize: 14,
    color: theme.text.secondary,
    marginBottom: SPACING.xs,
    lineHeight: 20,
  },

  // Modal Buttons
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  modalButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: theme.background,
  },
  deleteModalButton: {
    backgroundColor: theme.delete,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  cancelButtonText: {
    color: theme.text.primary,
  },
  deleteModalButtonText: {
    color: theme.text.light,
  },

  // Empty State
  noTransactions: {
    textAlign: 'center',
    marginTop: SPACING.xl,
    fontSize: 16,
    color: theme.text.secondary,
    lineHeight: 24,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    backgroundColor: '#FFFFFF',
    margin: 16,
    borderRadius: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
});

export default Transaction;