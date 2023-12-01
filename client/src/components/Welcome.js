// WelcomePage.jsx
import React, { useState } from 'react';
import SignUp from './SignUp'; 
import SignIn from './SignIn'; 
import MainPage from './mainPage';

const WelcomePage = ({user}) => {
  const [showSignIn, setShowSignIn] = useState(true);
  const [showSignUp, setShowSignUp] = useState(false);
  const [redirectToFakeStackOverflow, setRedirectToFakeStackOverflow] = useState(false);
  const [onSignIn, setOnSignIn] = useState(false);


  const handleSignInClick = () => {
    setShowSignIn(true);
    setShowSignUp(false);
  };

  const handleSignUpClick = () => {
    setShowSignIn(false);
    setShowSignUp(true);
  };

  const handleGuestClick = () => {
    setRedirectToFakeStackOverflow(true)
  };

  const handleSignInSuccess = () => {
    setOnSignIn(true)
    setRedirectToFakeStackOverflow(true)
  };

  const buttonStyle = {
    borderRadius: '10px',
    backgroundColor: 'white',
    color: 'black',
    margin: '10px',
    padding: '20px', // Increased padding for a larger button
    fontSize: '20px', // Increased font size
    cursor: 'pointer',
    transition: 'background-color 0.3s, transform 0.3s',
    border: 'none',
    width: '250px', // Adjusted width for a larger button
  };

  if (redirectToFakeStackOverflow && onSignIn) {
    return <MainPage isAuthenticated={true} user={user}/>;
  } else if(redirectToFakeStackOverflow){
    return <MainPage isAuthenticated={false} user={null}/>;
  }

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'Arial, sans-serif' }}>
      {/* Left side */}
      <div style={{ flex: 1, backgroundColor: '#1e61ea', color: 'white', padding: '20px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '60px', margin: '30px', fontFamily: 'Arial Rounded MT Bold' }}>Welcome</h1>
        <p style={{ fontSize: '40px', margin: '12px 0', textAlign: 'left' }}>Join the Fake Stack OverFlow Community</p>
        <p style={{ fontSize: '20px', margin: '12px 0', textAlign: 'left' }}>📝 Get unstuck — ask a question</p>
        <p style={{ fontSize: '20px', margin: '12px 0', textAlign: 'left' }}>✅ Unlock new privileges like voting and commenting</p>
        <p style={{ fontSize: '20px', margin: '12px 0', textAlign: 'left' }}>🗃️ Save your favorite questions, answers, watch tags, and more</p>
        <p style={{ fontSize: '20px', margin: '12px 0 20px', textAlign: 'left' }}>🎗️ Earn reputation and badges</p>
        <h1 style={{ fontSize: '55px', margin: '30px', fontFamily: 'Arial Rounded MT Bold' }}></h1>
        <div>
          <button
            style={{ ...buttonStyle }}
            onClick={handleSignInClick}
          >
            Sign In
          </button>
          <br />
          <button
            style={{ ...buttonStyle }}
            onClick={handleSignUpClick}
          >
            Sign Up
          </button>
          <br />
          <button
            style={{ ...buttonStyle }}
            onClick={handleGuestClick}
          >
            Continue as Guest
          </button>
        </div>
      </div>

      {/* Right side */}
      <div style={{ flex: 1, backgroundColor: 'white', padding: '20px' }}>
        {showSignIn && <SignIn onSignInSuccess={handleSignInSuccess}/>} 
        {showSignUp && <SignUp />} 
      </div>
    </div>
  );
};

export default WelcomePage;
