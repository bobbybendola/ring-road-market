import { useState, useEffect } from 'react';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';

function App() {
  const [user, setUser] = useState(null);
  const [showSignup, setShowSignup] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (userData, token) => {
    setUser(userData);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  if (user) {
    return <Dashboard user={user} onLogout={handleLogout} />;
  }

  return showSignup ? (
    <Signup onLogin={handleLogin} onSwitchToLogin={() => setShowSignup(false)} />
  ) : (
    <Login onLogin={handleLogin} onSwitchToSignup={() => setShowSignup(true)} />
  );
}

export default App;