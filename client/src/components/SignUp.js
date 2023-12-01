// SignUp.jsx
import React, { useState } from 'react';
import MainPage from './mainPage';
import SignIn from './SignIn'; 
import axios from 'axios';

const SignUp = ({ setSuccessMessage }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState([]);
  const [redirectToLogin, setRedirectToLogin] = useState(false);

  const handleSignUp = async () => {
    const newErrors = [];

    
    if (!isValidEmail(email)) {
      newErrors.push('Please enter a valid email address.');
    }

    if (password.trim() !== confirmPassword.trim()) {
      newErrors.push('Passwords do not match.');
    }

    
    if (password.includes(email) || password.includes(username)) {
      newErrors.push('Password cannot contain email or username.');
    }
    setErrors(newErrors);
    if (newErrors.length > 0) {
      return;
    }

    try {
      const response = await axios.post('http://localhost:8000/signup', {
        username,
        email,
        password,
      });
      if (response.data.success) {
        console.log('Sign Up successful!');
        setSuccessMessage('Successfully signed up! Now login...');
        setRedirectToLogin(true);
      } else {
        setErrors([response.data.message] ||  'Username Taken/Email Already in Use');
      }
    } catch (error) {
        if(error.response){
            console.error('Error during sign-up:', error);
            setErrors([error.response.data.message]);
        } else{
            setErrors(['Error during sign-up. Please try again.']);
        }
    }
  };
  if (redirectToLogin) {
    return <SignIn />;
  }
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Sign Up</h2>
      <div style={styles.formContainer}>
        <label style={styles.label}>Username:</label>
        <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} style={styles.input} />
        <label style={styles.label}>Email:</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={styles.input} />
        <label style={styles.label}>Password:</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={styles.input} />
        <label style={styles.label}>Confirm Password:</label>
        <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} style={styles.input} />
        {errors.length > 0 && (
          <div>
            {errors.map((error, index) => (
              <p key={index} style={{ color: 'red' , fontSize: '20px'}}>
                {error}
              </p>
            ))}
          </div>
        )}
        <button style={styles.button} onClick={handleSignUp}>
          Sign Up
        </button>
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

export default SignUp;
