import React from 'react';
import { View, TouchableOpacity, StyleSheet, Image, Text, Linking } from 'react-native';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';

export default function CustomDrawerContent(props) {

  const openFacebook = () => {
    const url = 'https://www.facebook.com/profile.php?id=100066616354740';
    Linking.openURL(url).catch((err) => console.error("Couldn't load page", err));
  };

  const openGoogle = () => {
    const url = 'https://maps.app.goo.gl/U6FFca2VAQScczZX6';
    Linking.openURL(url).catch((err) => console.error("Couldn't load page", err));
  };

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={styles.container}>
      <View style={styles.logoContainer}>
        <Image
          source={require('../../../assets/images/log.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.logoText}>Barangay Certification</Text>
      </View>

      <DrawerItemList {...props} />

      <View style={styles.divider} />

      <View style={styles.infoSection}>
        <Text style={styles.infoHeader}>Quick Links</Text>
        <TouchableOpacity style={styles.infoLink} onPress={openFacebook}>
          <Text style={styles.infoLinkText}>Link 1 (Facebook)</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.infoLink} onPress={openGoogle}>
          <Text style={styles.infoLinkText}>Link 2 (Google)</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.divider} />

      <View style={styles.contactSection}>
        <Text style={styles.contactHeader}>Contact Us</Text>
        <Text style={styles.contactText}>Phone: 09639169551</Text>
        <Text style={styles.contactText}>Email: barangaycertification@gmail.com</Text>
      </View>
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginLeft: 10,
    marginBottom: 20,
  },
  logo: {
    width: 50,
    height: 50,
    marginRight: 10,
  },
  logoText: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: '#ccc',
    marginVertical: 10,
  },
  infoSection: {
    padding: 10,
  },
  infoHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  infoLink: {
    paddingVertical: 10,
  },
  infoLinkText: {
    fontSize: 14,
    color: '#00BFA5',
  },
  contactSection: {
    padding: 10,
  },
  contactHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  contactText: {
    fontSize: 14,
    color: '#333',
  },
});
