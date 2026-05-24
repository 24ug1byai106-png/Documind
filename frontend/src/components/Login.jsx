import React, { useState } from 'react';
import { ShieldAlert, User, Lock, Terminal, UserPlus } from 'lucide-react';
import './components.css';

export default function Login({ onLogin }) {
  const [isSignUp, setIsSignUp] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsAuthenticating(true);
    
    // Simulate auth delay for cyber effect
    setTimeout(() => {
      // Basic validation for any non-empty input to allow testing
      if (username && password) {
        onLogin({ isNewUser: isSignUp, username });
      } else {
        setError('ACCESS DENIED: Invalid credentials');
        setIsAuthenticating(false);
      }
    }, 1200);
  };

  return (
    <div className="login-wrapper">
      <div className="login-container hud-panel corner-brackets">
        <div className="login-header">
          {isSignUp ? (
            <UserPlus size={38} className="login-icon animate-pulse-glow" />
          ) : (
            <Terminal size={38} className="login-icon animate-pulse-glow" />
          )}
          <h2 className="login-title">DOCUMIND_OS</h2>
          <div className="login-subtitle">
            {isSignUp ? 'CREATE_NEW_USER // V_2.4.0' : 'AUTH_REQUIRED // V_2.4.0'}
          </div>
        </div>

        {error && (
          <div className="login-error">
            <ShieldAlert size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label className="form-label">IDENTIFIER</label>
            <div className="input-with-icon">
              <User size={16} className="input-icon" />
              <input 
                type="text" 
                className="form-input login-input" 
                placeholder="Enter identifier..."
                value={username}
                onChange={(e) => { setUsername(e.target.value); setError(''); }}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">PASSCODE</label>
            <div className="input-with-icon">
              <Lock size={16} className="input-icon" />
              <input 
                type="password" 
                className="form-input login-input" 
                placeholder="Enter passcode..."
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary login-btn"
            disabled={isAuthenticating}
          >
            {isAuthenticating 
              ? (isSignUp ? 'CREATING...' : 'VERIFYING...') 
              : (isSignUp ? 'CREATE ACCOUNT' : 'INITIALIZE SESSION')}
          </button>

          <button 
            type="button" 
            className="btn btn-secondary login-btn"
            style={{ marginTop: '0.5rem', border: 'none' }}
            onClick={() => { setIsSignUp(!isSignUp); setError(''); }}
            disabled={isAuthenticating}
          >
            {isSignUp ? 'Already have an account? Login' : 'New User? Create Account'}
          </button>
        </form>

        <div className="login-footer">
          SECURE_NODE_0X88 // ENCRYPTED_CHANNEL
        </div>
      </div>
    </div>
  );
}
