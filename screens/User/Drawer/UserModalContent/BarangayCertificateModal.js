import React from 'react';
import { View, Text, StyleSheet, Button, Alert } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { logoBase64 } from '../../../../components/logo'

const BarangayCertificateModal = ({ item, getStatusColor }) => {

  
  const generatePDF = async () => {
    const htmlContent = `
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 40px;
            }
            h1, h2, h3 {
              text-align: center;
            }
               .logo {
              width: 100px;
              height: auto;
              display: block;
              margin-left: auto;
              margin-right: auto;
            }
            .content {
              margin-top: 40px;
            }
            .signature {
              margin-top: 60px;
              display: flex;
              justify-content: space-between;
            }
            .signature div {
              width: 45%;
              text-align: center;
            }
            .underline {
              text-decoration: underline;
              display: inline-block;
              width: 100%;
            }
          </style>
        </head>
        <body>
        <img src="${logoBase64}" alt="Barangay Logo" class="logo" />
          <h1>Republic of the Philippines</h1>
          <h2>Province of Masbate</h2>
          <h3>Municipality of Cataingan</h3>
          <h3>BARANGAY MATAYUM</h3>
          <h2>Office of the Barangay Captain</h2>
          <h1>BARANGAY CERTIFICATION</h1>
          <div class="content">
            <p>TO WHOM IT MAY CONCERN:</p>
            <p>This is to certify that <span class="underline">${item.fullName}</span>, of legal age, is a bonafide resident of Matayum, Cataingan, Masbate for <span class="underline">${item.yearsInBarangay}</span> years and is known to me as a person with a good moral character and has no derogatory records before this office as of this date.</p>
            <p>This is to certify further that the above-name is currently working as <span class="underline">${item.currentJob}</span> of the fishing vessel name <span class="underline">${item.vesselName}</span>, owned and operated by <span class="underline">${item.vesselOwner}</span> for <span class="underline">${item.yearsWorking}</span> years.</p>
            <p>This certification is issued this <span class="underline">${item.createdAt}</span> day of <span class="underline">${item.monthIssued}</span> ${item.yearIssued} at Matayum, Cataingan, Masbate upon request of the undersigned for his application for license as <span class="underline">${item.licenseType}</span>.</p>
          </div>
          <div class="signature">
            <div>
              <p>______________________________</p>
              <p>Signature</p>
            </div>
            <div>
              <p>HON. JACKELINE V. RABOY</p>
              <p>Punong Barangay</p>
            </div>
          </div>
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
      <Text style={styles.modalText}><Text style={styles.boldText}>Age:</Text> {item.age}</Text>
      <Text style={styles.modalText}><Text style={styles.boldText}>Phone Number:</Text> {item.phoneNumber}</Text>
      <Text style={styles.modalText}><Text style={styles.boldText}>Gender:</Text> {item.gender}</Text>
      <Text style={styles.modalText}><Text style={styles.boldText}>Civil Status:</Text> {item.civilStatus}</Text>
      <Text style={styles.modalText}><Text style={styles.boldText}>Purpose:</Text> {item.purpose}</Text>
      <Text style={styles.modalText}><Text style={styles.boldText}>Status:</Text> <Text style={getStatusColor(item.status)}>{item.status}</Text></Text>
      <Text style={styles.modalText}><Text style={styles.boldText}>Requested Date:</Text> {item.createdAt}</Text>
      <Text></Text>
  
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

export default BarangayCertificateModal;
