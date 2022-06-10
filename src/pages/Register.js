import React from 'react';
import { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebase';
import { setDoc, doc, Timestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router';

const Register = () => {
  const [data, setData] = useState({
    name: '',
    email: '',
    password: '',
    error: null,
    loading: false,
  });

  const navigate = useNavigate();

  const { name, email, password, error, loading } = data;

  function handleChange(e) {
    setData({ ...data, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setData({ ...data, error: null, loading: true });
    if (!name || !email || !password) {
      setData({ ...data, error: '*All fields are required!' });
      return;
    }
    try {
      const result = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      await setDoc(doc(db, 'users', result.user.uid), {
        uid: result.user.uid,
        name,
        email,
        createdAt: Timestamp.fromDate(new Date()),
        isOnline: true,
      });
      setData({
        name: '',
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
          <h3>Register to Smash👏Chat</h3>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="regLogin_container">
            <input
              placeholder="Type your name..."
              type="text"
              className="regLogin-name"
              name="name"
              value={name}
              onChange={handleChange}
            />
            <input
              placeholder="Type your email..."
              type="text"
              name="email"
              className="regLogin-email"
              value={email}
              onChange={handleChange}
            />
            <input
              placeholder="Enter strong password.."
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
              {loading ? 'Registering...' : 'Register'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
