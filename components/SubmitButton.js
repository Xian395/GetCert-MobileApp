import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import React from 'react'

const SubmitButton = ({ onPress, title, style, textStyle }) => {
  return (
    <TouchableOpacity 
    onPress={onPress} 
    style={[styles.button, style]}
  >
    <Text style={[styles.buttonText, textStyle]}>{title}</Text>
  </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
button: {
    backgroundColor: '#03DAC5',
    padding: 16,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});


export default SubmitButton