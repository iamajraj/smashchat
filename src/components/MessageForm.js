import React from 'react';
import { UploadIcon } from '@heroicons/react/outline';
import { useState } from 'react';

const MessageForm = ({ handleSubmit, text, setText, setImg, img }) => {
  const [showImg, setShowImg] = useState('');

  const handleShowImage = (e) => {
    setImg(e.target.files[0]);
    let fr = new FileReader();
    fr.onload = () => {
      setShowImg(fr.result);
    };
    fr.readAsDataURL(e.target.files[0]);
  };

  return (
    <form className="message_form" onSubmit={handleSubmit}>
      {img && (
        <>
          <img width={'30px'} src={showImg} alt="" />
        </>
      )}
      <label htmlFor="img" style={{ cursor: 'pointer' }}>
        <UploadIcon width={'25px'} height={'25px'} />
      </label>
      <input
        onChange={handleShowImage}
        type="file"
        id="img"
        accept="image/*"
        style={{ display: 'none' }}
      />
      <input
        type="text"
        placeholder="Enter message"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <div>
        <button className="btn">Send</button>
      </div>
    </form>
  );
};

export default MessageForm;
