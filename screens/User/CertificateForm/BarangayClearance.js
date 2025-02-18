import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  ScrollView, 
  ActivityIndicator, 
  Modal 
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/Ionicons';
import { collection, setDoc, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, firestore, storage } from '../../../firebaseConfig';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import Toast from 'react-native-toast-message';
import { useFocusEffect } from '@react-navigation/native';
import { AlertNotificationRoot, ALERT_TYPE, Dialog } from 'react-native-alert-notification';
import SubmitButton from '../../../components/SubmitButton';

const BarangayClearance = ({ navigation, route }) => {
  
  const [fullName, setFullName] = useState('');
  const [birthDate, setBirthDate] = useState(null);
  const [age, setAge] = useState('');
  const [placeOfBirth, setPlaceOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [civilStatus, setCivilStatus] = useState('');
  const [nationality, setNationality] = useState('');
  const [address, setAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [document, setDocument] = useState(null);
  

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isLoadingUserData, setIsLoadingUserData] = useState(true);
  

  const [status, setStatus] = useState('PENDING');
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [certificateType, setCertificateType] = useState('Barangay Clearance');
  const [isLoadingFee, setIsLoadingFee] = useState(true);


  const fetchClearanceFee = async () => {
    setIsLoadingFee(true);
    try {
      const feesRef = doc(firestore, 'settings', 'fees');
      const feesDoc = await getDoc(feesRef);
      
      if (feesDoc.exists()) {
        const fees = feesDoc.data();
        setPaymentAmount(fees.BarangayClearances || 0);
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Certificate fee settings not found',
        });
      }
    } catch (error) {
      console.error('Error fetching certificate fee:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to fetch certificate fee',
      });
    } finally {
      setIsLoadingFee(false);
    }
  };





  
  useFocusEffect(
    useCallback(() => {
      if (route.params?.paymentSuccess) {
        const paymentMethod = route.params?.paymentMethod;
        if (paymentMethod === 'PayPal') {
          handleSubmit();
        }
        navigation.setParams({ paymentSuccess: false, paymentMethod: null });
      }
    }, [route.params?.paymentSuccess, route.params?.paymentMethod])
  );

 
  useEffect(() => {
    const initializeComponent = async () => {
      try {
       
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Toast.show({
            type: 'error',
            text1: 'Permission Denied',
            text2: 'Sorry, we need camera roll permissions to make this work!',
          });
        }

      
        await Promise.all([
          fetchUserData(),
          fetchClearanceFee()
        ]);

      } catch (error) {
        console.error('Error during initialization:', error);
        Toast.show({
          type: 'error',
          text1: 'Initialization Error',
          text2: 'Failed to set up the form. Please try again.',
        });
      } finally {
        setIsLoadingUserData(false);
        setIsLoadingFee(false);
      }
    };

    initializeComponent();
  }, []);





  const fetchUserData = async () => {
    setIsLoadingUserData(true);
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'No authenticated user found',
        });
        return;
      }

      const userDocRef = doc(firestore, 'users', userId);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        setFullName(userData.fullName || '');
        setEmailAddress(userData.email || '');
        setPhoneNumber(userData.phoneNumber || '');
        setGender(userData.gender?.toLowerCase() || '');
        setCivilStatus(userData.civilStatus || '');
        
        if (userData.birthDate) {
          let birthDateValue;
          if (userData.birthDate.toDate && typeof userData.birthDate.toDate === 'function') {
            birthDateValue = userData.birthDate.toDate();
          } else if (userData.birthDate instanceof Date) {
            birthDateValue = userData.birthDate;
          } else if (typeof userData.birthDate === 'string') {
            birthDateValue = new Date(userData.birthDate);
          }
          
          if (birthDateValue && !isNaN(birthDateValue.getTime())) {
            setBirthDate(birthDateValue);
            setAge(calculateAge(birthDateValue));
          }
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to fetch user data',
      });
    } finally {
      setIsLoadingUserData(false);
    }
  };


  const calculateAge = (birthDate) => {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age.toString();
  };

  
  const pickDocument = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        setDocument(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to pick document. Please try again.',
      });
    }
  };

 
  const showAlert = (type, title, text) => {
    Dialog.show({
      type,
      title,
      textBody: text,
      button: 'close',
    });
  };

  
  // const handleSubmit = async () => {
    
  //   if (!fullName || !birthDate || !placeOfBirth || !gender || !civilStatus || 
  //       !nationality || !address || !phoneNumber || !document) {
  //     Toast.show({
  //       type: 'error',
  //       text1: 'Incomplete Form',
  //       text2: 'Please fill in all fields and upload required documents.',
  //     });
  //     return;
  //   }

  
  //   if (!route.params?.paymentSuccess) {
  //     navigation.navigate('PaymentScreen', {
  //       paymentAmount,
  //       certificateType,
  //     });
  //     return;
  //   }

    
  //   setLoading(true);
  //   try {
  //     const userId = auth.currentUser.uid;
      
   
  //     const response = await fetch(document);
  //     const blob = await response.blob();
  //     const storageRef = ref(storage, `BarangayClearances/${fullName}-${Date.now()}`);
  //     const snapshot = await uploadBytes(storageRef, blob);
  //     const downloadURL = await getDownloadURL(snapshot.ref);

  //     const clearanceData = {
  //       userId,
  //       fullName,
  //       birthDate: birthDate.toISOString(),
  //       age,
  //       placeOfBirth,
  //       gender,
  //       civilStatus,
  //       nationality,
  //       address,
  //       phoneNumber,
  //       emailAddress,
  //       document: downloadURL,
  //       status: 'PENDING',
  //       createdAt: new Date(),
  //       paymentAmount: parseFloat(paymentAmount),
  //       paymentStatus: 'PAID',
  //     };

     
  //     const certificatesRef = collection(firestore, 'BarangayClearances');
  //     const q = query(certificatesRef, 
  //       where('fullName', '==', fullName), 
  //       where('birthDate', '==', birthDate.toISOString())
  //     );
  //     const querySnapshot = await getDocs(q);

  //     if (!querySnapshot.empty) {
  //       Toast.show({
  //         type: 'error',
  //         text1: 'Error',
  //         text2: 'A clearance with the same details already exists.'
  //       });
  //       return;
  //     }

  
  //     const docRef = doc(firestore, 'BarangayClearances', `${fullName}-${Date.now()}`);
  //     await setDoc(docRef, clearanceData);

  //     showAlert(ALERT_TYPE.SUCCESS, 'Success', 'Barangay clearance request submitted successfully.');
  //     navigation.navigate('UserDashboard');
  //   } catch (error) {
  //     console.error('Error submitting form:', error);
  //     showAlert(ALERT_TYPE.DANGER, 'Error', 'Failed to submit clearance request. Please try again later.');
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleSubmit = async () => {
    if (!fullName || !birthDate || !placeOfBirth || !gender || !civilStatus || 
        !nationality || !address || !phoneNumber || !document) {
      Toast.show({
        type: 'error',
        text1: 'Incomplete Form',
        text2: 'Please fill in all fields and upload required documents.',
      });
      return;
    }

    if (!route.params?.paymentSuccess) {
      navigation.navigate('PaymentScreen', {
        paymentAmount,
        certificateType,
      });
      return;
    }

    setLoading(true);
    try {
      const userId = auth.currentUser.uid;
      
    
      const response = await fetch(document);
      const blob = await response.blob();
      const storageRef = ref(storage, `BarangayClearances/${fullName}-${Date.now()}`);
      const snapshot = await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(snapshot.ref);

      const clearanceData = {
        userId,
        fullName,
        birthDate: birthDate.toISOString(),
        age,
        placeOfBirth,
        gender,
        civilStatus,
        nationality,
        address,
        phoneNumber,
        emailAddress,
        document: downloadURL,
        status: 'PENDING',
        createdAt: new Date(),
        paymentAmount: parseFloat(paymentAmount),
        paymentStatus: 'PAID',
      };

    
      const docRef = doc(firestore, 'BarangayClearances', `${fullName}-${Date.now()}`);
      await setDoc(docRef, clearanceData);

      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Certificate request submitted successfully.',
        position: 'top',
        visibilityTime: 3000,
      });
      navigation.navigate('UserDashboard');
    } catch (error) {
      console.error('Error submitting form:', error);
      showAlert(ALERT_TYPE.DANGER, 'Error', 'Failed to submit clearance request. Please try again later.');
    } finally {
      setLoading(false);
    }
  };




  const formatDate = (date) => {
    if (!date) return 'Select date of birth';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };


  const renderPaymentInfo = () => (
    <View style={styles.paymentInfo}>
      <Text style={styles.paymentLabel}>Certificate Cost</Text>
      {isLoadingFee ? (
        <ActivityIndicator size="small" color="#6200EE" />
      ) : (
        <Text style={styles.paymentAmount}>₱{paymentAmount.toFixed(2)}</Text>
      )}
    </View>
  );




  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.header}>Barangay Clearance Request Form</Text>
      </View>

      {isLoadingUserData ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6200EE" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your full name"
            value={fullName}
            onChangeText={setFullName}
          />

          <Text style={styles.label}>Date of Birth</Text>
          <TouchableOpacity 
            style={styles.input} 
            onPress={() => setShowDatePicker(true)}
          >
            <Text>{formatDate(birthDate)}</Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={birthDate || new Date()}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) {
                  setBirthDate(selectedDate);
                  setAge(calculateAge(selectedDate));
                }
              }}
            />
          )}

          <Text style={styles.label}>Age</Text>
          <TextInput
            style={[styles.input, styles.disabledInput]}
            placeholder="Age"
            value={age}
            editable={false}
          />

          <Text style={styles.label}>Place of Birth</Text>
          <TextInput
            style={[styles.input, !placeOfBirth ? styles.inputError : null]}
            value={placeOfBirth}
            onChangeText={setPlaceOfBirth}
          />
 
          <Text style={styles.label}>Gender</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={gender}
              onValueChange={setGender}
              style={styles.picker}
            >
              <Picker.Item label="Select your gender" value="" />
              <Picker.Item label="Male" value="male" />
              <Picker.Item label="Female" value="female" />
            </Picker>
          </View>

          <Text style={styles.label}>Civil Status</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={civilStatus}
              onValueChange={setCivilStatus}
              style={styles.picker}
            >
              <Picker.Item label="Select" value="" />
              <Picker.Item label="Single" value="Single" />
              <Picker.Item label="Married" value="Married" />
              <Picker.Item label="Widowed" value="Widowed" />
              <Picker.Item label="Divorced" value="Divorced" />
            </Picker>
          </View>

          <Text style={styles.label}>Nationality</Text>
          <TextInput
            style={[styles.input, !nationality ? styles.inputError : null]}
            value={nationality}
            onChangeText={setNationality}
          />
          <Text style={styles.label}>Address</Text>
          <TextInput
            style={[styles.input, !address ? styles.inputError : null]}
            value={address}
            onChangeText={setAddress}
            multiline
          />

          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your phone number"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
          />

          <Text style={styles.label}>Email Address (Optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your email address"
            value={emailAddress}
            onChangeText={setEmailAddress}
            keyboardType="email-address"
          />

          <Text style={styles.label}>Upload Required Document (ID)</Text>
          <TouchableOpacity 
            style={styles.uploadButton} 
            onPress={pickDocument}
          >
            <Text style={styles.uploadButtonText}>
              {document ? 'Change Document' : 'Upload ID Document'}
            </Text>
          </TouchableOpacity>
          
          {document && (
            <Image 
              source={{ uri: document }} 
              style={styles.previewImage} 
            />
          )}

            {renderPaymentInfo()}

          <View style={styles.buttonContainer}>
            <SubmitButton 
              onPress={handleSubmit} 
              title={route.params?.paymentSuccess ? "Submit" : "Proceed to Payment"}
              disabled={isLoadingFee || paymentAmount === 0}
            />
          </View>
        </ScrollView>
      )}

      <Modal
        transparent={true}
        animationType="none"
        visible={loading}
        onRequestClose={() => {}}
      >
        <View style={styles.modalBackground}>
          <View style={styles.activityIndicatorWrapper}>
            <ActivityIndicator 
              animating={loading} 
              size="large" 
              color="#6200EE" 
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    marginBottom: 5,
    
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6200EE',
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
    width: '100%',
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    flex: 1,
  },
  backButton: {
    marginRight: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  paymentInfo: {
    marginTop: 16,
    alignItems: 'center',
    padding: 16,
    borderWidth: 2,
    borderColor: '#A0A0A0',
    borderStyle: 'dashed',
    borderRadius: 10,
    backgroundColor: '#F9F9F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
},
paymentLabel: {
    fontSize: 16,
    color: '#A0A0A0',
    marginBottom: 4,
},
paymentAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000000',
},
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 12,
    color: '#444',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
    marginTop: 6,
    color: 'black'
  },
  inputError: {
    borderColor: 'red',
  },
  picker: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    marginTop: 6,
  },
  uploadButton: {
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 10,
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  previewImage: {
    width: '100%',
    height: 200,
    marginTop: 10,
    resizeMode: 'contain',
    borderRadius: 6,
  },
  activityIndicatorWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',  
  },
});

export default BarangayClearance;
