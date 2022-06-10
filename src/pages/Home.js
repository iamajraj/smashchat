import {
  collection,
  onSnapshot,
  query,
  where,
  addDoc,
  Timestamp,
  orderBy,
  setDoc,
  doc,
  getDoc,
  updateDoc,
} from 'firebase/firestore';
import React from 'react';
import { useEffect } from 'react';
import { useState } from 'react';
import { useContext } from 'react';
import { Link } from 'react-router-dom';
import MessageForm from '../components/MessageForm';
import User from '../components/User';
import { AuthContext } from '../context/auth';
import { auth, db, storage } from '../firebase';
import { ref, getDownloadURL, uploadBytes } from 'firebase/storage';
import Message from '../components/Message';

export default function Home() {
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [chat, setChat] = useState('');
  const [text, setText] = useState('');
  const [img, setImg] = useState('');
  const [msgs, setMsgs] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [msgFrom, setMsgFrom] = useState(null);

  const user1 = auth.currentUser.uid;

  useEffect(() => {
    if (user) {
      const userRef = collection(db, 'users');
      const q = query(userRef, where('uid', 'not-in', [user1]));
      const unsub = onSnapshot(q, (querySnapshot) => {
        let users = [];
        querySnapshot.forEach((doc) => {
          users.push(doc.data());
        });
        setUsers(users);
      });
      return () => unsub();
    }
  }, []);

  const selectUser = async (user) => {
    setSelectedUser(user);
    setChat(user);

    const user2 = user.uid;
    const id = user1 > user2 ? `${user1 + user2}` : `${user2 + user1}`;

    const msgsRef = collection(db, 'messages', id, 'chat');
    const q = query(msgsRef, orderBy('createdAt', 'asc'));

    onSnapshot(q, (querySnapshot) => {
      let msgs = [];
      let isDone = false;
      querySnapshot.forEach((doc) => {
        msgs.push(doc.data());
        if (!isDone) {
          let id =
            doc.data().from !== auth.currentUser.uid
              ? doc.data().from
              : doc.data().to;
          setMsgFrom(id);
          isDone = true;
        }
      });
      setMsgs(msgs);
    });

    // Getting lastMsg data,
    const docSnap = await getDoc(doc(db, 'lastMsg', id));
    // if last msg exists and msg is from selected user
    if (docSnap.data() && docSnap.data().from !== user1) {
      // update last message doc, set it to false
      await updateDoc(doc(db, 'lastMsg', id), {
        unread: false,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const user2 = chat.uid;
    const id = user1 > user2 ? `${user1 + user2}` : `${user2 + user1}`;
    let url;
    if (img) {
      const imgRef = ref(
        storage,
        `images/${new Date().getTime()} - ${img.name}`
      );
      const snap = await uploadBytes(imgRef, img);
      const dlUrl = await getDownloadURL(ref(storage, snap.ref.fullPath));
      url = dlUrl;
    }
    await addDoc(collection(db, 'messages', id, 'chat'), {
      text,
      from: user1,
      to: user2,
      createdAt: Timestamp.fromDate(new Date()),
      media: url || '',
    });
    await setDoc(doc(db, 'lastMsg', id), {
      text,
      from: user1,
      to: user2,
      createdAt: Timestamp.fromDate(new Date()),
      media: url || '',
      unread: true,
    });
    setText('');
    setImg('');
  };

  return (
    <>
      {user ? (
        <div className="home_container">
          <div className="users_container">
            {users.map((user) => (
              <User
                chat={chat}
                user1={user1}
                selectUser={selectUser}
                key={user.uid}
                user={user}
              />
            ))}
          </div>
          <div className="messages_container">
            {chat ? (
              <>
                <div className="messages_user">
                  <h3>{chat.name}</h3>
                </div>
                <div className="messages">
                  {msgs.length && chat.uid === msgFrom
                    ? msgs.map((msg, index) => (
                        <Message key={index} msg={msg} user1={user1} />
                      ))
                    : null}
                </div>
                <MessageForm
                  handleSubmit={handleSubmit}
                  text={text}
                  setImg={setImg}
                  setText={setText}
                  img={img}
                />
              </>
            ) : (
              <h3 className="no_conv">Select a user to start conversation</h3>
            )}
          </div>
        </div>
      ) : (
        <InitialScreen />
      )}
    </>
  );
}

const InitialScreen = () => {
  return (
    <div
      className="initial_screen"
      style={{
        display: 'flex',
        alignItems: 'center',
        marginTop: '5rem',
        justifyContent: 'center',
        gap: '2rem',
        margin: '5rem 1rem',
      }}
    >
      <img style={{ width: '400px' }} src="/images/chat.svg" alt="" />
      <div>
        <h1>Smash👏Chat</h1>
        <p style={{ marginBottom: '3rem' }}>
          Chat with others with this <strike>Useless</strike> <b>Working</b>{' '}
          app😎
        </p>
        <Link style={{ width: '200px' }} to={'/register'} className="btn">
          Get started
        </Link>
      </div>
    </div>
  );
};
