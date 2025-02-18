import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons'; 
import HomeScreen from '../Admin/TabNavigation/HomeScreen';
import RequestManagement from '../Admin/TabNavigation/RequestManagement';
import UserManagement from '../Admin/TabNavigation/UserManagement';
import TransactionHistory from '../Admin/TabNavigation/TransactionHistory';

import { StatusBar, TouchableOpacity, Image, StyleSheet } from 'react-native';

const Tab = createBottomTabNavigator();

const AdminDashboard = ({ navigation }) => {
  return (
    <>
      <StatusBar backgroundColor="#ffffff" barStyle="dark-content" />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color }) => {
            let iconName;
            let iconSize = 32; 

            if (route.name === 'Home') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Request Management') {
              iconName = focused ? 'document-text' : 'document-text-outline';
            } else if (route.name === 'User Management') {
              iconName = focused ? 'people' : 'people-outline';
            } else if (route.name === 'Transaction') {
              iconName = focused ? 'card' : 'card-outline';
            } 

            return <Ionicons name={iconName} size={iconSize} color={color} />;
          },
          tabBarActiveTintColor: 'blue',
          tabBarInactiveTintColor: 'gray',
          tabBarStyle: { paddingBottom: 10, height: 75 }, 
          headerRight: () => (
            <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
              <Image 
                source={require('../../assets/images/logprof.jpg')} 
                style={styles.profileImage} 
              />
            </TouchableOpacity>
          ),
          headerShown: false,
          tabBarLabel: () => null,
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Request Management" component={RequestManagement} />
        <Tab.Screen name="User Management" component={UserManagement} />
        <Tab.Screen name="Transaction" component={TransactionHistory} />
       
      </Tab.Navigator>
    </>
  );
}

const styles = StyleSheet.create({
  profileImage: {
    width: 40,
    height: 40,
    marginRight: 20,
    borderRadius: 20,
    borderWidth: 2,
  },
});

export default AdminDashboard;
