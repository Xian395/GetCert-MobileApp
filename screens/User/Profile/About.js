import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const About = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About App</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <Image source={require('../../../assets/123.png')} style={styles.logo} />
        <Text style={styles.appTitle}>Certification Request App</Text>
        <Text style={styles.appVersion}>Version 1.0.0</Text>
        <Text style={styles.appDescription}>
          Welcome to the Certification Request App! This app is designed to streamline the process of requesting and managing certifications. Whether you need to apply for a new certification or track the status of your requests, our app provides a user-friendly interface and efficient workflow.
        </Text>
        <Text style={styles.appDescription}>
          Features:
        </Text>
        <View style={styles.featureList}>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
            <Text style={styles.appFeature}>Submit Certification Requests</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
            <Text style={styles.appFeature}>With integrated payments</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
            <Text style={styles.appFeature}>Track Request Status</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
            <Text style={styles.appFeature}>Manage Your Profile</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
            <Text style={styles.appFeature}>Access Certification Request History</Text>
          </View>
        </View>
        <Text style={styles.appDescription}>
          Our team is committed to providing a seamless experience and continuously improving the app with new features and updates. If you have any feedback or need assistance, please do not hesitate to reach out to us.
        </Text>
        <View style={styles.contactSection}>
          <Text style={styles.contactTitle}>Contact Us</Text>
          <TouchableOpacity onPress={() => Linking.openURL('mailto:barangaycertification@gmail.com')}>
            <Text style={styles.contactEmail}>barangaycertification@gmail.com</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    alignItems: 'center',
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  appTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  appVersion: {
    fontSize: 16,
    color: '#888',
    marginBottom: 20,
    textAlign: 'center',
  },
  appDescription: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
  },
  featureList: {
    width: '100%',
    marginBottom: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  appFeature: {
    fontSize: 16,
    marginLeft: 10,
  },
  contactSection: {
    alignItems: 'center',
    marginTop: 20,
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  contactEmail: {
    fontSize: 16,
    color: '#007BFF',
  },
});

export default About;
