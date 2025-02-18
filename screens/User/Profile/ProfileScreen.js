import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Modal, TextInput, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { signOut } from 'firebase/auth';
import { auth, firestore } from '../../../firebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import Toast from 'react-native-toast-message';
import { Picker } from '@react-native-picker/picker';



const ProfileScreen = ({ navigation }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [newProfileName, setNewProfileName] = useState('');
  const [newProfileEmail, setNewProfileEmail] = useState('');
  const [newProfilePhone, setNewProfilePhone] = useState('');
  const [newProfilePassword, setNewProfilePassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [warningMessage, setWarningMessage] = useState('');
  const [loginTime, setLoginTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [newProfileSuffix, setNewProfileSuffix] = useState('');

  const [userData, setUserData] = useState({ 
    fullName: '', 
    email: '', 
    suffix: '' 
  });

  const suffixOptions = ['', 'Jr.', 'Sr.', 'II', 'III', 'IV', 'V'];

  
  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        const userRef = doc(firestore, 'users', user.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserData({ 
            fullName: data.fullName, 
            email: data.email,
            suffix: data.suffix || '' 
          });
          setNewProfileName(data.fullName);
          setNewProfileEmail(data.email);
          setNewProfilePhone(data.phone || '');
          setNewProfileSuffix(data.suffix || ''); 
        } else {
          console.log('No such document!');
        }
      }
    };

    fetchUserData();

    const now = new Date();
    setLoginTime(now);
  }, []);
  const handleLogout = () => {
    setLogoutModalVisible(true);
  };



  const confirmLogout = () => {
    signOut(auth)
      .then(() => {
        navigation.navigate('Login');
      })
      .catch(error => {
        console.log(error);
      });
  };

  useEffect(() => {
    let interval;
    if (loginTime) {
      interval = setInterval(() => {
        const now = new Date();
        const elapsed = Math.floor((now - loginTime) / (1000 * 60));
        setElapsedTime(elapsed);
      }, 60000);

      const now = new Date();
      const elapsed = Math.floor((now - loginTime) / (1000 * 60));
      setElapsedTime(elapsed);
    }

    return () => clearInterval(interval);
  }, [loginTime]);

  const handleSave = async () => {
    if (newProfilePassword !== confirmPassword) {
      setWarningMessage('Passwords do not match');
      return;
    }

    setWarningMessage('');
    const user = auth.currentUser;
    if (user) {
      const userRef = doc(firestore, 'users', user.uid);
      await updateDoc(userRef, {
        fullName: newProfileName,
        email: newProfileEmail,
        phone: newProfilePhone,
        suffix: newProfileSuffix,
      });

      setUserData({
        fullName: newProfileName,
        email: newProfileEmail,
        suffix: newProfileSuffix, 
      });
      setEditModalVisible(false);
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Profile updated successfully.'
      });
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>
      <View style={styles.content}>
        <View style={styles.profileInfo}>
          <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.profilePicturePlaceholder}>
            <Image
              source={require('../../../assets/images/user.png')}
              style={styles.profilePicture}
              resizeMode="cover"
            />
          </TouchableOpacity>
          <View style={styles.profileDetails}>
          <Text style={styles.profileName}>
              {userData.fullName} 
              {userData.suffix ? `, ${userData.suffix}` : ''}
            </Text>
            <TouchableOpacity style={styles.editButton} onPress={() => setEditModalVisible(true)}>
              <Ionicons name="pencil" size={16} color="white" />
            </TouchableOpacity>
          </View>
          <View style={styles.profileUsernameContainer}>
            <Text style={styles.profileEmail}>{userData.email}</Text>
          </View>
        </View>

        <View style={styles.optionsFrame}>
          <TouchableOpacity style={styles.option} onPress={() => navigation.navigate('HelpSupport')}>
            <Ionicons name="help-circle-outline" size={24} color="black" />
            <Text style={styles.optionText}>Help & Support</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.option} onPress={() => navigation.navigate('About')}>
            <Ionicons name="information-circle-outline" size={24} color="black" />
            <Text style={styles.optionText}>About App</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.option} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color="black" />
            <Text style={styles.optionText}>Log out</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.settingsFrame}>
          <Text style={styles.sectionHeader}>Settings</Text>
          <TouchableOpacity style={styles.option}>
            <Ionicons name="notifications-outline" size={24} color="black" />
            <Text style={styles.optionText}>Notifications</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.option}>
            <Ionicons name="lock-closed-outline" size={24} color="black" />
            <Text style={styles.optionText}>Privacy</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.option}>
            <Ionicons name="language-outline" size={24} color="black" />
            <Text style={styles.optionText}>Language</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.activityFrame}>
          <Text style={styles.sectionHeader}>Recent Activity</Text>
          <View style={styles.activityItem}>
            <Text style={styles.activityText}>Logged in from a new device</Text>
            <Text style={styles.activityTimestamp}>{elapsedTime} minutes ago</Text>
          </View>
          <View style={styles.activityItem}>
            <Text style={styles.activityText}>Changed password</Text>
            <Text style={styles.activityTimestamp}>0 days ago</Text>
          </View>
          <View style={styles.activityItem}>
            <Text style={styles.activityText}>Updated profile picture</Text>
            <Text style={styles.activityTimestamp}>0 week ago</Text>
          </View>
        </View>

        <View style={styles.aboutSection}>
          <Text style={styles.aboutHeader}>About Me</Text>
          <Text style={styles.aboutText}>
            This is your profile screen. Here you can update your personal information, manage your preferences,
            and explore more about the app.
          </Text>
        </View>
      </View>

      <Modal
        transparent={true}
        animationType="slide"
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContent}>
            <Image
              source={require('../../../assets/images/user.png')}
              style={styles.enlargedProfilePicture}
              resizeMode="contain"
            />
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>


      <Modal
        transparent={true}
        animationType="slide"
        visible={editModalVisible}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContent}>
            
          <Text style={{ fontWeight: 'bold', color: 'blue', fontSize: 20 , padding: 15}}>
      Edit Profile
    </Text>
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              value={newProfileName}
              onChangeText={setNewProfileName}
            />
             <View style={styles.pickerContainer}>
               
                <Picker
                  selectedValue={newProfileSuffix}
                  onValueChange={(itemValue) => setNewProfileSuffix(itemValue)}
                  style={styles.picker}
                  mode="dropdown"
                >
                  {suffixOptions.map((suffix) => (
                    <Picker.Item 
                      key={suffix} 
                      label={suffix || 'None'} 
                      value={suffix} 
                    />
                  ))}
                </Picker>
              </View>
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={newProfileEmail}
              onChangeText={setNewProfileEmail}
            />
            <TextInput
              style={styles.input}
              placeholder="Phone"
              value={newProfilePhone}
              onChangeText={setNewProfilePhone}
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              secureTextEntry
              value={newProfilePassword}
              onChangeText={setNewProfilePassword}
            />
            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
            {warningMessage ? <Text style={styles.warningText}>{warningMessage}</Text> : null}
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setEditModalVisible(false)}
            >
              <Ionicons name="close" size={24} color="red" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Modal
        transparent={true}
        animationType="slide"
        visible={logoutModalVisible}
        onRequestClose={() => setLogoutModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.logoutModalContent}>
            <Text style={styles.logoutModalText}>Are you sure you want to log out?</Text>
            <View style={styles.logoutModalButtons}>
              <TouchableOpacity style={styles.logoutButton} onPress={confirmLogout}>
                <Text style={styles.logoutButtonText}>Yes</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelLogoutButton} onPress={() => setLogoutModalVisible(false)}>
                <Text style={styles.cancelButtonText}>No</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <View style={styles.footer}>
        <Text style={styles.footerText}>© 2024 YourApp. All rights reserved.</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#e8f4fd',
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#00BFA5',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  backButton: {
    paddingRight: 10,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 120
  },
  content: {
    flex: 1,
    padding: 20,
  },
  profileInfo: {
    alignItems: 'center',
    marginBottom: 30,
  },
  profilePicturePlaceholder: {
    marginBottom: 10,
  },
  profilePicture: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#bbb',
  },
  profileDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginRight: 5,
    color: '#333',
  },
  editButton: {
    backgroundColor: '#007BFF',
    borderRadius: 50,
    padding: 5,
  },
  profileUsernameContainer: {
    alignItems: 'center',
  },
  profileEmail: {
    fontSize: 18,
    color: '#666',
  },
  optionsFrame: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
    marginBottom: 20,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  optionText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
  settingsFrame: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  activityFrame: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
    marginBottom: 20,
  },
  activityItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  activityText: {
    fontSize: 16,
    color: '#333',
  },
  activityTimestamp: {
    fontSize: 14,
    color: '#999',
  },
  aboutSection: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  aboutHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  aboutText: {
    fontSize: 16,
    color: '#555',
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  enlargedProfilePicture: {
    width: 200,
    height: 200,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 5,
  },
  input: {
    width: '100%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    marginBottom: 10,
  },
  saveButton: {
    width: '100%',
    backgroundColor: '#00BFA5',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  warningText: {
    color: 'red',
    marginBottom: 10,
  },
  footer: {
    padding: 10,
    alignItems: 'center',
    backgroundColor: '#00BFA5',
  },
  footerText: {
    color: '#fff',
    fontSize: 14,
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  logoutModalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  logoutModalText: {
    fontSize: 18,
    marginBottom: 20,
    
  },
  logoutModalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  logoutButton: {
    backgroundColor: '#00BFA5',
    padding: 10,
    borderRadius: 5,
    marginRight: 25,
    paddingRight: 50
  },
  cancelLogoutButton: {
    backgroundColor: 'grey',
    padding: 10,
    borderRadius: 5,
    paddingRight: 50
  },
  logoutButtonText: {
    color: 'white',
    fontWeight: 'bold',
    paddingLeft: 30
  },
  cancelButtonText: {
    color: 'white',
    fontWeight: 'bold',
    paddingLeft: 30
  },
  pickerContainer: {
    width: '100%',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  pickerLabel: {
    paddingHorizontal: 10,
    paddingTop: 5,
    color: '#666',
    fontSize: 14,
  },
  picker: {
    width: '100%',
    height: 45,
  },
});

export default ProfileScreen;
