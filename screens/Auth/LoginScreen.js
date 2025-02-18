import React, { useState } from 'react';
import { StyleSheet, Text, View, Image, TextInput, TouchableOpacity, Modal, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { auth, firestore } from '../../firebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { AlertNotificationRoot, ALERT_TYPE, Dialog } from 'react-native-alert-notification';

import MyButton from '../../components/MyButton';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false); 

  const showAlert = (type, title, text) => {
    Dialog.show({
      type,
      title,
      textBody: text,
      button: 'close',
    });
  };



  const handleLogin = async () => {
    setLoading(true); 
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
  
      if (!user.emailVerified) {
        setLoading(false); 
        showAlert(ALERT_TYPE.DANGER, 'Login Error', 'Your account is not verify , Please check your email first.');
        return; 
      }
  
      const userRef = doc(firestore, 'users', user.uid);
      const userDoc = await getDoc(userRef);
  
      if (userDoc.exists()) {
        const userRole = userDoc.data().role;
        setLoading(false); 
        if (userRole === 'user') {
          navigation.navigate('UserDashboard');
        }
      } else {
        setLoading(false); 
        showAlert(ALERT_TYPE.DANGER, 'Login Error', 'User not found.');
      }
    } catch (error) {
      setLoading(false); 
      if (error.code === 'auth/invalid-email') {
        setEmailError('Invalid email address');
      } else if (error.code === 'auth/wrong-password') {
        setPasswordError('Incorrect password');
      } else {
        showAlert(ALERT_TYPE.DANGER, 'Login Error', error.message);
      }
    }
  };
  

  

  const handleSocialLoginPress = () => {
    showAlert(ALERT_TYPE.WARNING, 'Feature Coming Soon', 'This feature will be available soon.');
  };



  return (
    <AlertNotificationRoot>
      <View style={styles.container}>
        <Image
          source={require('../../assets/images/log.png')}
          resizeMode="cover"
          style={styles.logo}
        />
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={text => {
            setEmail(text);
            setEmailError('');
          }}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        {emailError ? <Text style={styles.error}>{emailError}</Text> : null}

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              value={password}
              onChangeText={text => {
                setPassword(text);
                setPasswordError('');
              }}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <MaterialIcons
                name={showPassword ? 'visibility' : 'visibility-off'}
                size={24}
                color="grey"
              />
            </TouchableOpacity>
          </View>
        </View>
        {passwordError ? <Text style={styles.error}>{passwordError}</Text> : null}

        <View style={styles.buttonContainer}>
          <MyButton onPress={handleLogin} title="Login" /> 
        </View>

        <View style={styles.orContainer}>
          <View style={styles.line} />
          <Text style={styles.orText}>Or With</Text>
          <View style={styles.line} />
        </View>

        <View style={styles.socialContainer}>
          <TouchableOpacity onPress={handleSocialLoginPress}>
            <Image
              source={require('../../assets/images/1.png')}
              style={styles.socialIcon}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleSocialLoginPress}>
            <Image
              source={require('../../assets/images/2.png')}
              style={styles.socialIcon}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.signupContainer}>
          <Text>Don't have an account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
            <Text style={styles.signupText}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
      {loading && (
        <Modal transparent={true} animationType="none">
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#6200EE" />
          </View>
        </Modal>
      )}
    </AlertNotificationRoot>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  logo: {
    width: 150,
    height: 150,
    alignSelf: 'center',
    marginBottom: 50,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#00004d',
    marginTop: 5,
  },
  input: {
    height: 41,
    backgroundColor: '#ffffff',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#c5c5c5',
    marginTop: 5,
    paddingHorizontal: 10,
  },
  inputContainer: {
    marginTop: 15,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#c5c5c5',
    borderRadius: 5,
    marginTop: 5,
    backgroundColor: '#fff',
    paddingRight: 10,
  },
  passwordInput: {
    flex: 1,
    height: 41,
    paddingHorizontal: 10,
  },
  error: {
    color: 'red',
    marginTop: 5,
  },
  buttonContainer: {
    marginTop: 20,
  },
  orContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#c5c5c5',
  },
  orText: {
    marginHorizontal: 10,
    textAlign: 'center',
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  socialIcon: {
    height: 40,
    width: 120,
    borderWidth: 1,
    borderColor: '#c5c5c5',
    borderRadius: 5,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 40,
  },
  signupText: {
    marginLeft: 5,
    color: '#351A96',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',  
  },
});

export default LoginScreen;
