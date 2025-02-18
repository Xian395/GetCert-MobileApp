import * as React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import CustomDrawerContent from '../User/Drawer/CustomDrawer';
import MenuScreen from '../User/Drawer/MenuScreen';
import RequestCertificate from '../User/Drawer/RequestCertificate';
import Track from '../User/Drawer/Track';
import Transaction from '../User/Drawer/Transaction';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar, TouchableOpacity, Image, ImageBackground, StyleSheet, View, Text } from 'react-native';

const Drawer = createDrawerNavigator();

export default function App({ navigation }) {
  return (
    <>
      <StatusBar backgroundColor="#ffffff" barStyle="dark-content" />
      
      <Drawer.Navigator
        initialRouteName="Home"
        drawerContent={(props) => <CustomDrawerContent {...props} />}
        screenOptions={({ route }) => ({
          headerTitleAlign: 'center',
          headerTitleStyle: {
            fontSize: 20, 
            fontWeight: 'bold',
            color: 'black', 
          },
          headerRight: () => (
            <TouchableOpacity onPress={() => navigation.navigate('ProfileScreen')}>
              <Image 
                source={require('../../assets/images/user.png')} 
                style={styles.profileImage} 
              />
            </TouchableOpacity>
          ),
          drawerLabelStyle: styles.drawerLabel,
          drawerActiveTintColor: '#00BFA5',
          drawerInactiveTintColor: '#333',
          drawerStyle: styles.drawer,
          drawerItemStyle: styles.drawerItem,
        })}
      >
        <Drawer.Screen 
          name="Home" 
          component={MenuScreen}
          options={{
            drawerIcon: ({ color, size }) => (
              <Ionicons name="home-outline" color={color} size={size} />
            ),
          }}
        />
        <Drawer.Screen 
          name="Request Certificate" 
          component={RequestCertificate}
          options={{
            headerTitle: () => null,
            drawerIcon: ({ color, size }) => (
              <Ionicons name="document-outline" color={color} size={size} />
            ),
          }}
        />
        <Drawer.Screen 
          name="Track Request" 
          component={Track}
          options={{
            drawerIcon: ({ color, size }) => (
              <Ionicons name="trail-sign-outline" color={color} size={size} />
            ),
          }}
        />
        <Drawer.Screen 
          name="Payment Transaction" 
          component={Transaction}
          options={{
           
            drawerIcon: ({ color, size }) => (
              <Ionicons name="swap-horizontal-outline" color={color} size={size} />
            ),
          }}
        />
      </Drawer.Navigator>
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
  headerBackground: {
    width: '100%',
    height: 56, 
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 10,
    borderRadius: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  drawer: {
    backgroundColor: '#f4f4f4',
    width: 250,
  },
  drawerItem: {
    marginVertical: 5,
  },
  drawerLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: -15,
  },
});
