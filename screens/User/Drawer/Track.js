import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, Alert, StyleSheet, RefreshControl, TouchableOpacity, Modal, ScrollView , ActivityIndicator } from 'react-native';
import { auth, firestore } from '../../../firebaseConfig';
import { collection, query, where, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import Icon from 'react-native-vector-icons/FontAwesome';
import ImageViewer from 'react-native-image-zoom-viewer';
import Toast from 'react-native-toast-message';

import { AlertNotificationRoot, ALERT_TYPE, Dialog } from 'react-native-alert-notification';

import BarangayCertificateModal from './UserModalContent/BarangayCertificateModal';
import BarangayClearanceModal from './UserModalContent/BarangayClearanceModal';
import ResidencyCertificateModal from './UserModalContent/ResidencyCertificateModal';
import BusinessPermitModal from './UserModalContent/BusinessPermitModal';


const showAlert = (type, title, text) => {
  Dialog.show({
    type,
    title,
    textBody: text,
    button: 'close',
  });
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

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


const collectionDisplayNames = {
  BarangayCertificates: 'Barangay Certification',
  BarangayClearances: 'Barangay Clearance',
  ResidencyCertificates: 'Residency Certificate',
  BusinessPermits: 'Business Permit'
};

const Track = () => {
  const [certificates, setCertificates] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [imageUrls, setImageUrls] = useState([]);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      console.error('User not authenticated');
      Alert.alert('Error', 'User not authenticated. Please log in.');
      return;
    }

    const userId = user.uid;
   

    const formatDate = (timestamp) => {
      if (!timestamp || !timestamp.toDate) return '';
      return timestamp.toDate().toDateString();
    };

    const setupListener = (collectionName) => {
      const certificatesQuery = query(
        collection(firestore, collectionName),
        where('userId', '==', userId)
      );

      return onSnapshot(certificatesQuery, (querySnapshot) => {
        const collectionData = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            collectionName,
            ...data,
          
            createdAt: formatDate(data.createdAt),
            dateOfBirth: formatDate(data.dateOfBirth),
            businessRegistrationRequestDate: formatDate(data.businessRegistrationRequestDate),
          };
        });

        setCertificates(prevCertificates => {
          const otherCertificates = prevCertificates.filter(cert => cert.collectionName !== collectionName);
          return [...otherCertificates, ...collectionData];
        });
      });
    };

    const unsubscribeBarangayCertificates = setupListener('BarangayCertificates');
    const unsubscribeBarangayClearances = setupListener('BarangayClearances');
    const unsubscribeResidencyCertificates = setupListener('ResidencyCertificates');
    const unsubscribeBusinessPermits = setupListener('BusinessPermits');

    return () => {
      unsubscribeBarangayCertificates();
      unsubscribeBarangayClearances();
      unsubscribeResidencyCertificates();
      unsubscribeBusinessPermits();
    };
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    
    setRefreshing(false);
  };

  const getStatusBadgeStyle = (status) => {
    const baseStyle = {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      alignSelf: 'flex-start',
    };

    switch (status) {
      case 'PENDING':
        return { ...baseStyle, backgroundColor: '#FEF3C7', borderColor: '#F59E0B', borderWidth: 1 };
      case 'ON PROCESS':
        return { ...baseStyle, backgroundColor: '#DBEAFE', borderColor: '#3B82F6', borderWidth: 1 };
      case 'REJECTED':
        return { ...baseStyle, backgroundColor: '#FEE2E2', borderColor: '#EF4444', borderWidth: 1 };
      case 'APPROVED':
        return { ...baseStyle, backgroundColor: '#D1FAE5', borderColor: '#10B981', borderWidth: 1 };
      case 'CLAIMED':
        return { ...baseStyle, backgroundColor: '#F3E8FF', borderColor: '#8B5CF6', borderWidth: 1 };
      default:
        return { ...baseStyle, backgroundColor: '#F3F4F6', borderColor: '#6B7280', borderWidth: 1 };
    }
  };

 const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return { color: 'orange' };
      case 'ON PROCESS':
        return { color: '#6495ED' };
      case 'REJECTED':
        return { color: 'red' };
      case 'APPROVED':
        return { color: 'green' };
        case 'CLAIMED':
          return { color: 'purple' };
      default:
        return { color: 'black' };
    }
  };




  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => {
        setSelectedItem(item);
        setModalVisible(true);
      }}
    >
      <View style={styles.itemHeader}>
        <View style={styles.titleContainer}>
          <Icon name="file-text-o" size={24} color="#4F46E5" style={styles.titleIcon} />
          <Text style={styles.itemTitle}>{collectionDisplayNames[item.collectionName]}</Text>
        </View>
        <TouchableOpacity
          style={styles.deleteIconButton}
          onPress={() => {
            setSelectedItem(item);
            setDeleteModalVisible(true);
          }}
        >
          <View style={styles.deleteIconContainer}>
            <Icon name="trash" size={20} color="#EF4444" />
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.divider} />

      <View style={styles.itemDetails}>
        <View style={styles.statusContainer}>
          <View style={getStatusBadgeStyle(item.status)}>
            <Text style={[styles.statusText, getStatusColor(item.status)]}>{item.status}</Text>
          </View>
          <View style={styles.paymentBadge}>
            <Text style={styles.paymentText}>{item.paymentStatus}</Text>
          </View>
        </View>

        <View style={styles.dateContainer}>
          <Icon name="calendar" size={16} color="#6B7280" />
          <Text style={styles.dateText}>{item.createdAt}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );



  const renderModalContent = () => {
    if (!selectedItem) return null;

    return (
      <View style={styles.documentContainer}>
        <Text style={styles.documentHeader}>{collectionDisplayNames[selectedItem.collectionName]}</Text>
        <View style={styles.section}>
          {selectedItem.collectionName === 'BarangayCertificates' && (
            <>
              <BarangayCertificateModal item={selectedItem} getStatusColor={getStatusColor} />
            </>
          )}
          {selectedItem.collectionName === 'BarangayClearances' && (
            <>
              <BarangayClearanceModal item={selectedItem} getStatusColor={getStatusColor} openImageModal={openImageModal} />
            </>
          )}
          {selectedItem.collectionName === 'ResidencyCertificates' && (
            <>
              <ResidencyCertificateModal item={selectedItem} getStatusColor={getStatusColor} />
            </>
          )}
          {selectedItem.collectionName === 'BusinessPermits' && (
            <>
              <BusinessPermitModal item={selectedItem} getStatusColor={getStatusColor} openImageModal={openImageModal} />
            </>
          )}
        </View>
      </View>
    );
  };

  const openImageModal = (urls) => {
    setImageUrls(urls);
    setImageModalVisible(true);
  };

  const handleDeleteCertificate = async (item) => {
    setLoading(true); 
    try {
      await deleteDoc(doc(firestore, item.collectionName, item.id));
      setCertificates(prevCertificates =>
        prevCertificates.filter(cert => cert.id !== item.id)
      );
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Request Deleted.',
        position: 'top',
        visibilityTime: 4000
       });
    } catch (error) {
      console.error('Error deleting document:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to delete the request. Please try again later.'
      });
    } finally {
      setLoading(false); 
    }
  };

  const confirmDelete = () => {
    if (selectedItem) {
      handleDeleteCertificate(selectedItem);
      setDeleteModalVisible(false);
    }
  };

  return (
   <View style={styles.container}>
      <FlatList
        data={certificates}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={['#4F46E5']} 
          />
        }
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="inbox" size={48} color="#9CA3AF" />
            <Text style={styles.noTransactions}>No requests found</Text>
            <Text style={styles.emptySubtext}>Pull down to refresh</Text>
          </View>
        }
      />

      <Modal
        visible={modalVisible}
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
        animationType="slide"
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <ScrollView>
              {renderModalContent()}
            </ScrollView>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={imageModalVisible}
        transparent={true}
        onRequestClose={() => setImageModalVisible(false)}
      >
        <ImageViewer
          imageUrls={imageUrls}
          onCancel={() => setImageModalVisible(false)}
          enableSwipeDown
        />
      </Modal>

      <Modal
        visible={deleteModalVisible}
        transparent={true}
        onRequestClose={() => setDeleteModalVisible(false)}
        animationType="slide"
      >
        <View style={styles.modalBackground}>
          <View style={styles.deleteModalContainer}>
            <Text>Are you sure you want to delete this certificate?</Text>
            <View style={styles.deleteModalButtonContainer}>
              <TouchableOpacity
                style={[styles.deleteModalButton, { backgroundColor: 'red' }]}
                onPress={confirmDelete}
              >
                <Text style={styles.deleteModalButtonText}>Delete</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.deleteModalButton, { backgroundColor: 'gray' }]}
                onPress={() => setDeleteModalVisible(false)}
              >
                <Text style={styles.deleteModalButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {loading && (
        <Modal transparent={true} animationType="none">
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#6200EE" />
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  // Main Container Styles
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 24,
  },

  // Item Card Styles
  itemContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleIcon: {
    marginRight: 8,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  deleteButton: {
    padding: 8,
    borderRadius: 20,
  },
  deleteIconButton: {
    padding: 8,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 12,
  },

  // Item Details Styles
  itemDetails: {
    gap: 12,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  paymentBadge: {
    backgroundColor: '#059669',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  paymentText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateText: {
    color: '#6B7280',
    fontSize: 14,
  },

  // Empty State Styles
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
  noTransactions: {
    fontSize: 16,
    fontWeight: '500',
    color: '#4B5563',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 4,
  },

  // Modal Styles
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },

  // Delete Modal Styles
  deleteModalContainer: {
    width: '80%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  deleteModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
    textAlign: 'center',
  },
  deleteModalMessage: {
    fontSize: 16,
    color: '#4B5563',
    textAlign: 'center',
    marginBottom: 24,
  },
  deleteModalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    width: '100%',
  },
  deleteModalButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  deleteButton: {
    backgroundColor: '#EF4444',
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
  },
  deleteModalButtonText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '500',
  },
  deleteButtonText: {
    color: '#FFFFFF',
  },
  cancelButtonText: {
    color: '#4B5563',
  },

  // Loading Styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  loadingIndicator: {
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },

  // Button Styles
  closeButton: {
    backgroundColor: '#4F46E5',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  // Document Styles
  documentContainer: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    borderColor: '#E5E7EB',
    borderWidth: 1,
  },
  documentHeader: {
    fontSize: 22,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 20,
  },
  section: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  modalText: {
    marginBottom: 12,
    fontSize: 16,
    lineHeight: 24,
    color: '#4B5563',
  },
  boldText: {
    fontWeight: '600',
    color: '#111827',
  },

  // Image Styles
  image: {
    width: '100%',
    height: 200,
    resizeMode: 'contain',
    marginVertical: 12,
    borderRadius: 8,
  },
  imageContainer: {
    marginVertical: 12,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
  },

  // Status Badge Styles
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '500',
  },

  // Payment Status Styles
  paymentStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  paymentStatusContainer: {
    backgroundColor: '#059669',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginLeft: 8,
  },
  paymentStatusText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },

  // Additional Helper Styles
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  spacer: {
    height: 12,
  },
  flex1: {
    flex: 1,
  },
  textCenter: {
    textAlign: 'center',
  },
  mt4: {
    marginTop: 16,
  },
  mb4: {
    marginBottom: 16,
  }
});

export default Track;
