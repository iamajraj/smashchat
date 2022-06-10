import React from 'react';
import { Link } from 'react-router-dom';
import { auth, db } from '../firebase';
import { signOut } from 'firebase/auth';
import { updateDoc, doc } from 'firebase/firestore';
import { useContext } from 'react';
import { AuthContext } from '../context/auth';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSignOut = async (e) => {
    e.preventDefault();
    try {
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        isOnline: false,
      });
      await signOut(auth);
      navigate('/');
    } catch (err) {
    }
  };
  return (
    <nav>
      <h3>
        <Link to="/">Smash👏Chat</Link>
      </h3>
      <div>
        {user ? (
          <>
            <Link className="btn" to="/profile">
              Profile
            </Link>
            <a href="/logout" onClick={handleSignOut} className="btn">
              Logout
            </a>
          </>
        ) : (
          <>
            <Link className="btn" to="/register">
              Register
            </Link>
            <Link className="btn" to="/login">
              Login
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
