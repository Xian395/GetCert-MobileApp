import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Button } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';



  

const BarangayClearanceModal = ({ item, getStatusColor, openImageModal }) => {

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const generatePDF = async () => {
    
    const htmlContent = `
      <html>
        <head>
          <style>
           
          </style>
        </head>
        <body>
       
        </body>
      </html>
    `;

    try {
      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      await Sharing.shareAsync(uri);
    } catch (error) {
      Alert.alert('Error', 'An error occurred while generating the PDF.');
    }
  };



  
  return (
    <View>
      <Text style={styles.modalText}><Text style={styles.boldText}>Full Name:</Text> {item.fullName} {item.suffix}</Text>
      <Text style={styles.modalText}><Text style={styles.boldText}>Birth Date:</Text> {formatDate(item.birthDate)}</Text>
      <Text style={styles.modalText}><Text style={styles.boldText}>Age:</Text> {item.age}</Text>
      <Text style={styles.modalText}><Text style={styles.boldText}>Place of Birth:</Text> {item.placeOfBirth}</Text>
      <Text style={styles.modalText}><Text style={styles.boldText}>Gender:</Text> {item.gender}</Text>
      <Text style={styles.modalText}><Text style={styles.boldText}>Civil Status:</Text> {item.civilStatus}</Text>
      <Text style={styles.modalText}><Text style={styles.boldText}>Nationality:</Text> {item.nationality}</Text>
      <Text style={styles.modalText}><Text style={styles.boldText}>Address:</Text> {item.address}</Text>
      <Text style={styles.modalText}><Text style={styles.boldText}>Contact Number:</Text> {item.contactNumber}</Text>
      <Text style={styles.modalText}><Text style={styles.boldText}>Email Address:</Text> {item.emailAddress}</Text>
      <Text style={styles.modalText}><Text style={styles.boldText}>Status:</Text> <Text style={getStatusColor(item.status)}>{item.status}</Text></Text>
      <Text style={styles.modalText}><Text style={styles.boldText}>Requested Date:</Text> {item.createdAt}</Text>
      <Text style={styles.modalText}><Text style={styles.boldText}>Document:</Text></Text>
      <TouchableOpacity onPress={() => openImageModal([{ url: item.document }])}>
        <Image source={{ uri: item.document }} style={styles.image} />
      </TouchableOpacity>
      <Text></Text>
      {item.status === 'APPROVED' && (
        <Button title="Generate PDF" onPress={generatePDF} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  modalText: {
    marginBottom: 10,
    fontSize: 16,
    lineHeight: 22,
  },
  boldText: {
    fontWeight: 'bold',
  },
  image: {
    width: 100,
    height: 100,
    marginBottom: 10,
  },
});

export default BarangayClearanceModal;