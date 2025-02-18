import React, { useEffect, useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, StatusBar, FlatList, Dimensions, RefreshControl, Modal } from 'react-native';
import { auth, firestore } from '../../../firebaseConfig';
import { signOut } from 'firebase/auth';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { LineChart } from 'react-native-chart-kit';
import { useFocusEffect } from '@react-navigation/native';
import moment from 'moment';

const screenWidth = Dimensions.get('window').width;

const HomeScreen = ({ navigation }) => {
  const [selectedView, setSelectedView] = useState('Weekly');
  const [userData, setUserData] = useState({ fullName: '', email: '' });
  const [totalRequests, setTotalRequests] = useState(0);
  const [totalApproved, setTotalApproved] = useState(0);
  const [totalPending, setTotalPending] = useState(0);
  const [totalRejected, setTotalRejected] = useState(0);
  const [totalOnProcess, setTotalOnProcess] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [chartData, setChartData] = useState([0, 0, 0, 0, 0, 0, 0]);
  const menuRef = useRef(null);

  const openMenu = () => setMenuVisible(true);
  const closeMenu = () => setMenuVisible(false);

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        await fetchUserData();
        await fetchTotalRequests();
      };
      fetchData();
    }, [selectedView])
  );

  const fetchUserData = async () => {
    const user = auth.currentUser;
    if (user) {
      const userRef = doc(firestore, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        const data = userDoc.data();
        setUserData({ fullName: data.fullName, email: data.email });
      } else {
        console.log('No such document!');
      }
    }
  };

  const fetchTotalRequests = async () => {
    const collections = ['BarangayCertificates', 'BarangayClearances', 'BusinessPermits', 'ResidencyCertificates'];
    let total = 0;
    let approved = 0;
    let pending = 0;
    let rejected = 0;
    let onProcess = 0;

    const chartDataMap = {
      Weekly: Array(7).fill(0),
      Monthly: Array(12).fill(0),
      Yearly: {}
    };

    for (const collectionName of collections) {
      const querySnapshot = await getDocs(collection(firestore, collectionName));
      total += querySnapshot.size;

      querySnapshot.forEach(doc => {
        const data = doc.data();
        if (data.status === 'APPROVED') {
          approved += 1;
        }
        if (data.status === 'PENDING') {
          pending += 1;
        }
        if (data.status === 'REJECTED') {
          rejected += 1;
        }
        if (data.status === 'ON PROCESS') {
          onProcess += 1;
        }

        const createdAt = moment(data.createdAt.toDate());
        if (selectedView === 'Weekly') {
          const dayOfWeek = createdAt.day();
          chartDataMap.Weekly[dayOfWeek] += 1;
        } else if (selectedView === 'Monthly') {
          const monthOfYear = createdAt.month();
          chartDataMap.Monthly[monthOfYear] += 1;
        } else if (selectedView === 'Yearly') {
          const year = createdAt.year();
          chartDataMap.Yearly[year] = (chartDataMap.Yearly[year] || 0) + 1;
        }
      });
    }

    setTotalRequests(total);
    setTotalApproved(approved);
    setTotalPending(pending);
    setTotalRejected(rejected);
    setTotalOnProcess(onProcess);

    if (selectedView === 'Yearly') {
      const years = Object.keys(chartDataMap.Yearly).sort();
      setChartData(years.map(year => chartDataMap.Yearly[year]));
    } else {
      setChartData(chartDataMap[selectedView]);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUserData();
    await fetchTotalRequests();
    setRefreshing(false);
  };

  const handleLogout = () => {
    signOut(auth).then(() => {
      navigation.navigate('Login');
    }).catch(error => {
      console.log(error);
    });
  };

  const data = {
    labels: selectedView === 'Weekly' ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] :
            selectedView === 'Monthly' ? ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] :
            Object.keys(chartData).map(year => year.toString()),
    datasets: [
      {
        data: chartData,
        color: (opacity = 1) => `rgba(0, 173, 239, ${opacity})`,
        strokeWidth: 2,
      },
    ],
  };

  const chartConfig = {
    backgroundColor: '#351995',
    backgroundGradientFrom: '#351995',
    backgroundGradientTo: '#351995',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForLabels: {
      fontSize: selectedView === 'Monthly' ? 10 : 12, 
      rotation: selectedView === 'Monthly' ? 45 : 0,
    },
  };

  const recentRequests = [];

  const renderRequestItem = ({ item }) => (
    <View style={styles.transactionItem}>
      <View>
        <Text style={styles.transactionDescription}>{item.description}</Text>
        <Text style={styles.transactionDate}>{item.date}</Text>
      </View>
    </View>
  );



  const renderHeader = () => (
    <View>
      <StatusBar barStyle="dark-content" />
      <View style={styles.statusBar}>
      <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.profileSection}>
          <Image
            source={require('../../../assets/images/444.png')}
            style={styles.profileImage}
          />
          <View style={styles.profileTextContainer}>
            <Text style={styles.profileName}>{userData.fullName}</Text>
            <Text style={styles.profileEmail}>{userData.email}</Text>
          </View>
        </TouchableOpacity>


      </View>
      <View style={styles.welcomeContainer}>
        <Text style={styles.welcomeText}>Welcome back, {userData.fullName}!</Text>
      </View>
    
      <View style={styles.selectionContainer}>

        <TouchableOpacity
          style={[
            styles.selectionButton,
            selectedView === 'Weekly' && styles.selectedButton,
          ]}
          onPress={() => setSelectedView('Weekly')}
        >
          <Text style={styles.selectionButtonText}>Weekly</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.selectionButton,
            selectedView === 'Monthly' && styles.selectedButton,
          ]}
          onPress={() => setSelectedView('Monthly')}
        >
          <Text style={styles.selectionButtonText}>Monthly</Text>
        </TouchableOpacity>

        {/* <TouchableOpacity
          style={[
            styles.selectionButton,
            selectedView === 'Yearly' && styles.selectedButton,
          ]}
          onPress={() => setSelectedView('Yearly')}
        >
          <Text style={styles.selectionButtonText}>Yearly</Text>
        </TouchableOpacity> */}
        
      </View>

      <View style={styles.analyticsContainer}>
        <Text style={styles.totalRequests}>Total Requests</Text>
        <Text style={styles.amount}>{totalRequests}</Text>
        
        {chartData.every(point => !isNaN(point)) && (
        <LineChart
          data={data}
          width={screenWidth - 60}
          height={200}
          chartConfig={{
            backgroundColor: '#351995',
            backgroundGradientFrom: '#351995',
            backgroundGradientTo: '#351995',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            style: {
              borderRadius: 16,
            },
            propsForLabels: {
              fontSize: selectedView === 'Monthly' ? 10 : 12,
              rotation: selectedView === 'Monthly' ? 45 : 0, 
            },
          }}
          style={{
            marginVertical: 6,
            borderRadius: 16,
          }}
        />
      )}

      </View>
      <View style={styles.summaryCardsContainer}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryCardTitle}>Total Approved</Text>
          <Text style={styles.summaryCardAmount}>{totalApproved}</Text>
        </View>
       
        <View style={styles.summaryCard}>
          <Text style={styles.summaryCardTitle}>Total Rejects</Text>
          <Text style={styles.summaryCardAmount}>{totalRejected}</Text>
        </View>
      </View>
      <View style={styles.summaryCardsContainer}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryCardTitle}>On Process</Text>
          <Text style={styles.summaryCardAmount}>{totalOnProcess}</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryCardTitle}>Total Pending</Text>
          <Text style={styles.summaryCardAmount}>{totalPending}</Text>
        </View>
        </View>

    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={recentRequests}
        renderItem={renderRequestItem}
        keyExtractor={item => item.id}
        ListHeaderComponent={renderHeader}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
      />
     <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>Are you sure you want to log out?</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonLogout]}
                onPress={() => {
                  setModalVisible(false);
                  handleLogout();
                }}
              >
                <Text style={styles.modalButtonText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  statusBar: {
    height: 60,
     backgroundColor: '#40E0D0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5, 
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
   
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    
  },
  profileTextContainer: {
    marginLeft: 10,
  
  },
  profileName: {
    color: '#000',
    fontSize: 20,
    fontWeight: 'bold',
  },
  profileEmail: {
    color: '#777',
    fontSize: 14,
  },
  welcomeContainer: {
    padding: 20,
    backgroundColor: '#6200ee',
    alignItems: 'center',
  },
  welcomeText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 20,
  },
  quickActionButton: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: '#6200ee',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5, 
  },
  quickActionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  selectionContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 20,
  },
  selectionButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderRadius: 20,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5, 
  },
  selectedButton: {
    backgroundColor: '#6200ee',
  },
  selectionButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  analyticsContainer: {
    padding: 10,
    alignItems: 'center',
    backgroundColor: '#6200ee',
    borderRadius: 20,
    marginHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  totalRequests: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  amount: {
    color: '#FFF',
    fontSize: 32,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  requestsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '60%',
    marginVertical: 10,
  },
  requestsText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  selectedRequests: {
    textDecorationLine: 'underline',
  },
  summaryCardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 15,
  },
  summaryCard: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 10,
    width: screenWidth / 2.5,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  summaryCardTitle: {
    color: '#6200ee',
    fontSize: 16,
    fontWeight: 'bold',
  },
  summaryCardAmount: {
    color: '#000',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
  },
  transactionsContainer: {
    padding: 20,
  },
  transactionsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  transactionDescription: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  transactionDate: {
    fontSize: 14,
    color: '#777',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#351995',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 10,
    marginHorizontal: 5,
    borderRadius: 5,
    alignItems: 'center',
    backgroundColor: '#e0e0e0',
  },
  modalButtonLogout: {
    backgroundColor: '#351995',
  },
  modalButtonText: {
    fontSize: 16,
    color: '#fff',
  },
});

export default HomeScreen;
