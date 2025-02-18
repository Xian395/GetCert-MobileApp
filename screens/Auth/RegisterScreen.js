import React, { useState, useEffect } from 'react';
import { View,  Text,  ImageBackground,  TextInput,  Image,  TouchableOpacity,  StyleSheet,  Modal,  ActivityIndicator,  ScrollView,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { MaterialIcons } from '@expo/vector-icons';
import { auth, firestore } from '../../firebaseConfig';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { doc, setDoc, collection, serverTimestamp} from 'firebase/firestore';
import Toast from 'react-native-toast-message';
import MyButton from '../../components/MyButton';
import { ALERT_TYPE, Dialog } from 'react-native-alert-notification';
import DateTimePicker from '@react-native-community/datetimepicker';

const RegisterScreen = ({ navigation }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [gender, setGender] = useState('');
  const [suffix, setSuffix] = useState('');
  const [civilStatus, setCivilStatus] = useState('');
  const [birthDate, setBirthDate] = useState(new Date());
  const [age, setAge] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);

  const suffixOptions = ['', 'Jr.', 'Sr.', 'II', 'III', 'IV', 'V'];
  const civilStatusOptions = ['Single', 'Married', 'Divorced', 'Widowed'];
  const genderOptions = ['Male', 'Female'];

  
  useEffect(() => {
    if (birthDate) {
      const today = new Date();
      const birthDateObj = new Date(birthDate);
      let calculatedAge = today.getFullYear() - birthDateObj.getFullYear();
      const m = today.getMonth() - birthDateObj.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDateObj.getDate())) {
        calculatedAge--;
      }
      setAge(calculatedAge.toString());
    }
  }, [birthDate]);



  const handleSignUp = async () => {
  
  if (!fullName || !email || !phoneNumber || !password || !gender || !civilStatus || !birthDate) {
    Toast.show({
      type: 'error',
      text1: 'Error',
      text2: 'All fields are required',
      textStyle: { fontSize: 16 },
    });
    return;
  }

  
  if (password !== confirmPassword) {
    Toast.show({
      type: 'error',
      text1: 'Error',
      text2: 'Passwords do not match',
      textStyle: { fontSize: 16 },
    });
    return;
  }

  
  if (password.length < 6) {
    Toast.show({
      type: 'error',
      text1: 'Error',
      text2: 'Password must be at least 6 characters long',
      textStyle: { fontSize: 16 },
    });
    return;
  }

  
  setLoading(true);

  try {
  
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    const userId = user.uid;

    const userDocRef = doc(firestore, 'users', userId);
    await setDoc(userDocRef, {
      id: userId,
      fullName,
      email,
      phoneNumber,
      gender,
      suffix: suffix || '', 
      civilStatus,
      birthDate: birthDate.toISOString(),
      age,
      role: 'user',
      createdAt: serverTimestamp() 
    });

    
    await sendEmailVerification(user);
    
    
    showAlert(
      ALERT_TYPE.SUCCESS, 
      'Registration Successful', 
      'Please check your email to verify your account.'
    );

  
    Toast.show({
      type: 'success',
      text1: 'Success',
      text2: 'Registration complete. Verify your email.',
      textStyle: { fontSize: 16 },
    });

    
    setTimeout(() => {
      navigation.navigate('Login');
    }, 3000);

  } catch (error) {
    
    let errorMessage = 'Registration failed';

    switch(error.code) {
      case 'auth/email-already-in-use':
        errorMessage = 'Email is already registered';
        break;
      case 'auth/invalid-email':
        errorMessage = 'Invalid email format';
        break;
      case 'auth/weak-password':
        errorMessage = 'Password is too weak';
        break;
      default:
        errorMessage = error.message;
    }


    Toast.show({
      type: 'error',
      text1: 'Registration Error',
      text2: errorMessage,
      textStyle: { fontSize: 16 },
    });

  } finally {
   
    setLoading(false);
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

  const handleSocialLoginPress = () => {
    showAlert(ALERT_TYPE.WARNING, 'Feature Coming Soon', 'This feature will be available soon.');
  };

  const onChangeBirthDate = (event, selectedDate) => {
    const currentDate = selectedDate || birthDate;
    setShowDatePicker(false);
    setBirthDate(currentDate);
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <ImageBackground
          source={require('../../assets/images/log.png')}
          style={styles.logo}
          resizeMode="cover"
        />
        <Text style={styles.title}>Create an account</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            value={fullName}
            onChangeText={setFullName}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={styles.input}
            value={email}
            placeholder='enter a valid email address only'
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            style={styles.input}
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Gender</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={gender}
              onValueChange={(itemValue) => setGender(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Select Gender" value="" />
              {genderOptions.map((option, index) => (
                <Picker.Item key={index} label={option} value={option} />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Suffix</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={suffix}
              onValueChange={(itemValue) => setSuffix(itemValue)}
              style={styles.picker}
            >
              {suffixOptions.map((option, index) => (
                <Picker.Item key={index} label={option || 'None'} value={option} />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Civil Status</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={civilStatus}
              onValueChange={(itemValue) => setCivilStatus(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Select Civil Status" value="" />
              {civilStatusOptions.map((option, index) => (
                <Picker.Item key={index} label={option} value={option} />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Birth Date</Text>
          <TouchableOpacity onPress={() => setShowDatePicker(true)}>
            <TextInput
              style={styles.input}
              value={birthDate.toDateString()}
              editable={false}
            />
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={birthDate}
              mode="date"
              display="default"
              onChange={onChangeBirthDate}
            />
          )}
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Age</Text>
          <TextInput
            style={styles.input}
            value={age}
            editable={false}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              value={password}
              onChangeText={setPassword}
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

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Confirm Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
            />
            <TouchableOpacity
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              <MaterialIcons
                name={showConfirmPassword ? 'visibility' : 'visibility-off'}
                size={24}
                color="grey"
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <MyButton onPress={handleSignUp} title="Sign Up" />
        </View>

        {loading && (
          <Modal transparent={true} animationType="none">
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#6200EE" />
            </View>
          </Modal>
        )}

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

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.footerLink}>Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  logo: {
    width: 100,
    height: 100,
    marginTop: 0,
  },
  title: {
    fontSize: 25,
    fontWeight: '600',
    color: '#000',
    marginTop: 20,
  },
  inputContainer: {
    width: '100%',
    marginTop: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#00004d',
  },
  input: {
    width: '100%',
    height: 41,
    backgroundColor: '#fff',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#c5c5c5',
    marginTop: 5,
    paddingHorizontal: 10,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#c5c5c5',
    borderRadius: 5,
    marginTop: 5,
    backgroundColor: '#fff',
  },
  picker: {
    height: 41,
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
  buttonContainer: {
    width: '100%',
    marginTop: 20,
  },
  orContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  orText: {
    fontSize: 14,
    color: '#000',
    marginHorizontal: 10,
    textAlign: 'center',
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#c5c5c5',
  },
  socialContainer: {
    flexDirection: 'row',
    marginTop: 20,
    justifyContent: 'space-between',
  },
  socialIcon: {
    height: 40,
    width: 120,
    borderWidth: 1,
    borderColor: '#c5c5c5',
    borderRadius: 5,
    marginHorizontal: 10,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#000',
  },
  footerLink: {
    fontSize: 14,
    color: '#6200EE',
    marginLeft: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
});

export default RegisterScreen;