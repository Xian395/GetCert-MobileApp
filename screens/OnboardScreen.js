import React, { useEffect, useRef} from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet, ImageBackground, Dimensions } from 'react-native';

const OnboardScreen = ({ navigation }) => {
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const messageOpacity = useRef(new Animated.Value(0)).current;
  const buttonTextOpacity = useRef(new Animated.Value(1)).current;


  useEffect(() => {
    Animated.sequence([
      Animated.timing(titleOpacity, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.timing(messageOpacity, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(buttonTextOpacity, {
          toValue: 0,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(buttonTextOpacity, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [titleOpacity, messageOpacity, buttonTextOpacity]);

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../assets/slogo.png')} 
        style={styles.backgroundImage}
      />
      <View style={styles.card}>
        <Animated.Text style={[styles.titleText, { opacity: titleOpacity }]}>
          WELCOME!
        </Animated.Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('Login')}
          style={styles.button}
        >
          <Animated.Text style={[styles.buttonText, { opacity: buttonTextOpacity }]}>
            Get Started
          </Animated.Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const { height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  backgroundImage: {
    width: '100%',
    height: height * 0.75,
  },
  card: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 60,
    alignItems: 'center',
    elevation: 5,
    position: 'absolute',
    bottom: 90, 
  },
  titleText: {
    fontSize: 35,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 10,
  },
  messageText: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    width: '100%',
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#00BFA5',
    borderRadius: 25,
  },
  buttonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
  },
});

export default OnboardScreen;
