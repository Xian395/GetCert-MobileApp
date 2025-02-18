import React, { useState, useEffect, useCallback } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Modal, ActivityIndicator } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { auth, firestore } from '../../../firebaseConfig';  
import { collection, addDoc, query, where, getDocs, doc, setDoc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import Toast from 'react-native-toast-message';
import { ALERT_TYPE, Dialog } from 'react-native-alert-notification';
import { useFocusEffect } from '@react-navigation/native';
import SubmitButton from "../../../components/SubmitButton";

const ResidencyCertificate = ({ navigation, route }) => {
    const [fullName, setFullName] = useState('');
    const [birthDate, setBirthDate] = useState(null);
    const [placeOfBirth, setPlaceOfBirth] = useState('');
    const [gender, setGender] = useState('');
    const [civilStatus, setCivilStatus] = useState('');
    const [nationality, setNationality] = useState('');
    const [occupation, setOccupation] = useState('');
    const [contactNumber, setContactNumber] = useState('');
    const [emailAddress, setEmailAddress] = useState('');
    const [currentAddress, setCurrentAddress] = useState('');
    const [lengthOfStay, setLengthOfStay] = useState('');
    const [previousAddress, setPreviousAddress] = useState('');
    const [reason, setReason] = useState('');
    const [customReason, setCustomReason] = useState(''); 
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [userId, setUserId] = useState(null);
    const [status, setStatus] = useState('PENDING'); 
    const [loading, setLoading] = useState(false);
    const [paymentAmount, setPaymentAmount] = useState(0);
    const [isLoadingFee, setIsLoadingFee] = useState(true);
    const [certificateType] = useState('Residency Certificate');
    



    const fetchResidencyFee = async () => {
        setIsLoadingFee(true);
        try {
          const feesRef = doc(firestore, 'settings', 'fees');
          const feesDoc = await getDoc(feesRef);
          
          if (feesDoc.exists()) {
            const fees = feesDoc.data();
            setPaymentAmount(fees.ResidencyCertificates || 0);
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



    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUserId(user.uid);
               
                Promise.all([
                    fetchUserData(user.uid),
                    fetchResidencyFee()
                ])
                .then(() => {
                    console.log('User data and certificate fee fetched successfully');
                })
                .catch((error) => {
                    console.error('Error fetching data:', error);
                });
            }
        });
        
        return () => unsubscribe();
    }, []);
    





const fetchUserData = async (uid) => {
    try {
        const userDocRef = doc(firestore, 'users', uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            setFullName(userData.fullName || '');
            setEmailAddress(userData.email || '');
            setContactNumber(userData.phoneNumber || '');
            setGender(userData.gender || '');
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
                }
            }
        }
    } catch (error) {
        console.error('Error fetching user data:', error);
        Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'Failed to fetch user data. Please try again.',
        });
    }
};

const formatDate = (date) => {
    if (!date) return '';
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};



    const handleBackPress = () => {
        if (navigation && navigation.goBack) {
            navigation.goBack();
        }
    };

    const handleDateChange = (event, selectedDate) => {
        setShowDatePicker(false);
        if (selectedDate) {
            setBirthDate(selectedDate);
        }
    };

    const validateForm = () => {
        if (!birthDate) {
            Toast.show({
                type: 'error',
                text1: 'Incomplete Form',
                text2: 'Please select your date of birth.',
            });
            return false;
        }
        
        if (!fullName || !placeOfBirth || !gender || !civilStatus || 
            !nationality || !occupation || !contactNumber || !currentAddress || 
            !lengthOfStay || (!reason && !customReason)) {
            Toast.show({
                type: 'error',
                text1: 'Incomplete Form',
                text2: 'Please fill in all required fields before proceeding to payment.',
            });
            return false;
        }
        return true;
    };





    const handleSubmit = () => {
        if (!validateForm()) {
            return;
        }
        
        navigation.navigate('PaymentScreen', {
            paymentAmount,
            certificateType,
        });
    };






//   const submitForm = async () => {
//     if (!validateForm()) {
//         return;
//     }

