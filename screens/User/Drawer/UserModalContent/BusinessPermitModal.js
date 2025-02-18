import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image , Button} from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

const BusinessPermitModal = ({ item, getStatusColor, openImageModal }) => {

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
        <Text style={styles.modalText}><Text style={styles.boldText}>Owner Name:</Text> {item.fullName} {item.suffix}</Text>
        <Text style={styles.modalText}><Text style={styles.boldText}>Business Name:</Text> {item.companyName}</Text>
       
        <Text style={styles.modalText}><Text style={styles.boldText}>Business Type:</Text> {item.businessType}</Text>
        <Text style={styles.modalText}><Text style={styles.boldText}>Business Description:</Text> {item.businessDescription}</Text>
        <Text style={styles.modalText}><Text style={styles.boldText}>contact Number:</Text> {item.phoneNumber}</Text>
        <Text style={styles.modalText}><Text style={styles.boldText}>Number of Employees:</Text> {item.numberOfEmployees}</Text>
        <Text style={styles.modalText}><Text style={styles.boldText}>Requested Date:</Text> {item.createdAt}</Text>
        <Text style={styles.modalText}><Text style={styles.boldText}>Document:</Text></Text>

        <TouchableOpacity onPress={() => openImageModal([{ url: item.document }])}>
            <Image source={{ uri: item.document }} style={styles.image} />
        </TouchableOpacity>

        <Text style={styles.modalText}><Text style={styles.boldText}>Status:</Text> <Text style={getStatusColor(item.status)}>{item.status}</Text></Text>
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

export default BusinessPermitModal;