import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Modal, TextInput, Button, Alert } from 'react-native';
import axios from 'axios';
import {  createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, collection } from 'firebase/firestore';
import { auth, firestore } from '../../../firebaseConfig';
import { Picker } from '@react-native-picker/picker';
import Toast from 'react-native-toast-message';

const API_URL = 'http://192.168.1.6:5000';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userRole, setUserRole] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [searchQuery, roleFilter]);


  
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/users`);
      setUsers(response.data);
      setFilteredUsers(response.data);
    } catch (error) {
      console.error('Error fetching users: ', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: `Error fetching users: ${error.message}`
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (userId) => {
    try {
      const response = await axios.delete(`${API_URL}/users/${userId}`);
      if (response.status === 200) {
        setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
        setFilteredUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'User deleted successfully'
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Failed to delete user'
        });
      }
    } catch (error) {
      console.error('Error deleting user: ', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: `Error deleting user: ${error.message}`
      });
    }
  };

  const confirmDeleteUser = (userId) => {
    Alert.alert(
      "Delete User",
      "Are you sure you want to delete this user?",
      [
        {
          text: "Cancel",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel"
        },
        { text: "OK", onPress: () => deleteUser(userId) }
      ],
      { cancelable: false }
    );
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setUserName(user.fullName);
    setUserEmail(user.email);
    setUserRole(user.role);
    setUserPhone(user.phone);
    setUserPassword('');
    setConfirmPassword('');
    setEditModalVisible(true);
  };

  const updateUser = async () => {

        // Check for empty fields
  if (
    !userName.trim() ||
    !userEmail.trim() ||
    !userRole.trim() ||
    !userPhone.trim() ||
    !userPassword.trim() ||
    !confirmPassword.trim()
  ) {
    Toast.show({
      type: 'error',
      text1: 'Error',
      text2: 'Please fill in all fields'
    });
    return;
  }
    if (userPassword !== confirmPassword) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Passwords do not match'
      });
      return;
    }

    try {
      const updatedData = {
        fullName: userName,
        email: userEmail,
        role: userRole,
        phone: userPhone,
        password: userPassword,
      };

      await axios.put(`${API_URL}/users/${selectedUser.id}`, updatedData);
      setUsers(prevUsers => prevUsers.map(user => user.id === selectedUser.id ? { ...user, ...updatedData } : user));
      setFilteredUsers(prevUsers => prevUsers.map(user => user.id === selectedUser.id ? { ...user, ...updatedData } : user));
      setEditModalVisible(false);
      setSelectedUser(null);
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'User updated successfully'
      });
    } catch (error) {
      console.error('Error updating user: ', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: `Error updating user: ${error.message}`
      });
    }
  };

  const openAddModal = () => {
    setUserName('');
    setUserEmail('');
    setUserRole('');
    setUserPhone('');
    setUserPassword('');
    setConfirmPassword('');
    setAddModalVisible(true);
  };



  const addUser = async () => {
    // Check for empty fields
  if (
    !userName.trim() ||
    !userEmail.trim() ||
    !userRole.trim() ||
    !userPhone.trim() ||
    !userPassword.trim() ||
    !confirmPassword.trim()
  ) {
    Toast.show({
      type: 'error',
      text1: 'Error',
      text2: 'Please fill in all fields'
    });
    return;
  }


  if (userPassword !== confirmPassword) {
    Toast.show({
      type: 'error',
      text1: 'Error',
      text2: 'Passwords do not match'
    });
    return;
  }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, userEmail, userPassword);
      const user = userCredential.user;

      const userDocRef = doc(collection(firestore, 'users'), user.uid);
      await setDoc(userDocRef, {
        id: user.uid,
        fullName: userName,
        email: userEmail,
        phone: userPhone,
        role: userRole,
      });

      setUsers(prevUsers => [...prevUsers, { id: user.uid, fullName: userName, email: userEmail, phone: userPhone, role: userRole }]);
      setFilteredUsers(prevUsers => [...prevUsers, { id: user.uid, fullName: userName, email: userEmail, phone: userPhone, role: userRole }]);

      setAddModalVisible(false);
      setUserName('');
      setUserEmail('');
      setUserRole('');
      setUserPhone('');
      setUserPassword('');
      setConfirmPassword('');

      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'User added successfully'
      });

    } catch (error) {
      console.error('Error adding user: ', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message
      });
    }
  };




  const handleSearch = (text) => {
    setSearchQuery(text);
    filterUsers(text, roleFilter);
  };



  const handleRoleFilter = (role) => {
    setRoleFilter(role);
    filterUsers(searchQuery, role);
  };



  const filterUsers = (query = searchQuery, role = roleFilter) => {
    let filtered = users;

    if (query) {
      filtered = filtered.filter(user =>
        user.fullName.toLowerCase().includes(query.toLowerCase()) ||
        user.email.toLowerCase().includes(query.toLowerCase()) ||
        user.role.toLowerCase().includes(query.toLowerCase()) ||
        user.phone.includes(query)
      );
    }

    if (role && role !== 'all') {
      filtered = filtered.filter(user => user.role.toLowerCase() === role.toLowerCase());
    }

    setFilteredUsers(filtered);
  };

  

  const renderUserItem = ({ item }) => (
    <View style={styles.userItem}>
      <Text style={styles.userName}>{item.fullName}</Text>
      <Text style={styles.userEmail}>{item.email}</Text>
      <Text style={styles.userRole}>{item.role}</Text>
      <Text style={styles.userPhone}>{item.phone}</Text>
      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={styles.editButton} onPress={() => openEditModal(item)}>
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteButton} onPress={() => confirmDeleteUser(item.id)}>
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>User Management</Text>
      </View>

      <TextInput
        style={styles.searchBar}
        placeholder="Search Users..."
        value={searchQuery}
        onChangeText={handleSearch}
      />

      <Picker
        selectedValue={roleFilter}
        style={[styles.picker, styles.customPicker]}
        onValueChange={handleRoleFilter}
      >
        <Picker.Item label="All Roles" value="all" />
        <Picker.Item label="Admin" value="admin" />
        <Picker.Item label="User" value="user" />
      </Picker>

      <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
        <Text style={styles.addButtonText}>Add User</Text>
      </TouchableOpacity>

      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <FlatList
          data={filteredUsers}
          renderItem={renderUserItem}
          keyExtractor={item => item.id}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyMessage}>No users available</Text>
            </View>
          }
          contentContainerStyle={styles.listContent}
        />
      )}

      {/* Edit User Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={editModalVisible}
        onRequestClose={() => {
          setEditModalVisible(!editModalVisible);
        }}
      >
        <View style={styles.modalView}>
          <Text style={styles.modalText}>EDIT USER</Text>
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            value={userName}
            onChangeText={setUserName}
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={userEmail}
            onChangeText={setUserEmail}
          />
          <View style={styles.pickerContainer}>
           <Picker
            selectedValue={userRole}
            onValueChange={(itemValue) => setUserRole(itemValue)}
            style={styles.picker1}
          >
            <Picker.Item label="Select Role" value="" />
            <Picker.Item label="Admin" value="admin" />
            <Picker.Item label="User" value="user" />
          </Picker>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Phone"
            value={userPhone}
            onChangeText={setUserPhone}
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            secureTextEntry={true}
            value={userPassword}
            onChangeText={setUserPassword}
          />
          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            secureTextEntry={true}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
          <View style={styles.modalButtons}>
            <Button title="Cancel" onPress={() => setEditModalVisible(false)} />
            <Button title="Save" onPress={updateUser} />
          </View>
        </View>
      </Modal>

      {/* Add User Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={addModalVisible}
        onRequestClose={() => {
          setAddModalVisible(!addModalVisible);
        }}
      >
        <View style={styles.modalView}>
          <Text style={styles.modalText}>ADD NEW USER</Text>
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            value={userName}
            onChangeText={setUserName}
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={userEmail}
            onChangeText={setUserEmail}
          />
          <View style={styles.pickerContainer}>
           <Picker
            selectedValue={userRole}
            onValueChange={(itemValue) => setUserRole(itemValue)}
            style={styles.picker1}
          >
            <Picker.Item label="Select Role" value="" />
            <Picker.Item label="Admin" value="admin" />
            <Picker.Item label="User" value="user" />
          </Picker>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Phone"
            value={userPhone}
            onChangeText={setUserPhone}
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            secureTextEntry={true}
            value={userPassword}
            onChangeText={setUserPassword}
          />
          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            secureTextEntry={true}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
          <View style={styles.modalButtons}>
            <Button title="Cancel" onPress={() => setAddModalVisible(false)} />
            <Button title="Add" onPress={addUser} />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#6200ee',
    padding: 15,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  searchBar: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 5,
    margin: 10,
    borderColor: '#ccc',
    borderWidth: 1,
  },
  picker: {
    height: 50,
    width: '100%',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    backgroundColor: '#fff',
    paddingHorizontal: 10,

  },
  customPicker: {
    // Add custom styling here
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,  // For Android
  },
  addButton: {
    backgroundColor: '#007bff',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
    alignSelf: 'center',
    marginVertical: 10,
    marginRight: 250,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,  // For Android
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  userItem: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 4,
    marginBottom: 16,
    marginHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  userEmail: {
    fontSize: 16,
    color: '#555',
  },
  userRole: {
    fontSize: 14,
    color: '#DE3163',
    fontWeight: 'bold'
  },
  userPhone: {
    fontSize: 14,
    color: '#888',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  editButton: {
    backgroundColor: '#28a745',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    marginRight: 8,
  },
  editButtonText: {
    color: '#fff',
  },
  deleteButton: {
    backgroundColor: '#dc3545',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  deleteButtonText: {
    color: '#fff',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 32,
  },
  emptyMessage: {
    fontSize: 18,
    color: '#555',
  },
  
  listContent: {
    paddingBottom: 32,
  },
  modalView: {
    margin: 20,
    marginTop: 120,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    marginBottom: 15,
    color: '#00BFA5',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
    width: '100%',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20
  },
  pickerContainer: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  picker1: {
    height: 40,
    width: '100%',
    paddingLeft: 8,  
    paddingRight: 30, 
    color: '#000', 
  },
});

export default UserManagement;
