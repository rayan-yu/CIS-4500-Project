import React, { useState, useEffect } from 'react';
import { getAuth, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, FacebookAuthProvider} from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import firebase from '../firebaseConfig';
import soccer from '../soccer.svg';
import footylogo from '../footylogo.png';

const Login = () => {
  const history = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    // Update document title when login state changes
    document.title = isLoggedIn ? `Welcome to Footyfacts ${userName}!` : 'Login';
    document.body.style.fontFamily = "'Verdana', 'Geneva', sans-serif";
    document.body.style.fontSize = '20px';

  }, [isLoggedIn, userName]);

  const handleSignUp = () => {
    try {
      const displayName = name || 'User';
  
      setUserName(displayName);
      setIsLoggedIn(true);
    } catch (error) {
      console.error('Signup error:', error.message);
    }
  };

  const handleSocialLogin = async (provider) => {
    const auth = getAuth();

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      setUserName(user.displayName || user.email || 'User');
      handleLoginSuccess(user);
    } catch (error) {
      console.error(`${provider} login error:`, error.message);
    }
  };

  const handleGoogleLogin = () => {
    const provider = new GoogleAuthProvider();
    handleSocialLogin(provider);
  };

  const handleFacebookLogin = () => {
    const provider = new FacebookAuthProvider();
    handleSocialLogin(provider);
  };

  const handleLoginSuccess = (user) => {
    setIsLoggedIn(true);
    // history.push('/dashboard'); // Commented out to prevent redirect for demonstration
  };

  return (
    <div style={{ width: '300px', margin: 'auto', textAlign: 'left' }}>
      {isLoggedIn ? (
        <h2>Welcome to Footyfacts {userName}!</h2>
      ) : (
        <>
          <h2>Sign up</h2>
          <div>
            <label>Name:</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label>Email:</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label>Password:</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <button onClick={handleSignUp}>Sign up</button>
          <h2>Login</h2>
          <button onClick={handleGoogleLogin}>Login with Google</button>
          <button onClick={handleFacebookLogin}>Login with Facebook</button>
        </>
      )}
    </div>
  );
};

export default Login;