//     setLoading(true);
//     try {
//         const certificatesRef = collection(firestore, 'ResidencyCertificates');
        
       
//         if (!birthDate || isNaN(birthDate.getTime())) {
//             throw new Error('Invalid birth date');
//         }
        
      
//         const birthDateString = birthDate.toISOString();
        
//         const q = query(
//             certificatesRef, 
//             where('fullName', '==', fullName), 
//             where('birthDate', '==', birthDateString)
//         );
        
//         const querySnapshot = await getDocs(q);

//         if (!querySnapshot.empty) {
//             Toast.show({
//                 type: 'error',
//                 text1: 'Error',
//                 text2: 'A certificate with the same details already exists.'
//             });
//             return;
//         }

//         const certificateData = {
//             userId,
//             fullName,
//             birthDate: birthDateString,
//             placeOfBirth,
//             gender,
//             civilStatus,
//             nationality,
//             occupation,
//             contactNumber,
//             emailAddress,
//             currentAddress,
//             lengthOfStay,
//             previousAddress,
//             reason: reason === "Other" ? customReason : reason,
//             status,
//             createdAt: new Date(),
//             paymentAmount: parseFloat(paymentAmount),
//             paymentStatus: 'PAID',
//         };

//         const docRef = doc(firestore, 'ResidencyCertificates', `${fullName}-${Date.now()}`);
//         await setDoc(docRef, certificateData);

//         showAlert(ALERT_TYPE.SUCCESS, 'Success', 'Certificate request submitted successfully.');
//         navigation.navigate('UserDashboard');

//     } catch (error) {
//         console.error('Error submitting form:', error);
//         showAlert(ALERT_TYPE.DANGER, 'Error', 'Failed to submit certificate request. Please try again later.');
//     } finally {
//         setLoading(false);
//     }
// };


