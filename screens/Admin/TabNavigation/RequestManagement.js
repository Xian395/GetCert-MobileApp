import React, { useState, useEffect, useCallback} from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, Modal, ScrollView, TextInput, Button, RefreshControl, Image, Alert } from 'react-native';
import { firestore } from '../../../firebaseConfig'; 
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import Icon from 'react-native-vector-icons/Ionicons';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Picker } from '@react-native-picker/picker';
import Toast from 'react-native-toast-message';
import { useFocusEffect } from '@react-navigation/native';


const collectionDisplayNames = {
  BarangayCertificates: 'Barangay Certification',
  BarangayClearances: 'Barangay Clearance',
  ResidencyCertificates: 'Residency Certificate',
  BusinessPermits: 'Business Permit'
};


const RequestManagementScreen = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [refreshing, setRefreshing] = useState(false); 
  const [searchQuery, setSearchQuery] = useState('');
  const [updating, setUpdating] = useState(false);


  useEffect(() => {
    fetchData(); 
  }, []);
  
  
  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch BarangayCertificates
      const certificatesSnapshot = await getDocs(collection(firestore, 'BarangayCertificates'));
      const certificates = certificatesSnapshot.docs.map(doc => ({
        id: doc.id,
        collectionName: 'BarangayCertificates',
        ...doc.data(),
      }));

      // Fetch BarangayClearances
      const clearancesSnapshot = await getDocs(collection(firestore, 'BarangayClearances'));
      const clearances = clearancesSnapshot.docs.map(doc => ({
        id: doc.id,
        collectionName: 'BarangayClearances',
        ...doc.data(),
      }));

      const businessPermitsSnapshot = await getDocs(collection(firestore, 'BusinessPermits'));
      const businessPermits = businessPermitsSnapshot.docs.map(doc => ({
        id: doc.id,
        collectionName: 'BusinessPermits',
        ...doc.data(),
      }));


        // Fetch ResidencyCertificates
        const residencyCertificatesSnapshot = await getDocs(collection(firestore, 'ResidencyCertificates'));
        const residencyCertificates = residencyCertificatesSnapshot.docs.map(doc => ({
          id: doc.id,
          collectionName: 'ResidencyCertificates',
          ...doc.data(),
        }));



      // Combine the results from both collections
      const combinedData = [...certificates, ...clearances, ...businessPermits, ...residencyCertificates];
      setData(combinedData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  const formatDate = (timestamp) => {
    if (!timestamp || !timestamp.seconds) {
      return "Invalid date";
    }
  
    const date = new Date(timestamp.seconds * 1000);
  
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  

  const handleStatusUpdate = async () => {
    if (selectedItem) {
      setUpdating(true);  
      try {
        const collectionName = selectedItem.collectionName;
        const itemRef = doc(firestore, collectionName, selectedItem.id);
        await updateDoc(itemRef, { status: newStatus });
        setData(prevData =>
          prevData.map(item =>
            item.id === selectedItem.id ? { ...item, status: newStatus } : item
          )
        );
        setUpdateModalVisible(false);
        setSelectedItem(null);
        setNewStatus('');
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Status Updated'
        });
      } catch (error) {
        console.error('Error updating status:', error);
      } finally {
        setUpdating(false); 
      }
    }
  };
  

  const confirmDelete = (item) => {
    Alert.alert(
      "Confirm Deletion",
      "Are you sure you want to delete this request?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { text: "Delete", onPress: () => handleDelete(item) }
      ],
      
      { cancelable: false }
    );
  };

  const handleDelete = async (item) => {
    try {
      const collectionName = item.collectionName;
      const itemRef = doc(firestore, collectionName, item.id);
      await deleteDoc(itemRef);
      setData(prevData => prevData.filter(dataItem => dataItem.id !== item.id));
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Request Deleted'
      });
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const downloadImage = async (uri) => {
    try {
      if (uri.startsWith('http') || uri.startsWith('https')) {
        const { uri: localUri } = await FileSystem.downloadAsync(uri, FileSystem.documentDirectory + 'image.jpg');
        await Sharing.shareAsync(localUri);
      } else if (uri.startsWith('file')) {
        await Sharing.shareAsync(uri);
      } else {
        console.error('Unsupported URI scheme');
      }
    } catch (error) {
      console.error('Error downloading image:', error);
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
      default:
        return { color: 'black' };
    }
  };


  const getItemStyle = (status) => {
    switch (status) {
      case 'PENDING':
        return styles.itemOnPending;
      case 'ON PROCESS':
        return styles.itemOnProcess;
      case 'APPROVED':
        return styles.itemApproved;
      case 'REJECTED':
        return styles.itemRejected;
      default:
        return styles.itemDefault;
    }
  };
  

  const renderItem = ({ item }) => (
    <View style={[styles.itemContainer, getItemStyle(item.status)]}>
      <View style={styles.textContainer}>
        <Text style={styles.itemName}>Name: {item.firstName} {item.middleName} {item.lastName}</Text>
        <Text style={styles.itemCollection}>Type: {collectionDisplayNames[item.collectionName]}</Text>
        <Text style={styles.itemStatus}>Status: {item.status}</Text>
      </View>
      <View style={styles.iconContainer}>
        <TouchableOpacity 
          style={styles.iconButton}
          onPress={() => {
            setSelectedItem(item);
            setDetailsModalVisible(true);
          }}
        >
          <Icon name="eye" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.iconButton}
          onPress={() => {
            setSelectedItem(item);
            setUpdateModalVisible(true);
          }}
        >
          <Icon name="create" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.iconButton, { backgroundColor: '#d9534f' }]}
          onPress={() => confirmDelete(item)}
        >
          <Icon name="trash" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchData().then(() => {
      setRefreshing(false);
    });
  }, []);

  const filteredData = data.filter(item => 
    (item.firstName && item.firstName.toLowerCase().includes(searchQuery.toLowerCase())) || 
    (item.collectionName && item.collectionName.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Request Management</Text>
      </View>
      <TextInput
        style={styles.searchBar}
        placeholder="Search by Name or Type"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      {loading ? (
        <ActivityIndicator size="large" color="#6200ee" />
      ) : (
        <FlatList
        data={filteredData}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyMessage}>No requests available</Text>
            </View>
          }
          contentContainerStyle={{ flexGrow: 1 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#6200ee']} 
              tintColor="#6200ee" 
            />
          }
        />
      )}
      {selectedItem && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={detailsModalVisible}
          onRequestClose={() => {
            setDetailsModalVisible(!detailsModalVisible);
          }}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <ScrollView>
                <Text style={styles.modalTitle}>Request Details</Text>
                {selectedItem.collectionName === 'BarangayCertificates' && (
                  <>
            
                    <Text style={styles.modalItem}><Text style={styles.modalLabel}>Request Type:</Text> {collectionDisplayNames[selectedItem.collectionName]}</Text>
                    <Text style={styles.modalItem}><Text style={styles.modalLabel}>Full Name:</Text> {selectedItem.firstName} {selectedItem.middleName} {selectedItem.lastName}</Text>
                    <Text style={styles.modalItem}><Text style={styles.modalLabel}>Age:</Text> {selectedItem.age}</Text>
                    <Text style={styles.modalItem}><Text style={styles.modalLabel}>Phone Number:</Text> {selectedItem.phoneNumber}</Text>
                    <Text style={styles.modalItem}><Text style={styles.modalLabel}>Gender:</Text> {selectedItem.gender}</Text>
                    <Text style={styles.modalItem}><Text style={styles.modalLabel}>Civil Status:</Text> {selectedItem.civilStatus}</Text>
                    <Text style={styles.modalItem}><Text style={styles.modalLabel}>Purpose:</Text> {selectedItem.purpose}</Text>
                    <Text style={styles.modalItem}><Text style={styles.modalLabel}>Status:</Text><Text style={getStatusColor(selectedItem.status)}> {selectedItem.status}</Text></Text>
                    <Text style={styles.modalItem}><Text style={styles.modalLabel}>Date Requested:</Text> {formatDate(selectedItem.createdAt)}</Text>
                  </>
               )}
                {selectedItem.collectionName === 'BarangayClearances' && (
                  <>
                    <Text style={styles.modalItem}><Text style={styles.modalLabel}>Request Type:</Text> {collectionDisplayNames[selectedItem.collectionName]}</Text>
                    <Text style={styles.modalItem}><Text style={styles.modalLabel}>Full Name:</Text> {selectedItem.fullName}</Text>
                    <Text style={styles.modalItem}><Text style={styles.modalLabel}>Date of Birth:</Text> {formatDate(selectedItem.birthDate)}</Text>
                    <Text style={styles.modalItem}><Text style={styles.modalLabel}>Place of Birth:</Text> {selectedItem.placeOfBirth}</Text>
                    <Text style={styles.modalItem}><Text style={styles.modalLabel}>Age:</Text> {selectedItem.age}</Text>
                    <Text style={styles.modalItem}><Text style={styles.modalLabel}>Gender:</Text> {selectedItem.gender}</Text>
                    <Text style={styles.modalItem}><Text style={styles.modalLabel}>Civil Status:</Text> {selectedItem.civilStatus}</Text>
                    <Text style={styles.modalItem}><Text style={styles.modalLabel}>Nationality:</Text> {selectedItem.nationality}</Text>
                    <Text style={styles.modalItem}><Text style={styles.modalLabel}>Address:</Text> {selectedItem.address}</Text>
                    <Text style={styles.modalItem}><Text style={styles.modalLabel}>Contact Number:</Text> {selectedItem.contactNumber}</Text>
                    <Text style={styles.modalItem}><Text style={styles.modalLabel}>Email Address (optional) :</Text> {selectedItem.emailAddress}</Text>

            

                    <Text></Text>
                    <Text style={styles.modalItem}><Text style={styles.modalLabel}>Document:</Text></Text>
                   
                    <Image source={{ uri: selectedItem.document }} style={styles.image} />
                    <TouchableOpacity
                      style={styles.downloadButton}
                      onPress={() => downloadImage(selectedItem.document)}
                    >
                      <Text style={styles.downloadButtonText}>Download Document</Text>
                    </TouchableOpacity>

                    <Text></Text>
                    <Text style={styles.modalItem}><Text style={styles.modalLabel}>Status:</Text><Text style={getStatusColor(selectedItem.status)}> {selectedItem.status}</Text></Text>
                    <Text style={styles.modalItem}><Text style={styles.modalLabel}>Date Requested:</Text> {formatDate(selectedItem.createdAt)}</Text>
                  </>
                )}
                {selectedItem.collectionName === 'BusinessPermits' && (
                  <>
                    <Text style={styles.modalItem}><Text style={styles.modalLabel}>Request Type:</Text> {collectionDisplayNames[selectedItem.collectionName]}</Text>
                    <Text style={styles.modalItem}><Text style={styles.modalLabel}>Business Name:</Text> {selectedItem.companyName}</Text>
                    <Text style={styles.modalItem}><Text style={styles.modalLabel}>Owner's Name:</Text> {selectedItem.fullName}</Text>
                    <Text style={styles.modalItem}><Text style={styles.modalLabel}>Position:</Text> {selectedItem.position}</Text>
                    <Text style={styles.modalItem}><Text style={styles.modalLabel}>Business Type:</Text> {selectedItem.businessType}</Text>
                    <Text style={styles.modalItem}><Text style={styles.modalLabel}>Business Description:</Text> {selectedItem.businessDescription}</Text>
                    <Text style={styles.modalItem}><Text style={styles.modalLabel}>Business Address:</Text> {selectedItem.businessAddress}</Text>
                    <Text style={styles.modalItem}><Text style={styles.modalLabel}>Number of Employees:</Text> {selectedItem.numberOfEmployees}</Text>
                    <Text style={styles.modalItem}><Text style={styles.modalLabel}>Contact Number:</Text> {selectedItem.phoneNumber}</Text>

                    <Text style={styles.modalItem}><Text style={styles.modalLabel}>Required Document:</Text></Text>
                    <Image source={{ uri: selectedItem.document }} style={styles.image} />
                    <TouchableOpacity
                      style={styles.downloadButton}
                      onPress={() => downloadImage(selectedItem.document)}
                    >
                      <Text style={styles.downloadButtonText}>Download Document</Text>
                    </TouchableOpacity>
                    <Text></Text>
                    <Text style={styles.modalItem}><Text style={styles.modalLabel}>Status:</Text><Text style={getStatusColor(selectedItem.status)}> {selectedItem.status}</Text></Text>
                    <Text style={styles.modalItem}><Text style={styles.modalLabel}>Date Requested:</Text> {formatDate(selectedItem.createdAt)}</Text>
                  </>
                )}
                  {selectedItem.collectionName === 'ResidencyCertificates' && (
                    <>
                    <Text style={styles.modalItem}><Text style={styles.modalLabel}>Request Type:</Text> {collectionDisplayNames[selectedItem.collectionName]}</Text>
                    <Text style={styles.modalItem}><Text style={styles.modalLabel}>Full Name:</Text> {selectedItem.fullName}</Text>
                    <Text style={styles.modalItem}><Text style={styles.modalLabel}>Birth Date:</Text> {formatDate(selectedItem.dateOfBirth)}</Text>
                    <Text style={styles.modalItem}><Text style={styles.modalLabel}>Place of Birth:</Text> {selectedItem.placeOfBirth}</Text>
                    <Text style={styles.modalItem}><Text style={styles.modalLabel}>Gender:</Text> {selectedItem.gender}</Text>
                    <Text style={styles.modalItem}><Text style={styles.modalLabel}>Civil Status:</Text> {selectedItem.civilStatus}</Text>
                    <Text style={styles.modalItem}><Text style={styles.modalLabel}>Nationality:</Text> {selectedItem.nationality}</Text>
                    <Text style={styles.modalItem}><Text style={styles.modalLabel}>Occupation:</Text> {selectedItem.occupation}</Text>
                    <Text style={styles.modalItem}><Text style={styles.modalLabel}>Contact Number:</Text> {selectedItem.contactNumber}</Text>
                    <Text style={styles.modalItem}><Text style={styles.modalLabel}>Email Address:</Text> {selectedItem.emailAddress}</Text>
                    <Text style={styles.modalItem}><Text style={styles.modalLabel}>Current Address:</Text> {selectedItem.currentAddress}</Text>
                    <Text style={styles.modalItem}><Text style={styles.modalLabel}>Length of Stay:</Text> {selectedItem.lengthOfStay}</Text>
                    <Text style={styles.modalItem}><Text style={styles.modalLabel}>Previous Address:</Text> {selectedItem.previousAddress}</Text>
                    <Text style={styles.modalItem}><Text style={styles.modalLabel}>Reason:</Text> {selectedItem.reason}</Text>
                    <Text style={styles.modalItem}><Text style={styles.modalLabel}>Status:</Text><Text style={getStatusColor(selectedItem.status)}> {selectedItem.status}</Text></Text>
                    <Text style={styles.modalItem}><Text style={styles.modalLabel}>Date Requested:</Text>{formatDate(selectedItem.createdAt)}</Text>
                    </> 
                  )}

                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => {
                    setDetailsModalVisible(!detailsModalVisible);
                    setSelectedItem(null);
                  }}
                >
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}
      {selectedItem && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={updateModalVisible}
          onRequestClose={() => {
            setUpdateModalVisible(!updateModalVisible);
          }}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>UPDATE STATUS</Text>

              <View style={styles.pickerContainer}>
              <Picker
                  selectedValue={newStatus}
                  style={styles.input}
                  onValueChange={(itemValue) => setNewStatus(itemValue)}
                >
                  <Picker.Item style={{color: 'black'}} label="SELECT STATUS" value="" />
                  <Picker.Item style={{color: 'orange'}} label="PENDING" value="PENDING" />
                  <Picker.Item style={{color: '#6495ED'}} label="ON PROCESS" value="ON PROCESS" />
                  <Picker.Item style={{color: 'lawngreen'}} label="APPROVE" value="APPROVED" />
                  <Picker.Item style={{color: 'indianred'}} label="REJECT" value="REJECTED" />
                </Picker>
              </View>
             

              <TouchableOpacity 
                  onPress={handleStatusUpdate} 
                  style={{  
                    marginTop: 20, 
                    padding: 12, 
                    backgroundColor: 'dodgerblue', 
                    borderRadius: 5, 
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.25,
                    shadowRadius: 3.84,
                    elevation: 5  
                  }}
                >
                <Text style={{ color: 'white', textAlign: 'center',   fontWeight: 'bold', }} >UPDATE</Text>
              </TouchableOpacity>

                    

              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => {
                  setUpdateModalVisible(!updateModalVisible);
                  setSelectedItem(null);
                  setNewStatus('');
                }}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal> 
      )}
      {updating && (
  <Modal
    transparent={true}
    animationType="none"
    visible={updating}
    onRequestClose={() => {}}
  >
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#6200ee" />
    </View>
  </Modal>
)}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#6200ee',
    padding: 15,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    position: 'relative',
    
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginHorizontal: 10,
    marginVertical: 5,
    marginTop: 20,
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  textContainer: {
    flex: 1,
    marginRight: 10,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
    color: 'black',
    marginBottom: 4,
  },
  itemCollection: {
    fontSize: 16,
    color: 'white',
    marginBottom: 4,
    fontWeight: 'bold'
  },
  itemStatus: {
    fontSize: 16,
    color: 'black',
    fontWeight: 'bold'
  },
  iconContainer: {
    flexDirection: 'row',
  },
  iconButton: {
    padding: 8,
    backgroundColor: '#6200ee',
    borderRadius: 5,
    marginLeft: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyMessage: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    marginBottom: 40,
    marginTop: 40,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalItem: {
    fontSize: 16,
    marginBottom: 10,
  },
  modalLabel: {
    fontWeight: 'bold',
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
    fontSize: 16,
    height: 30,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#c5c5c5',
    borderRadius: 5,
    marginTop: 5,
    marginBottom: 15
  },
  image: {
    width: '100%',
    height: 100,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  closeButton: {
    marginTop: 20,
    padding: 12,
    backgroundColor: 'grey',
    borderRadius: 5,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5  
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  downloadButton: {
    marginTop: 10,
    padding: 5,
    backgroundColor: '#007bff',
    borderRadius: 5,
    alignItems: 'center',
  },
  downloadButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  itemOnPending: {
    backgroundColor: 'orange',
  },
  itemOnProcess: {
    backgroundColor: '#6495ED',
  },
  itemApproved: {
    backgroundColor: 'lawngreen',
  },
  itemRejected: {
    backgroundColor: 'indianred',
  },
  itemDefault: {
    backgroundColor: '#fff',
  },
  searchBar: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 5,
    margin: 10,
    borderColor: '#ccc',
    borderWidth: 1,
  },
});

export default RequestManagementScreen;
