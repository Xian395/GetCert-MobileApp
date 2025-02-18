import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, TextInput, KeyboardAvoidingView, Platform, StyleSheet, SafeAreaView, Image } from 'react-native';
import { WebView } from 'react-native-webview';
import axios from 'axios';
import Icon from 'react-native-vector-icons/Ionicons';
import { ALERT_TYPE, Dialog } from 'react-native-alert-notification';
import { doc, setDoc, updateDoc, collection , getDoc} from 'firebase/firestore';
import { auth, firestore } from '../../../firebaseConfig';
import config from '../../../config/environment';

const XENDIT_API_KEY = config.XENDIT_API_KEY;
const XENDIT_API_URL = config.XENDIT_API_URL;
const PAYPAL_BASE_URL = config.PAYPAL_BASE_URL;

const base64Encode = (str) => {
  return btoa(unescape(encodeURIComponent(str)));
};

const PaymentScreen = ({ navigation, route }) => {
  const [loading, setLoading] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState(null);
  const [gcashNumber, setGcashNumber] = useState('');
  const [showGcashInput, setShowGcashInput] = useState(false);
  const { paymentAmount, certificateType } = route.params;
  const webViewRef = useRef(null);
  const [paymentId, setPaymentId] = useState(null);
  
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const processedPaymentIds = useRef(new Set());

  const generatePaymentId = () => {
    const timestamp = Date.now();
    const randomNum = Math.floor(Math.random() * 1000000);
    return `PAY_${timestamp}_${randomNum}`;
  };

  const showAlert = (type, title, text) => {
    Dialog.show({
      type,
      title,
      textBody: text,
      button: 'close',
    });
  };

  const formatGcashNumber = (number) => {
    if (number.startsWith('09')) {
      return number.replace(/^0/, '+63');
    }
    return number;
  };


  const getUserFullName = async (userId) => {
    try {
      const userRef = doc(firestore, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        return userDoc.data().fullName;
      }
      return 'Unknown User';
    } catch (error) {
      console.error('Error fetching user details:', error);
      return 'Unknown User';
    }
  };




  const updatePaymentStatus = async (newStatus) => {
    if (!paymentId) {
      console.error('No payment ID available for status update');
      return;
    }
    try {
    
      const paymentRef = doc(firestore, 'payments', paymentId);
      const docSnap = await getDoc(paymentRef);
      
      if (!docSnap.exists()) {
        console.log('Payment document does not exist yet, retrying...');
     
        await new Promise(resolve => setTimeout(resolve, 1000));
        const retrySnap = await getDoc(paymentRef);
        
        if (!retrySnap.exists()) {
          throw new Error('Payment document not found after retry');
        }
      }
      
   
      await updateDoc(paymentRef, {
        paymentStatus: newStatus,
        lastUpdated: new Date(),
      });
      
      console.log('Payment status updated successfully to:', newStatus);
    } catch (error) {
      console.error('Error updating payment status:', error);
   
      showAlert(
        ALERT_TYPE.WARNING,
        'Status Update Issue',
        'There was a problem updating your payment status. Your payment may still have been processed successfully.'
      );
    }
  };



  const createEWalletCharge = async (channelCode) => {
    if (channelCode === 'PH_GCASH' && !gcashNumber) {
      showAlert(ALERT_TYPE.WARNING, 'Missing Information', 'Please enter your GCash number.');
      return;
    }

    setLoading(true);
    try {
      const paymentId = await storePaymentDetails(paymentAmount, 'GCash');
      
      const formattedNumber = formatGcashNumber(gcashNumber);
      const response = await axios.post(
        `${XENDIT_API_URL}/ewallets/charges`,
        {
          reference_id: paymentId,
          currency: 'PHP',
          amount: parseFloat(paymentAmount),
          checkout_method: 'ONE_TIME_PAYMENT',
          channel_code: channelCode,
          channel_properties: {
            success_redirect_url: 'https://yourwebsite.com/payment-success',
            failure_redirect_url: 'https://yourwebsite.com/payment-failure',
            mobile_number: formattedNumber,
          },
        },
        {
          headers: {
            Authorization: `Basic ${base64Encode(XENDIT_API_KEY + ':')}`,
            'Content-Type': 'application/json',
          },
        }
      );

      setPaymentUrl(response.data.actions.desktop_web_checkout_url);
    } catch (error) {
      console.error('Error creating e-wallet charge:', error.response ? error.response.data : error.message);
      showAlert(ALERT_TYPE.DANGER, 'Error', 'Failed to create payment. Please try again.');
      updatePaymentStatus('failed');
    } finally {
      setLoading(false);
    }
  };


  const handlePaymentMethod = (channelCode) => {
    if (channelCode === 'PH_GCASH') {
      setShowGcashInput(true);
    } else {
      createEWalletCharge(channelCode);
    }
  };



  const handleGcashSubmit = () => {
    if (gcashNumber.length !== 11 || !gcashNumber.startsWith('09')) {
      showAlert(ALERT_TYPE.WARNING, 'Invalid Number', 'Please enter a valid 11-digit GCash number starting with 09.');
      return;
    }
    createEWalletCharge('PH_GCASH');
  };





  const handlePayPalPayment = async () => {
    setLoading(true);
    try {
      const paymentId = await storePaymentDetails(paymentAmount, 'PayPal');
      
      const createResponse = await axios.post(`${PAYPAL_BASE_URL}/api/create-payment`, {
        amount: paymentAmount,
        currency: 'PHP',
        reference_id: paymentId,
      });

      setPaymentUrl(createResponse.data.approvalUrl);
    } catch (error) {
      console.error('PayPal payment error:', error);
      showAlert(ALERT_TYPE.DANGER, 'Payment Error', error.message);
      updatePaymentStatus('failed');
    } finally {
      setLoading(false);
    }
  };


  const storePaymentDetails = async (amount, paymentMethod) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('No authenticated user found');
      }
  
      const userFullName = await getUserFullName(user.uid);
      const newPaymentId = generatePaymentId();
      setPaymentId(newPaymentId); 
      
      const paymentData = {
        userId: user.uid,
        userFullName: userFullName,
        paymentId: newPaymentId,
        amount: amount,
        paymentMethod: paymentMethod,
        certificateType: certificateType,
        paymentStatus: 'initiated',
        timestamp: new Date(),
        lastUpdated: new Date(),
      };
  
    
      const paymentRef = doc(firestore, 'payments', newPaymentId);
      await setDoc(paymentRef, paymentData);
      
     
      const verifyDoc = await getDoc(paymentRef);
      if (!verifyDoc.exists()) {
        throw new Error('Payment document failed to create');
      }
  
      console.log('Payment details stored successfully');
      return newPaymentId;
    } catch (error) {
      console.error('Error storing payment details:', error);
      showAlert(
        ALERT_TYPE.DANGER,
        'Payment Error',
        'Unable to initialize payment. Please try again.'
      );
      throw error;
    }
  };

  const handlePaymentSuccess = async (paypalPaymentId, PayerID) => {
    
    if (processedPaymentIds.current.has(paypalPaymentId)) {
      console.log('Payment already processed:', paypalPaymentId);
      return;
    }

    console.log('Processing verified payment success...');
    setIsProcessingPayment(true);

    try {
      
      const verificationResponse = await axios.post(`${PAYPAL_BASE_URL}/api/execute-payment`, {
        paymentId: paypalPaymentId,
        payerId: PayerID
      });

      if (verificationResponse.data.payment.state !== 'approved') {
        throw new Error('Payment not approved by PayPal');
      }

   
      processedPaymentIds.current.add(paypalPaymentId);

     
      const transactionId = `TR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
     
      const paymentRef = doc(firestore, 'payments', paymentId);
      await updateDoc(paymentRef, {
        transactionId,
        completedAt: new Date(),
        paymentStatus: 'completed',
        lastUpdated: new Date(),
        verificationMethod: 'paypal_verified',
        paypalPaymentId: paypalPaymentId 
      });

     
      const updatedPayment = await getDoc(paymentRef);
      if (!updatedPayment.exists() || updatedPayment.data().paymentStatus !== 'completed') {
        throw new Error('Payment status update failed');
      }

      
      const navigationMap = {
        'Barangay Certificate': 'BarangayCertificate',
        'Barangay Clearance': 'BarangayClearance',
        'Business Permit': 'BusinessPermit',
        'Residency Certificate': 'BarangayResidency'
      };
      
      const targetScreen = navigationMap[certificateType];
      if (!targetScreen) {
        throw new Error(`Unknown certificate type: ${certificateType}`);
      }
      
      setPaymentUrl(null); // Close WebView
      navigation.navigate(targetScreen, {
        paymentSuccess: true,
        paymentMethod: 'PayPal',
        paymentId: paymentId,
        transactionId: transactionId,
        verificationTimestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Error in payment success handler:', error);
      showAlert(
        ALERT_TYPE.WARNING,
        'Processing Error',
        'Payment verification succeeded but processing failed. Please contact support with your PayPal transaction details.'
      );
      console.error('Full error details:', {
        error: error.message,
        paymentId,
        paypalPaymentId,
        timestamp: new Date().toISOString()
      });
      await updatePaymentStatus('failed');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  
  const handlePaymentCancellation = () => {
    updatePaymentStatus('cancelled');
    showAlert(ALERT_TYPE.WARNING, 'Payment Cancelled', 'Your payment was cancelled. You can try again or choose a different payment method.');
    setPaymentUrl(null);
  };

  
  const handleWebViewNavigationStateChange = async (navState) => {
    console.log('Current URL:', navState.url);
    
    try {
      const url = new URL(navState.url);
      const paypalPaymentId = url.searchParams.get('paymentId');
      const PayerID = url.searchParams.get('PayerID');

     
      if (isProcessingPayment) {
        console.log('Already processing payment, ignoring navigation event');
        return;
      }

     
      if ((url.pathname.includes('/payment-success') || url.pathname.includes('/logout') || url.pathname.includes('/signout')) 
          && paypalPaymentId && PayerID) {
        await handlePaymentSuccess(paypalPaymentId, PayerID);
      }
      
      else if (url.pathname.includes('/payment-cancel')) {
        setPaymentUrl(null);
        handlePaymentCancellation();
      }
     
      else if ((url.pathname.includes('/logout') || url.pathname.includes('/signout')) 
               && (!paypalPaymentId || !PayerID)) {
        setPaymentUrl(null);
      }
    } catch (error) {
      console.error('Error processing WebView navigation:', error);
      showAlert(
        ALERT_TYPE.DANGER,
        'Navigation Error',
        'An error occurred while processing your payment. Please try again.'
      );
    }
  };

  const PaymentMethod = ({ imageSource, name, onPress }) => (
    <TouchableOpacity style={styles.paymentMethod} onPress={onPress}>
      <Image source={imageSource} style={styles.paymentIcon} />
      <Text style={styles.paymentMethodText}>{name}</Text>
      <Icon name="chevron-forward" size={24} color="#6200EE" />
    </TouchableOpacity>
  );

  if (paymentUrl) {
    return (
      <View style={{ flex: 1 }}>
        <WebView
          ref={webViewRef}
          source={{ uri: paymentUrl }}
          style={{ flex: 1 }}
          onNavigationStateChange={handleWebViewNavigationStateChange}
          startInLoadingState={true}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          originWhitelist={['https://*', 'http://*']}  
          onError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.warn('WebView error: ', nativeEvent);
          }}
          onHttpError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.warn('WebView HTTP error: ', nativeEvent);
          }}
        />
        {/* <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => {
            handlePaymentCancellation();
          }}
        >
            <Text style={styles.cancelButtonText}>Cancel Payment</Text>
        </TouchableOpacity> */}
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.header}>Payment Methods</Text>
        </View>
        <View style={styles.content}>
          {!showGcashInput ? (
            <>
              <PaymentMethod
                imageSource={require('../../../assets/images/paypal.png')}
                name="PayPal"
                onPress={handlePayPalPayment}
              />
              {/* <PaymentMethod
                imageSource={require('../../../assets/images/gcash.jpeg')}
                name="GCash"
                onPress={() => handlePaymentMethod('PH_GCASH')}
              /> */}
            </>
          ) : (
            <View style={styles.gcashInputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Enter GCash number"
                placeholderTextColor="#888"
                value={gcashNumber}
                onChangeText={setGcashNumber}
                keyboardType="phone-pad"
              />
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleGcashSubmit}
                disabled={loading}
              >
                <Text style={styles.submitButtonText}>Submit</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#6200EE" />
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  cancelButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#ff4444',
    padding: 10,
    borderRadius: 5,
  },
  cancelButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6200EE',
    padding: 16,
  },
  backButton: {
    marginRight: 16,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  content: {
    padding: 16,
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  paymentIcon: {
    width: 40,
    height: 40,
  },
  paymentMethodText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 16,
  },
  gcashInputContainer: {
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#6200EE',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: '#6200EE',
    padding: 16,
    borderRadius: 8,
  },
  submitButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
});

export default PaymentScreen;