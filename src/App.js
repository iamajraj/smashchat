import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Navbar from './components/Navbar';
import Register from './pages/Register';
import Login from './pages/Login';
import AuthProvider, { AuthContext } from './context/auth';
import Profile from './pages/Profile';
import { doc, updateDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { useEffect } from 'react';

function App() {
  const setStatus = async (status) => {
    if (auth.currentUser) {
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        isOnline: status,
      });
    }
  };

  useEffect(() => {
    setTimeout(() => {
      setStatus(true);
    }, 5000);
  }, []);

  window.addEventListener('beforeunload', async (ev) => {
    setStatus(false);
  });

  return (
    <>
      <AuthProvider>
        <Router>
          <Navbar />
          <Routes>
            <>
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/" element={<Home />} />
            </>
          </Routes>
        </Router>
      </AuthProvider>
    </>
  );
}

export default App;