const submitForm = async () => {
    if (!validateForm()) {
        return;
    }

    setLoading(true);
    try {
        const certificatesRef = collection(firestore, 'ResidencyCertificates');
        
        if (!birthDate || isNaN(birthDate.getTime())) {
            throw new Error('Invalid birth date');
        }
        
        const birthDateString = birthDate.toISOString();
        
        const certificateData = {
            userId,
            fullName,
            birthDate: birthDateString,
            placeOfBirth,
            gender,
            civilStatus,
            nationality,
            occupation,
            contactNumber,
            emailAddress,
            currentAddress,
            lengthOfStay,
            previousAddress,
            reason: reason === "Other" ? customReason : reason,
            status,
            createdAt: new Date(),
            paymentAmount: parseFloat(paymentAmount),
            paymentStatus: 'PAID',
        };

        const docRef = doc(firestore, 'ResidencyCertificates', `${fullName}-${Date.now()}`);
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
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
              <View style={styles.headerContainer}>
                    <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Residency Certificate Request Form</Text>
                </View>


            <ScrollView contentContainerStyle={styles.container}>
              

                <Text style={styles.label}>Full Name</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Full Name"
                    onChangeText={(value) => setFullName(value)}
                    value={fullName}
                />
<Text style={styles.label}>Date of Birth</Text>
<TouchableOpacity onPress={() => setShowDatePicker(true)}>
    <TextInput
        style={styles.input}
        placeholder="Select Date of Birth"
        value={birthDate ? formatDate(birthDate) : ''}
        editable={false}
        pointerEvents="none"
    />
</TouchableOpacity>

{showDatePicker && (
    <DateTimePicker
        value={birthDate || new Date()}
        mode="date"
        display="default"
        onChange={handleDateChange}
    />
)}

                <Text style={styles.label}>Place of Birth</Text>
                <TextInput
                    style={[styles.input, !placeOfBirth ? styles.inputError : null]}
                    onChangeText={(value) => setPlaceOfBirth(value)}
                    value={placeOfBirth}
                />

                <Text style={styles.label}>Gender</Text>
                <View style={styles.pickerContainer}>
                    <Picker
                        selectedValue={gender}
                        onValueChange={(value) => setGender(value)}
                        style={styles.picker}
                    >
                        <Picker.Item label="Select Gender" value="" />
                        <Picker.Item label="Male" value="Male" />
                        <Picker.Item label="Female" value="Female" />
                    </Picker>
                </View>

                <Text style={styles.label}>Civil Status</Text>
                <View style={styles.pickerContainer}>
                    <Picker
                        selectedValue={civilStatus}
                        onValueChange={(value) => setCivilStatus(value)}
                        style={styles.picker}
                    >
                        <Picker.Item label="Select Civil Status" value="" />
                        <Picker.Item label="Single" value="Single" />
                        <Picker.Item label="Married" value="Married" />
                        <Picker.Item label="Widowed" value="Widowed" />
                        <Picker.Item label="Separated" value="Separated" />
                        <Picker.Item label="Divorced" value="Divorced" />
                    </Picker>
                </View>

                <Text style={styles.label}>Nationality</Text>
                <TextInput
                    style={[styles.input, !nationality ? styles.inputError : null]}
                    onChangeText={(value) => setNationality(value)}
                    value={nationality}
                />

                <Text style={styles.label}>Occupation</Text>
                <TextInput
                    style={[styles.input, !occupation ? styles.inputError : null]} 
                    onChangeText={(value) => setOccupation(value)}
                    value={occupation}
                />

                <Text style={styles.label}>Contact Number</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Contact Number"
                    keyboardType="phone-pad"
                    onChangeText={(value) => setContactNumber(value)}
                    value={contactNumber}
                />

                <Text style={styles.label}>Email Address</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Email Address"
                    keyboardType="email-address"
                    onChangeText={(value) => setEmailAddress(value)}
                    value={emailAddress}
                />

                <Text style={styles.label}>Current Address</Text>
                <TextInput
                     style={[styles.input, !currentAddress ? styles.inputError : null]}                  
                    onChangeText={(value) => setCurrentAddress(value)}
                    value={currentAddress}
                />

                <Text style={styles.label}>Length of Stay at Current Address (months or years)</Text>
                <TextInput
                     style={[styles.input, !lengthOfStay ? styles.inputError : null]}          
                    onChangeText={(value) => setLengthOfStay(value)}
                    value={lengthOfStay}
                />

                <Text style={styles.label}>Previous Address (if any)</Text>
                <TextInput
                    style={[styles.input, !previousAddress ? styles.inputError : null]}   
                    onChangeText={(value) => setPreviousAddress(value)}
                    value={previousAddress}
                />

                <Text style={styles.label}>Reason for Requesting Residency Certificate</Text>
                <View style={[styles.pickerContainer, !reason ? styles.inputError : null]}>
                    <Picker
                        selectedValue={reason}
                        onValueChange={(value) => setReason(value)}
                        style={styles.picker}
                    >
                        <Picker.Item label="Select Reason" value="" />
                        <Picker.Item label="Employment" value="Employment" />
                        <Picker.Item label="Education" value="Education" />
                        <Picker.Item label="Identification" value="Identification" />
                        <Picker.Item label="Other" value="Other" />
                    </Picker>
                </View>
                {reason === "Other" && (
                    <TextInput
                        style={styles.input}
                        placeholder="Specify other reason"
                        onChangeText={(value) => setCustomReason(value)}
                        value={customReason}
                    />
                )}

                    {renderPaymentInfo()}

                <View style={styles.buttonContainer}>
                    <SubmitButton 
                    onPress={handleSubmit} 
                    title="Proceed to Payment"
                    disabled={isLoadingFee || paymentAmount === 0} />
                </View>

            </ScrollView>
            {loading && (
                <Modal
                    transparent={true}
                    animationType="none"
                    visible={loading}
                    onRequestClose={() => {}}
                >
                
                        <View style={styles.activityIndicatorWrapper}>
                            <ActivityIndicator size="large" color="#6200EE" />
                        </View>
                  
                </Modal>
            )}
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 20,
        backgroundColor: '#f9f9f9',
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
        color: '#000',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        marginTop: 6,
        borderRadius: 6,
        backgroundColor: '#fff',
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
        height: 50,
        width: '100%',
    },
    buttonContainer: {
        marginTop: 20,
    },
   
    activityIndicatorWrapper: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',  
    },
});

export default ResidencyCertificate;
