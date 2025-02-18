import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Modal, KeyboardAvoidingView, Platform, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getAuth } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { firestore } from '../../../firebaseConfig';

const helpTopics = [
  { id: '1', title: 'How to change my password?', content: 'To change your password, go to Profile > Edit Icon > change password.' },
  { id: '2', title: 'How to update my profile?', content: 'To update your profile, go to Profile > Account > Update Profile.' },
  { id: '3', title: 'How to contact support?', content: 'To contact support, go to Profile > Contact Support.' },
  { id: '4', title: 'How to delete my account?', content: 'To delete your account, you can send a message via Email.' },
];

const HelpSupport = ({ navigation }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [user, setUser] = useState(null);

  const auth = getAuth();

  useEffect(() => {
    const fetchUserDetails = async (userId) => {
      const userDocRef = doc(firestore, 'users', userId);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUser({
          _id: userId,
          name: userData.fullName || '',
          email: userData.email || '',
        });
      }
    };

    const unsubscribe = auth.onAuthStateChanged((authenticatedUser) => {
      if (authenticatedUser) {
        fetchUserDetails(authenticatedUser.uid);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, [auth]);

  const openModal = (topic) => {
    setSelectedTopic(topic);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedTopic(null);
  };

  const handleContactSupport = () => {
    if (user) {
      const email = 'trollwarlord4444@gmail.com';
      const subject = 'Support Request';
      const body = `
        Hello Support Team,

        I am experiencing the following issue:

        [Please describe your issue here]

        User Details:
        Name: ${user.name}
        Email: ${user.email}
        User ID: ${user._id}

        Thank you.
      `;
      const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      Linking.openURL(mailtoUrl);
    } else {
      alert('You need to be logged in to contact support.');
    }
  };

  const renderHelpItem = ({ item }) => (
    <TouchableOpacity style={styles.helpItem} onPress={() => openModal(item)}>
      <Ionicons name="help-circle-outline" size={24} color="black" />
      <Text style={styles.helpItemText}>{item.title}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
      </View>
      <FlatList
        data={helpTopics}
        renderItem={renderHelpItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
      />
      <View style={styles.contactSupport}>
        <Text style={styles.contactTitle}>Need more help?</Text>
        <TouchableOpacity style={styles.contactButton} onPress={handleContactSupport}>
          <Ionicons name="mail-outline" size={24} color="white" />
          <Text style={styles.contactButtonText}>Contact Support via Email</Text>
        </TouchableOpacity>
      </View>

      {selectedTopic && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={closeModal}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalContainer}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{selectedTopic.title}</Text>
                <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                  <Ionicons name="close" size={24} color="#007BFF" />
                </TouchableOpacity>
              </View>
              <Text style={styles.modalText}>{selectedTopic.content}</Text>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e8f4fd', 
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
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white', 
  },
  content: {
    padding: 20,
  },
  helpItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  helpItemText: {
    marginLeft: 10,
    fontSize: 16,
  },
  contactSupport: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    backgroundColor: '#fff',
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#FF4500', 
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    backgroundColor: '#007BFF', 
    borderRadius: 8,
  },
  contactButtonText: {
    marginLeft: 10,
    fontSize: 16,
    color: 'white',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', 
  },
  modalContent: {
    width: '85%',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#32CD32',
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
  },
  closeButton: {
    padding: 5,
  },
});

export default HelpSupport;
