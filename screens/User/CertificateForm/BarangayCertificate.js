import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, KeyboardAvoidingView, ScrollView, ActivityIndicator, Modal } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/Ionicons';
import { doc, getDoc, setDoc, getDocs, query, where, collection } from 'firebase/firestore';
import { auth, firestore } from '../../../firebaseConfig';
import Toast from 'react-native-toast-message';
import { ALERT_TYPE, Dialog } from 'react-native-alert-notification';
import SubmitButton from '../../../components/SubmitButton';
import { useFocusEffect } from '@react-navigation/native';

const BarangayCertificate = ({ navigation, route }) => {
  const [fullName, setFullName] = useState('');
  const [birthDate, setBirthDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [age, setAge] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [gender, setGender] = useState('');
  const [civilStatus, setCivilStatus] = useState('');
  const [purpose, setPurpose] = useState('');
  const [customPurpose, setCustomPurpose] = useState('');
  const [status, setStatus] = useState('PENDING');
  const [loading, setLoading] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [isLoadingUserData, setIsLoadingUserData] = useState(true);
  const [certificateType, setCertificateType] = useState('Barangay Certificate');
  const [isLoadingFee, setIsLoadingFee] = useState(true);



  const fetchCertificateFee = async () => {
    setIsLoadingFee(true);
    try {
      const feesRef = doc(firestore, 'settings', 'fees');
      const feesDoc = await getDoc(feesRef);
      
      if (feesDoc.exists()) {
        const fees = feesDoc.data();
        setPaymentAmount(fees.BarangayCertificates || 0);
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
          submitForm();
        }
        navigation.setParams({ paymentSuccess: false, paymentMethod: null });
      }
    }, [route.params?.paymentSuccess, route.params?.paymentMethod])
  );

  const showAlert = (type, title, text) => {
    Dialog.show({
      type,
      title,
      textBody: text,
      button: 'close',
    });
  };

 
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
            calculateAge(birthDateValue);
          } else {
            console.warn('Invalid birth date format');
            setBirthDate(new Date());
          }
        }
        
        setPhoneNumber(userData.phoneNumber || '');
        setGender(userData.gender?.toLowerCase() || '');
        setCivilStatus(userData.civilStatus || '');
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'User data not found',
        });
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

 

  useEffect(() => {
    const initializeData = async () => {
      await Promise.all([
        fetchUserData(),
        fetchCertificateFee()
      ]);
    };

    initializeData();
  }, []);

  

  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || birthDate;
    setShowDatePicker(false);
    setBirthDate(currentDate);
    calculateAge(currentDate);
  };

  const calculateAge = (birthDate) => {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    setAge(age.toString());
  };

  const handleSubmit = () => {
    if (!fullName || !birthDate || !age || !phoneNumber || !gender || !civilStatus || !purpose) {
      Toast.show({
        type: 'error',
        text1: 'Incomplete Form',
        text2: 'Please fill in all fields before proceeding to payment.',
      });
      return;
    }

    navigation.navigate('PaymentScreen', {
      paymentAmount,
      certificateType,
    });
  };


  const formatDate = (dateString) => {
    if (!dateString) {
      return "Invalid date";
    }
  
    const date = new Date(dateString); 
  
    if (isNaN(date)) {
      return "Invalid date";
    }
  
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  



  // const submitForm = async () => {
  //   setLoading(true);
  //   try {
  //     const finalPurpose = purpose === 'others' ? customPurpose : purpose;

  //     const userId = auth.currentUser.uid;

  //     const certificateData = {
  //       userId,
  //       fullName,
  //       birthDate,
  //       age,
  //       phoneNumber,
  //       gender,
  //       civilStatus,
  //       purpose: finalPurpose,
  //       status,
  //       createdAt: new Date(),
  //       paymentAmount: parseFloat(paymentAmount),
  //       paymentStatus: 'PAID',
  //     };

  //     const certificatesRef = collection(firestore, 'BarangayCertificates');
  //     const q = query(certificatesRef, where('fullName', '==', fullName), where('birthDate', '==', birthDate));
  //     const querySnapshot = await getDocs(q);

  //     if (!querySnapshot.empty) {
  //       Toast.show({
  //         type: 'error',
  //         text1: 'Error',
  //         text2: 'A certificate with the same details already exists.'
  //       });
  //       return;
  //     }

  //     const docRef = doc(firestore, 'BarangayCertificates', `${fullName}-${Date.now()}`);
  //     await setDoc(docRef, certificateData);

  //     showAlert(ALERT_TYPE.SUCCESS, 'Success', 'Certificate request submitted successfully.');
  //     navigation.navigate('UserDashboard');

  //   } catch (error) {
  //     console.error('Error submitting form:', error);
  //     showAlert(ALERT_TYPE.DANGER, 'Error', 'Failed to submit certificate request. Please try again later.');
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const submitForm = async () => {
    setLoading(true);
    try {
      const finalPurpose = purpose === 'others' ? customPurpose : purpose;
      const userId = auth.currentUser.uid;

      const certificateData = {
        userId,
        fullName,
        birthDate,
        age,
        phoneNumber,
        gender,
        civilStatus,
        purpose: finalPurpose,
        status,
        createdAt: new Date(),
        paymentAmount: parseFloat(paymentAmount),
        paymentStatus: 'PAID',
      };

     
      const docRef = doc(firestore, 'BarangayCertificates', `${fullName}-${Date.now()}`);
      await setDoc(docRef, certificateData);

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
      showAlert(ALERT_TYPE.DANGER, 'Error', 'Failed to submit certificate request. Please try again later.');
    } finally {
      setLoading(false);
    }
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
    <KeyboardAvoidingView style={styles.container} behavior="padding">
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.header}>Barangay Certification Request Form</Text>
      </View>
      
      {isLoadingUserData ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6200EE" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={[styles.input, !fullName ? styles.inputError : null]}
            value={fullName}
            onChangeText={setFullName}
            placeholder="Enter your full name"
          />
          
          <Text style={styles.label}>Birth Date</Text>
          <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateInput}>

            <Text>{formatDate(birthDate)}</Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={new Date(birthDate)}
              mode="date"
              display="default"
              onChange={handleDateChange}
            />
          )}

          <Text style={styles.label}>Age</Text>
          <TextInput
            style={styles.input}
            value={age}
            onChangeText={setAge}
            keyboardType="numeric"
            placeholder="Enter your age"
            editable={false}
          />

          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            style={styles.input}
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
            placeholder="Enter your phone number"
          />

          <Text style={styles.label}>Gender</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={gender}
              style={styles.picker}
              onValueChange={(itemValue) => setGender(itemValue)}
            >
              <Picker.Item label="Select Gender" value="" />
              <Picker.Item label="Male" value="male" />
              <Picker.Item label="Female" value="female" />
              <Picker.Item label="Other" value="other" />
            </Picker>
          </View>

          <Text style={styles.label}>Civil Status</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={civilStatus}
              style={styles.picker}
              onValueChange={(itemValue) => setCivilStatus(itemValue)}
            >
              <Picker.Item label="Select Civil Status" value="" />
              <Picker.Item label="Single" value="Single" />
              <Picker.Item label="Married" value="Married" />
              <Picker.Item label="Divorced" value="Divorced" />
              <Picker.Item label="Widowed" value="Widowed" />
            </Picker>
          </View>

          <Text style={styles.label}>Purpose</Text>
          <View  style={[styles.pickerContainer, !purpose ? styles.inputError : null]}>
            <Picker
              selectedValue={purpose}
              style={styles.picker}
              onValueChange={(itemValue) => setPurpose(itemValue)}
            >
              <Picker.Item label="Select Purpose" value="" />
              <Picker.Item label="Job Application" value="job_application" />
              <Picker.Item label="Travel" value="travel" />
              <Picker.Item label="Bank Requirement" value="bank_requirement" />
              <Picker.Item label="Others" value="others" />
            </Picker>
          </View>

          {purpose === 'others' && (
            <TextInput
              style={styles.input}
              placeholder="Enter your purpose"
              value={customPurpose}
              onChangeText={setCustomPurpose}
            />
          )}

            {renderPaymentInfo()}

          <View style={styles.buttonContainer}>
            <SubmitButton 
              onPress={handleSubmit} 
              title="Proceed to Payment" 
              disabled={isLoadingFee || paymentAmount === 0}
            />
          </View>
        </ScrollView>
      )}

      {loading && (
        <Modal transparent={true} animationType="none">
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#6200EE" />
          </View>
        </Modal>
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  dateInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 12,
    marginBottom: 16,
  },

  scrollContainer: {
    flexGrow: 1,
    padding: 16,
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
  backButton: {
    marginRight: 16,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    flex: 1,
  },
  label: {
    fontSize: 16,
    marginBottom: 4,
    color: '#000',
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 8,
    marginBottom: 16,
  },
  inputError: {
    borderColor: 'red',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    marginBottom: 16,
  },
  picker: {
    width: '100%',
  },
  buttonContainer: {
    marginTop: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  disabledInput: {
    backgroundColor: '#f5f5f5',
    color: '#666',
  },
  disabledPicker: {
    backgroundColor: '#f5f5f5',
    color: '#666',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default BarangayCertificate;