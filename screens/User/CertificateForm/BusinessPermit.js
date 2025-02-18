import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Image, ScrollView, KeyboardAvoidingView, ActivityIndicator, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { collection, addDoc, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { auth, firestore, firestoreDoc, setDoc, storage } from '../../../firebaseConfig';
import * as ImagePicker from 'expo-image-picker';
import { Picker } from '@react-native-picker/picker';
import Toast from 'react-native-toast-message';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useFocusEffect } from '@react-navigation/native';
import { ALERT_TYPE, Dialog } from 'react-native-alert-notification';
import SubmitButton from '../../../components/SubmitButton';

const BusinessPermit = ({ navigation, route }) => {
  const [fullName, setFullName] = useState("");
  const [position, setPosition] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [customBusinessType, setCustomBusinessType] = useState("");
  const [businessDescription, setBusinessDescription] = useState("");
  const [customBusinessDescription, setCustomBusinessDescription] = useState("");
  const [numberOfEmployees, setNumberOfEmployees] = useState("");
  const [document, setDocument] = useState(null);
  const [status, setStatus] = useState('PENDING');
  const [loading, setLoading] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [isLoadingUserData, setIsLoadingUserData] = useState(true);
  const [isLoadingFee, setIsLoadingFee] = useState(true);




  const fetchPermitFee = async () => {
    setIsLoadingFee(true);
    try {
      const feesRef = doc(firestore, 'settings', 'fees');
      const feesDoc = await getDoc(feesRef);
      
      if (feesDoc.exists()) {
        const fees = feesDoc.data();
        setPaymentAmount(fees.BusinessPermits || 0);
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
        setEmail(userData.email || '');
        setPhoneNumber(userData.phoneNumber || '');
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
        fetchPermitFee()
      ]);
    };

    initializeData();
  }, []);
  
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

  const handleBackPress = () => {
    navigation.goBack();
  };

  const showAlert = (type, title, text) => {
    Dialog.show({
      type,
      title,
      textBody: text,
      button: 'close',
    });
  };

  const pickDocument = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        setDocument(result.assets[0].uri);
      } else {
        Toast.show({
          type: 'info',
          text1: 'Cancelled',
          text2: 'Image picking was cancelled.',
        });
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

  const handleSubmit = () => {
    if (!fullName || !position || !companyName || !phoneNumber || 
        !businessType || !businessDescription || !numberOfEmployees || !document) {
      Toast.show({
        type: 'error',
        text1: 'Incomplete Form',
        text2: 'Please fill in all fields and upload required documents before proceeding to payment.',
      });
      return;
    }

    navigation.navigate('PaymentScreen', {
      paymentAmount,
      certificateType: 'Business Permit',
    });
  };

  // const submitForm = async () => {
  //   setLoading(true);
  //   const finalBusinessType = businessType === 'Other' ? customBusinessType : businessType;
  //   const finalBusinessDescription = businessDescription === 'Other' ? customBusinessDescription : businessDescription;
  
  //   try {
  //     const userId = auth.currentUser.uid;
  
  //     const response = await fetch(document);
  //     const blob = await response.blob();
  //     const storageRef = ref(storage, `BusinessPermits/${fullName}-${Date.now()}`);
  //     const snapshot = await uploadBytes(storageRef, blob);
  //     const downloadURL = await getDownloadURL(snapshot.ref);
  
  //     const BusinessPermitsData = {
  //       userId,
  //       fullName,
  //       position,
  //       companyName,
  //       phoneNumber,
  //       email,
  //       businessType: finalBusinessType,
  //       businessDescription: finalBusinessDescription,
  //       numberOfEmployees,
  //       document: downloadURL,
  //       status,
  //       createdAt: new Date(),
  //       paymentAmount: parseFloat(paymentAmount),
  //       paymentStatus: 'PAID',
  //     };
  
  //     const permitsRef = collection(firestore, 'BusinessPermits');
  //     const q = query(permitsRef, 
  //       where('fullName', '==', fullName), 
  //       where('companyName', '==', companyName)
  //     );
  //     const querySnapshot = await getDocs(q);
  
  //     if (!querySnapshot.empty) {
  //       Toast.show({
  //         type: 'error',
  //         text1: 'Error',
  //         text2: 'A permit with the same details already exists.',
  //       });
  //       return;
  //     }
  
  //     const docRef = firestoreDoc(firestore, 'BusinessPermits', `${fullName}-${Date.now()}`);
  //     await setDoc(docRef, BusinessPermitsData);
  
  //     showAlert(ALERT_TYPE.SUCCESS, 'Success', 'Business permit request submitted successfully.');
  //     navigation.navigate('UserDashboard');
  //   } catch (error) {
  //     console.error('Error submitting form:', error);
  //     showAlert(ALERT_TYPE.DANGER, 'Error', 'Failed to submit business permit request. Please try again later.');
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const submitForm = async () => {
    setLoading(true);
    const finalBusinessType = businessType === 'Other' ? customBusinessType : businessType;
    const finalBusinessDescription = businessDescription === 'Other' ? customBusinessDescription : businessDescription;
  
    try {
      const userId = auth.currentUser.uid;
  
      const response = await fetch(document);
      const blob = await response.blob();
      const storageRef = ref(storage, `BusinessPermits/${fullName}-${Date.now()}`);
      const snapshot = await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(snapshot.ref);
  
      const BusinessPermitsData = {
        userId,
        fullName,
        position,
        companyName,
        phoneNumber,
        email,
        businessType: finalBusinessType,
        businessDescription: finalBusinessDescription,
        numberOfEmployees,
        document: downloadURL,
        status,
        createdAt: new Date(),
        paymentAmount: parseFloat(paymentAmount),
        paymentStatus: 'PAID',
      };
  
      const docRef = firestoreDoc(firestore, 'BusinessPermits', `${fullName}-${Date.now()}`);
      await setDoc(docRef, BusinessPermitsData);
  
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
      showAlert(ALERT_TYPE.DANGER, 'Error', 'Failed to submit business permit request. Please try again later.');
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
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Business Permit Request Form</Text>
      </View>

      {isLoadingUserData ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6200EE" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Text style={styles.label}>Owner's Full Name</Text>
          <TextInput
            style={[styles.input, styles.disabledInput]}
            value={fullName}
            editable={false}
          />

          <Text style={styles.label}>Position/Title</Text>
          <TextInput
            style={[styles.input, !position ? styles.inputError : null]}
            value={position}
            onChangeText={text => setPosition(text)}
          />

          <Text style={styles.label}>Company Name / Store Name</Text>
          <TextInput
            style={[styles.input, !companyName ? styles.inputError : null]}
            value={companyName}
            onChangeText={text => setCompanyName(text)}
          />

          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            style={[styles.input, styles.disabledInput]}
            value={phoneNumber}
            editable={false}
          />

          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={[styles.input, styles.disabledInput]}
            value={email}
            editable={false}
          />

          <Text style={styles.label}>Business Type</Text>
          <View style={[styles.pickerContainer, !businessType ? styles.inputError : null]}>
            <Picker
              selectedValue={businessType}
              onValueChange={(itemValue) => setBusinessType(itemValue)}
            >
              <Picker.Item label="Select" value="" />
              <Picker.Item label="Sole Proprietorship" value="Sole Proprietorship" />
              <Picker.Item label="Partnership" value="Partnership" />
              <Picker.Item label="Corporation" value="Corporation" />
              <Picker.Item label="Other" value="Other" />
            </Picker>
          </View>

          {businessType === 'Other' && (
            <TextInput
              style={styles.input}
              placeholder="Specify Business Type"
              value={customBusinessType}
              onChangeText={text => setCustomBusinessType(text)}
            />
          )}

          <Text style={styles.label}>Business Description</Text>
          <View style={[styles.pickerContainer, !businessDescription ? styles.inputError : null]}>
            <Picker
              selectedValue={businessDescription}
              onValueChange={(itemValue) => setBusinessDescription(itemValue)}
            >
              <Picker.Item label="Select" value="" />
              <Picker.Item label="Manufacturing" value="Manufacturing" />
              <Picker.Item label="Retail" value="Retail" />
              <Picker.Item label="Services" value="Services" />
              <Picker.Item label="Other" value="Other" />
            </Picker>
          </View>

          {businessDescription === 'Other' && (
            <TextInput
              style={styles.input}
              placeholder="Specify Business Description"
              value={customBusinessDescription}
              onChangeText={text => setCustomBusinessDescription(text)}
            />
          )}

          <Text style={styles.label}>Number of Employees</Text>
          <TextInput
            style={[styles.input, !numberOfEmployees ? styles.inputError : null]}
            keyboardType="numeric"
            value={numberOfEmployees}
            onChangeText={text => setNumberOfEmployees(text)}
          />

          <Text style={styles.label}>Photo of the Business (Proof of Business)</Text>
          <TouchableOpacity style={styles.uploadButton} onPress={pickDocument}>
            <Text style={styles.uploadButtonText}>Upload Image</Text>
          </TouchableOpacity>
          {document && (
            <Image source={{ uri: document }} style={styles.documentPreview} />
          )}

          {renderPaymentInfo()}

          <View style={styles.buttonContainer}>
            <SubmitButton 
            onPress={handleSubmit} 
            title="Proceed to Payment" 
            disabled={isLoadingFee || paymentAmount === 0}/>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 60,
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
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    flex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  inputError: {
    borderColor: 'red',
  },
  disabledInput: {
    backgroundColor: '#f5f5f5',
    color: '#666',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 10,
  },
  uploadButton: {
    backgroundColor: '#007BFF',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 10,
  },
  uploadButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  documentPreview: {
    width: '100%',
    height: 200,
    resizeMode: 'contain',
    marginBottom: 10,
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
  buttonContainer: {
    marginTop: 16,
    marginBottom: 32,
  },
});

export default BusinessPermit;