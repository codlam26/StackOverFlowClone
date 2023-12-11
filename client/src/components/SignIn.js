import React, { useState } from 'react';
import axios from 'axios';
import MainPage from './mainPage';

function SignIn({ onSignInSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [redirectToFakeStackOverflow, setRedirectToFakeStackOverflow] = useState(false);
  const [user, setUser] = useState(null);
  let isMounted = true;

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSignIn = async () => {
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    setError('');

    try {
      const response = await axios.post('http://localhost:8000/login', {
        email,
        password,
      }, { withCredentials: true });

      // if (isMounted) {
        if (response.data.success) {
          // Assuming response.data.user contains session info
          setUser(response.data.user);
          // setRedirectToFakeStackOverflow(true);
          onSignInSuccess(response.data.user);
        } else {
          setError(response.data.message || 'Invalid credentials');
        }
      //}
    } catch (error) {
      //if (isMounted) {
        if (error.response) {
          console.error('Error response:', error.response.data);
          setError(error.response.data.message || 'Invalid credentials');
        } else {
          setError('Error during sign-in. Please try again.');
        }
      //}
    }
  };

  // useEffect(() => {
  //   return () => {
  //     isMounted = false;
  //   };
  // }, []); 

  if (redirectToFakeStackOverflow) {
    return <MainPage username={user} />;
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Sign In</h2>
      <div style={styles.formContainer}>
        <label style={styles.label}>Email:</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={styles.input} />
        <label style={styles.label}>Password:</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={styles.input} />
        <button style={styles.button} onClick={() => {handleSignIn()}}>
          Sign In
        </button>
        {error && <p style={{ color: 'red', fontSize: '20px' }}>{error}</p>}
      </div>
    </div>
  );
};

const styles = {
  container: {
    width: '400px', 
    margin: 'auto',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '15px',
    border: '1px solid #ccc',
    padding: '20px', 
  },
  title: {
    fontSize: '28px', 
    margin: '15px 0', 
    textAlign: 'left',
  },
  formContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  label: {
    fontSize: '20px', 
    marginBottom: '10px', 
    textAlign: 'left',
  },
  input: {
    borderRadius: '15px', 
    padding: '15px', 
    marginBottom: '12px', 
    fontSize: '18px', 
  },
  button: {
    borderRadius: '15px', 
    backgroundColor: 'blue',
    color: 'white',
    padding: '15px', 
    fontSize: '17px', 
    marginTop: '12px', 
    cursor: 'pointer',
    ':hover': {
      backgroundColor: 'lightgray',
      transform: 'scale(1.05)',
    },
  },
};

export default SignIn;
