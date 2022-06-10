import React from 'react';
import { CameraIcon, TrashIcon } from '@heroicons/react/outline';
import { useState } from 'react';
import { useEffect } from 'react';
import { storage, db, auth } from '../firebase';
import { getDoc, doc, updateDoc } from 'firebase/firestore';
import {
  ref,
  getDownloadURL,
  uploadBytes,
  deleteObject,
} from 'firebase/storage';
import defaultAvatar from '../assets/default.png';

export default function Profile() {
  const [image, setImage] = useState('');
  const [user, setUser] = useState('');

  useEffect(() => {
    getDoc(doc(db, 'users', auth.currentUser.uid)).then((docSnap) => {
      if (docSnap.exists) {
        setUser(docSnap.data());
      }
    });

    if (image) {
      const uploadImage = async () => {
        const imgRef = ref(
          storage,
          user.avatarPath || `avatar/${new Date().getTime()}`
        );
        try {
          const snap = await uploadBytes(imgRef, image);
          const url = await getDownloadURL(ref(storage, snap.ref.fullPath));

          await updateDoc(doc(db, 'users', auth.currentUser.uid), {
            avatar: url,
            avatarPath: snap.ref.fullPath,
          });

          setImage('');
        } catch (err) {
        }
      };
      uploadImage();
    }
  }, [image]);

  const deleteImage = async () => {
    try {
      const confirm = window.confirm('Delete the profile pic?');
      if (confirm) {
        await deleteObject(ref(storage, user.avatarPath));
        await updateDoc(doc(db, 'users', auth.currentUser.uid), {
          avatar: null,
          avatarPath: null,
        });
      }
      getDoc(doc(db, 'users', auth.currentUser.uid)).then((docSnap) => {
        if (docSnap.exists) {
          setUser(docSnap.data());
        }
      });
    } catch (err) {
    }
  };

  return user ? (
    <div className="profile">
      <div className="profile_box">
        <div className="profile_container">
          <div>
            <img
              className="profile_img"
              src={user.avatar || defaultAvatar}
              alt="profile"
            />
            <label htmlFor="photo">
              <CameraIcon className="profile_change-icon" />
            </label>
            {user.avatar ? (
              <TrashIcon
                onClick={deleteImage}
                className="remove_profileImage"
              />
            ) : null}
            <input
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              id="photo"
              onChange={(e) => setImage(e.target.files[0])}
            />
          </div>

          <p>Name: {user.name}</p>
          <p>Email: {user.email}</p>
        </div>
        <p>Joined on: {user.createdAt.toDate().toDateString()}</p>
      </div>
    </div>
  ) : null;
}
