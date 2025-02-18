
const dev = {
    XENDIT_API_KEY: 'xnd_development_L4Hq0mSH7SXdpVLSjPn1B4caaSf6RuyvIaR807XUza3vZKMxevV8n1sDC9ADQ',
    XENDIT_API_URL: 'https://api.xendit.co',
    PAYPAL_BASE_URL: 'https://firebaseadmin.onrender.com',
  };
  
 
  const prod = {
    XENDIT_API_KEY: 'your_production_xendit_api_key_here',
    XENDIT_API_URL: 'https://api.xendit.co',
    PAYPAL_BASE_URL: 'https://firebaseadmin.onrender.com',
  };
  

  const getEnvironment = () => {
  
    if (__DEV__) {
      return dev;
    }
    return prod;
  };
  
  export default getEnvironment();