import React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { signInWithEmailAndPassword } from 'firebase/auth';

const Login = () => {
  const [data, setData] = useState({
    email: '',
    password: '',
    error: null,
    loading: false,
  });

  const navigate = useNavigate();

  const { email, password, error, loading } = data;

  function handleChange(e) {
    setData({ ...data, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setData({ ...data, error: null, loading: true });
    if (!email || !password) {
      setData({ ...data, error: '*All fields are required!' });
      return;
    }
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      await updateDoc(doc(db, 'users', result.user.uid), {
        isOnline: true,
      });
      setData({
        email: '',
        password: '',
        error: null,
        loading: false,
      });
      navigate('/');
    } catch (err) {
      setData({ ...data, error: err.message, loading: false });
    }
  }

  return (
    <div className="regLogin">
      <div className="regLogin_box">
        <div className="regLogin_heading">
          <h3>Login to Smash👏Chat</h3>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="regLogin_container">
            <input
              placeholder="Type your email..."
              type="text"
              name="email"
              className="regLogin-email"
              value={email}
              onChange={handleChange}
            />
            <input
              placeholder="Type your password.."
              type="password"
              name="password"
              className="regLogin-password"
              value={password}
              onChange={handleChange}
            />
            {error ? <p className="regLogin_errorMessage">{error}</p> : null}
            <button
              disabled={loading}
              className={`regLogin-btn btn ${loading && 'btnLoading'}`}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
