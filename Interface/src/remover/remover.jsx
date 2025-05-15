import React, { useState } from 'react';
import './remover.css';

function Remover() {
  const [image, setImage] = useState(null);
  const [filename, setFileName] = useState("No file chosen");
  const [inpaintedImage, setInpaintedImage] = useState(null);

  const handleImgChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setFileName(file.name);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) return;

    const formData = new FormData();
    formData.append('image', image);

    try {
      const response = await fetch("http://localhost:5000/inpaint", {
        method: "POST",
        body: formData
      });
      const data = await response.json();

      setInpaintedImage(`data:image/jpeg;base64,${data.inpaintedImage}`);
    } catch (error) {
      console.error("Fetch error:", error);
      alert("Failed to fetch. Is your Flask server running?");
    }
  };

  return (
    <div className='formContainer'>
      <h1>Upload your image for Object Removal:</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor='fileupload' className='fileUploaded'>Choose an image</label>
        <input
          type='file'
          id='fileupload'
          accept='image/*'
          onChange={handleImgChange}
        />
        <span className='fileName'>{filename}</span>
        <button type='submit' className='submit'>Remove</button>
      </form>

      {inpaintedImage && (
        <div className='imageFrame'>
          <h3>Inpainted Image (Objects Removed):</h3>
          <img src={inpaintedImage} alt='Inpainted Result' />
        </div>
      )}
    </div>
  );
}

export default Remover;
