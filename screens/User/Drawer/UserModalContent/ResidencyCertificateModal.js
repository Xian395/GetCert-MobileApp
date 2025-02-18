import React from 'react';
import { View, Text, StyleSheet  , Button} from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

const ResidencyCertificateModal = ({ item, getStatusColor }) => {

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
              <Text style={styles.modalText}><Text style={styles.boldText}>Place of Birth:</Text> {item.placeOfBirth}</Text>
              <Text style={styles.modalText}><Text style={styles.boldText}>Gender:</Text> {item.gender}</Text>
              <Text style={styles.modalText}><Text style={styles.boldText}>Civil Status:</Text> {item.civilStatus}</Text>
              <Text style={styles.modalText}><Text style={styles.boldText}>Contact:</Text> {item.contactNumber}</Text>
              <Text style={styles.modalText}><Text style={styles.boldText}>Email Address (optional):</Text> {item.emailAddress}</Text>
              <Text style={styles.modalText}><Text style={styles.boldText}>Nationality:</Text> {item.nationality}</Text>
              <Text style={styles.modalText}><Text style={styles.boldText}>Occupation:</Text> {item.occupation}</Text>
              <Text style={styles.modalText}><Text style={styles.boldText}>Current Address:</Text> {item.currentAddress}</Text>
              <Text style={styles.modalText}><Text style={styles.boldText}>Length of Residency:</Text> {item.lengthOfStay}</Text>
              <Text style={styles.modalText}><Text style={styles.boldText}>Previous Address:</Text> {item.previousAddress}</Text>
              <Text style={styles.modalText}><Text style={styles.boldText}>Reason for Request:</Text> {item.reason}</Text>
              <Text style={styles.modalText}><Text style={styles.boldText}>Requested Date:</Text> {item.createdAt}</Text>
              <Text style={styles.modalText}><Text style={styles.boldText}>Status:</Text> <Text style={getStatusColor(item.status)}>{item.status}</Text></Text>
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
});

export default ResidencyCertificateModal;