import React, { useEffect, useState } from 'react';
import axios from 'axios'; // Import Axios
import SignUp from './SignUp'; 
import SignIn from './SignIn'; 
import MainPage from './mainPage';

function WelcomePage() {
  const [showSignIn, setShowSignIn] = useState(true);
  const [showSignUp, setShowSignUp] = useState(false);
  const [redirectToFakeStackOverflow, setRedirectToFakeStackOverflow] = useState(false);
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);


  // Function to handle successful authentication
  const handleAuthAccess = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  // Function to show sign-in page
  const showSignInPage = () => {
    setShowSignIn(true);
    setShowSignUp(false);
  };

  // Function to handle sign-in button click
  const handleSignInClick = () => {
    setShowSignIn(true);
    setShowSignUp(false);
  };

  // Function to handle sign-up button click
  const handleSignUpClick = () => {
    setShowSignIn(false);
    setShowSignUp(true);
  };

  // Function to handle guest button click
  const handleGuestClick = () => {
    setRedirectToFakeStackOverflow(true);
  };

  useEffect(() => {
    axios.get('http://localhost:8000/session', { withCredentials: true })
        .then(response => {
            if (response.data && response.data.loggedIn) {
                handleAuthAccess(response.data);
            }
        })
        .catch(error => console.error('Error fetching session:', error));
}, []);

useEffect(() => {
  if (isAuthenticated) {
      // Additional logic if needed after authentication
  }
}, [isAuthenticated, user]);

  if (isAuthenticated) {
    return <MainPage isAuthenticated={true} username={user}/>;
  } 
  else if (redirectToFakeStackOverflow) {
    return <MainPage isAuthenticated={false} username={null}/>;
  }

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ flex: 1, backgroundColor: '#1e61ea', color: 'white', padding: '20px', textAlign: 'center' }}>
      <h1 style={{ fontSize: '60px', margin: '30px', fontFamily: 'Arial Rounded MT Bold' }}>Welcome</h1>
        <p style={{ fontSize: '40px', margin: '12px 0', textAlign: 'left' }}>Join the Fake Stack OverFlow Community</p>
        <p style={{ fontSize: '20px', margin: '12px 0', textAlign: 'left' }}>📝 Get unstuck — ask a question</p>
        <p style={{ fontSize: '20px', margin: '12px 0', textAlign: 'left' }}>✅ Unlock new privileges like voting and commenting</p>
        <p style={{ fontSize: '20px', margin: '12px 0', textAlign: 'left' }}>🗃️ Save your favorite questions, answers, watch tags, and more</p>
        <p style={{ fontSize: '20px', margin: '12px 0 20px', textAlign: 'left' }}>🎗️ Earn reputation</p>
        <h1 style={{ fontSize: '55px', margin: '30px', fontFamily: 'Arial Rounded MT Bold' }}> </h1>
        <div>
          <button className='WelcomeButtonStyle' onClick={handleSignInClick}>Sign In</button>
          <br />
          <button className='WelcomeButtonStyle' onClick={handleSignUpClick}>Sign Up</button>
          <br />
          <button className='WelcomeButtonStyle' onClick={handleGuestClick}>Continue as Guest</button>
        </div>
      </div>
      <div style={{ flex: 1, backgroundColor: 'white', padding: '20px' }}>
        {showSignIn && <SignIn onSignInSuccess={handleAuthAccess}/>}
        {showSignUp && <SignUp onAuthAccess={handleAuthAccess} onSignInSuccess={() => showSignInPage(true)}/>}
      </div>
    </div>
  );
};

export default WelcomePage;

