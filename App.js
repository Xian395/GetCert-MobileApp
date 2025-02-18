import 'react-native-gesture-handler'; // This must be the first import
import { enableScreens } from 'react-native-screens';
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AppRegistry, SafeAreaView } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { name as appName } from './app.json';
import { auth, firestore } from './firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

// Auth Screens
import LoginScreen from './screens/Auth/LoginScreen';
import SignupScreen from './screens/Auth/RegisterScreen';
import OnboardScreen from './screens/OnboardScreen';

// Dashboard Screens
import HomeScreen from './screens/User/UserDashboard';
import AdminScreen from './screens/Admin/AdminDashboard';

// Certificate Forms
import BarangayCertificate from './screens/User/CertificateForm/BarangayCertificate';
import BarangayClearance from './screens/User/CertificateForm/BarangayClearance';
import BusinessPermit from './screens/User/CertificateForm/BusinessPermit';
import BarangayResidency from './screens/User/CertificateForm/BarangayResidency';

// User Features
import PaymentScreen from './screens/User/Payment/PaymentScreen';
import ProfileScreen from './screens/User/Profile/ProfileScreen';
import About from './screens/User/Profile/About';
import HelpSupport from './screens/User/Profile/HelpSupport';

import Toast from 'react-native-toast-message';

enableScreens();
const Stack = createStackNavigator();

const App = () => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUser(user);
        const userRef = doc(firestore, 'users', user.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          setRole(userDoc.data().role);
        } else {
          console.log('No such document!');
        }
      } else {
        setUser(null);
        setRole(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const renderAuthStack = () => (
    <>
      <Stack.Screen name="Onboard" component={OnboardScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
    </>
  );

  const renderUserStack = () => (
    <>
      {/* Dashboard based on role */}
      {role === 'admin' ? (
        <Stack.Screen name="AdminDashboard" component={AdminScreen} />
      ) : (
        <Stack.Screen name="UserDashboard" component={HomeScreen} />
      )}

      {/* Certificate Forms */}
      <Stack.Screen name="BarangayCertificate" component={BarangayCertificate} />
      <Stack.Screen name="BarangayClearance" component={BarangayClearance} />
      <Stack.Screen name="BusinessPermit" component={BusinessPermit} />
      <Stack.Screen name="BarangayResidency" component={BarangayResidency} />

      {/* User Features */}
      <Stack.Screen name="PaymentScreen" component={PaymentScreen} />
      <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
      <Stack.Screen name="About" component={About} />
      <Stack.Screen name="HelpSupport" component={HelpSupport} />
    </>
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <SafeAreaView style={{ flex: 1 }}>
          <Stack.Navigator
            screenOptions={{
              headerShown: false,
            }}
          >
            {!user ? renderAuthStack() : renderUserStack()}
          </Stack.Navigator>
        </SafeAreaView>
        <Toast />
      </NavigationContainer>
    </GestureHandlerRootView>
  );
};

AppRegistry.registerComponent(appName, () => App);

export default App;