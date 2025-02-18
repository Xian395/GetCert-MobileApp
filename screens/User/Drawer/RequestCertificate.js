import { View, TouchableOpacity, Text, StyleSheet, ScrollView, Image } from 'react-native';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const RequestCertificate = ({ navigation }) => {
  return (
    <LinearGradient colors={['#E3F2FD', '#E0F7FA']} style={styles.gradient}>
      <ScrollView contentContainerStyle={styles.outerContainer}>
        <View style={styles.header}>
          <Image
            source={require('../../../assets/images/requestlogo.webp')}
            style={styles.headerImage}
            resizeMode="cover"
          />
          <Image
            source={require('../../../assets/images/header.png')}
            style={styles.headerImage2}
            resizeMode="cover"
          />
          <Text style={styles.subHeaderText}>Choose the type of certificate you need from the options below.</Text>
        </View>
        <View style={styles.card}>
          <TouchableOpacity onPress={() => navigation.navigate('BarangayCertificate')} style={styles.button1}>
            <Ionicons name="document-text-outline" size={24} color="white" />
            <Text style={styles.buttonText}>Barangay Certification</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('BarangayClearance')} style={[styles.button2, styles.spacing]}>
            <Ionicons name="checkmark-done-outline" size={24} color="white" />
            <Text style={styles.buttonText}>Barangay Clearance</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('BusinessPermit')} style={[styles.button3, styles.spacing]}>
            <Ionicons name="briefcase-outline" size={24} color="white" />
            <Text style={styles.buttonText}>Business Permit</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('BarangayResidency')} style={[styles.button4, styles.spacing]}>
            <Ionicons name="home-outline" size={24} color="white" />
            <Text style={styles.buttonText}>Barangay Residency</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  outerContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerImage: {
    width: '100%',
    height: 160,
    borderRadius: 0,
  },
  headerImage2: {
    width: 350,
    height: 130,
    borderRadius: 10,
    marginVertical: 10,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
  },
  subHeaderText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 5,
  },
  card: {
    width: '100%',
    backgroundColor: '#fff',
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
    borderRadius: 10,
  },
  button1: {
    flexDirection: 'row',
    width: '90%',
    height: 60, 
    borderRadius: 30,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center', 
    backgroundColor: '#4a90e2',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
    marginBottom: 10,
  },
  button2: {
    flexDirection: 'row',
    width: '90%',
    height: 60,
    borderRadius: 30,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#50e3c2',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
    marginBottom: 10,
  },
  button3: {
    flexDirection: 'row',
    width: '90%',
    height: 60,
    borderRadius: 30,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5a623',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
    marginBottom: 10,
  },
  button4: {
    flexDirection: 'row',
    width: '90%',
    height: 60,
    borderRadius: 30,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#9013fe',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
    marginBottom: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  spacing: {
    marginTop: 15,
  },
});

export default RequestCertificate;
