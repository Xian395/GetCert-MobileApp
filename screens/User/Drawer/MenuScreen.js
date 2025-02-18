import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Modal, FlatList, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { auth, firestore, collection, getDocs, query, where } from '../../../firebaseConfig';
import { useFocusEffect } from '@react-navigation/native';

const MenuScreen = () => {
  const today = new Date().toISOString().split('T')[0];
  const [firstModalVisible, setFirstModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);


  const collectionDisplayNames = {
    BarangayCertificates: 'Barangay Certification',
    BarangayClearances: 'Barangay Clearance',
    ResidencyCertificates: 'Residency Certificate',
    BusinessPermits: 'Business Permit'
  };


  const fetchData = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        console.error('User not authenticated');
        Alert.alert('Error', 'User not authenticated. Please log in.');
        return;
      }

      const userId = user.uid;

      const certificatesQuery = query(
        collection(firestore, 'BarangayCertificates'),
        where('userId', '==', userId)
      );
      const clearancesQuery = query(
        collection(firestore, 'BarangayClearances'),
        where('userId', '==', userId)
      );
      const businessPermitsQuery = query(
        collection(firestore, 'BusinessPermits'),
        where('userId', '==', userId)
      );
      const residencyCertificatesQuery = query(
        collection(firestore, 'ResidencyCertificates'),
        where('userId', '==', userId)
      );

      const [certificatesSnapshot, clearancesSnapshot, businessPermitsSnapshot, residencyCertificatesSnapshot] = await Promise.all([
        getDocs(certificatesQuery),
        getDocs(clearancesQuery),
        getDocs(businessPermitsQuery),
        getDocs(residencyCertificatesQuery)
      ]);

      const certificatesList = certificatesSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          collectionName: 'BarangayCertificates',
          createdAt: data.createdAt?.toDate().toDateString() || '',
          status: data.status,
        };
      });

      const clearancesList = clearancesSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          collectionName: 'BarangayClearances',
          createdAt: data.createdAt?.toDate().toDateString() || '',
          status: data.status,
        };
      });

      const businessPermitsList = businessPermitsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          collectionName: 'BusinessPermits',
          createdAt: data.createdAt?.toDate().toDateString() || '',
          status: data.status,
        };
      });

      const residencyCertificatesList = residencyCertificatesSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          collectionName: 'ResidencyCertificates',
          createdAt: data.createdAt?.toDate().toDateString() || '',
          status: data.status,
        };
      });

      setData([...certificatesList, ...clearancesList, ...businessPermitsList, ...residencyCertificatesList]);
    } catch (error) {
      console.error('Error fetching data:', error);
      Alert.alert('Error', 'Failed to fetch data. Please try again later.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return '#FFB74D';
      case 'ON PROCESS':
        return '#6495ED';
      case 'REJECTED':
        return '#E57373';
      case 'APPROVED':
        return '#81C784';
        case 'CLAIMED':
        return 'purple'; 
      default:
        return '#000000';
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.tableRow}>
        <View style={styles.tableCell}><Text style={styles.itemText}>{collectionDisplayNames[item.collectionName]}</Text></View>
        <View style={styles.tableCell}>
          <Text style={[styles.itemText, { color: getStatusColor(item.status) }]}>{item.status}</Text>
        </View>
        <View style={styles.tableCell}>
          <TouchableOpacity onPress={() => { setSelectedItem(item); setFirstModalVisible(true); }}>
            <Ionicons name="eye" size={25} color="#00BFA5" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const markedDates = {
    [today]: { selected: true, marked: true, selectedColor: '#00BFA5' },
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00BFA5" />
      </View>
    );
  }

  return (
    <LinearGradient colors={['#E3F2FD', '#E0F7FA']} style={styles.gradient}>
      <View style={styles.container}>
        <FlatList
          data={data}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          ListHeaderComponent={
            <>
              <Calendar
                current={today}
                markedDates={markedDates}
                theme={{
                  selectedDayBackgroundColor: '#00BFA5',
                  todayTextColor: '#00BFA5',
                  arrowColor: '#00BFA5',
                  dayTextColor: '#2d4150',
                  textDisabledColor: '#d9e1e8',
                  monthTextColor: '#00BFA5',
                  textDayFontWeight: '300',
                  textMonthFontWeight: 'bold',
                  textDayHeaderFontWeight: '500',
                  textDayFontSize: 16,
                  textMonthFontSize: 20,
                  textDayHeaderFontSize: 14,
                }}
              />
              <Text style={styles.header}>Recent Requests</Text>
              <View style={[styles.tableRow, styles.tableHeader]}>
                <View style={styles.tableCell}><Text style={styles.tableHeaderText}>Type</Text></View>
                <View style={styles.tableCell}><Text style={styles.tableHeaderText}>Status</Text></View>
                <View style={styles.tableCell}><Text style={styles.tableHeaderText}>Action</Text></View>
              </View>
            </>
          }
          ListEmptyComponent={<Text style={styles.emptyText}>No certificate requests found.</Text>}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#00BFA5']}
            />
          }
        />

<Modal
  animationType="slide"
  transparent={true}
  visible={firstModalVisible}
  onRequestClose={() => setFirstModalVisible(false)}
>
  <View style={styles.modalOverlay}>
    <View style={styles.modalContent}>
      {selectedItem && (
        <>
          <Text style={styles.modalText}>
            <Text style={styles.boldText}>Type:</Text> {collectionDisplayNames[selectedItem.collectionName]}
          </Text>
          <Text style={styles.modalText}>
            <Text style={styles.boldText}>Date Requested:</Text> {selectedItem.createdAt}
          </Text>
          <Text style={styles.modalText}>
            <Text style={styles.boldText}>Status:</Text>{' '}
            <Text style={{ color: getStatusColor(selectedItem.status) }}>
              {selectedItem.status}
            </Text>
          </Text>
        </>
      )}
      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => setFirstModalVisible(false)}
      >
        <Text style={styles.closeButtonText}>Close</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>

      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 16,
    textAlign: 'center',
    color: '#00BFA5',
  },
  table: {
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#CCC',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1, 
    borderColor: '#dee2e6', 
    paddingVertical: 12,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tableHeader: {
    backgroundColor: '#00BFA5',
    paddingVertical: 12, 
    borderBottomWidth: 2,
    borderColor: '#ced4da', 
  },
  tableHeaderText: {
    fontWeight: 'bold', 
    color: '#495057', 
    fontSize: 14, 
  },
  tableCell: {
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  card: {
    borderWidth: 1, 
    borderColor: '#dee2e6',
    borderRadius: 0, 
    marginVertical: 0, 
    paddingHorizontal: 10, 
    backgroundColor: '#FFF',
  },
  itemText: {
    fontSize: 15, 
    color: '#343a40', 
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)', 
  },
  modalContent: {
    width: '85%',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 15, 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    alignItems: 'flex-start', 
  },
  modalText: {
    marginBottom: 15,
    fontSize: 16,
    color: '#2d4150',
    textAlign: 'left',
  },
  boldText: {
    fontWeight: 'bold',
    color: '#00BFA5',
  },
  closeButton: {
    alignSelf: 'center',
    backgroundColor: '#00BFA5',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8, 
    marginTop: 20,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600', 
  },
  emptyText: {
    textAlign: 'center',
    color: '#6c757d', 
    paddingVertical: 20, 
  },
});

export default MenuScreen;
