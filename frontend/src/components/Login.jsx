import React, { useState } from 'react';
import { ShieldAlert, User, Lock, Terminal, UserPlus } from 'lucide-react';
import './components.css';

const API_BASE = window.location.origin.includes('localhost:5173') 
  ? 'http://localhost:8000/api' 
  : `${window.location.origin}/api`;

export default function Login({ onLogin }) {
  const [isSignUp, setIsSignUp] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Username validation: no numbers allowed
    if (/\d/.test(username)) {
      setError('ACCESS DENIED: Identifier cannot contain numbers.');
      return;
    }

    // Password validation: only numbers allowed
    if (!/^\d+$/.test(password)) {
      setError('ACCESS DENIED: Passcode must contain only numbers.');
      return;
    }

    setIsAuthenticating(true);
    
    try {
      const endpoint = isSignUp ? '/signup' : '/login';
      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || 'Authentication failed');
      }

      if (data.success) {
        onLogin({ isNewUser: isSignUp, username });
      } else {
        throw new Error(data.message || 'Authentication failed');
      }
    } catch (err) {
      setError(`ACCESS DENIED: ${err.message}`);
    } finally {
      setIsAuthenticating(false);
    }
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
