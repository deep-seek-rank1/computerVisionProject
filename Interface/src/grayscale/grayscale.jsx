import React, { useState } from 'react';
import './grayscale.css';

function Grayscale() {
  const [image, setImage] = useState(null);
  const [filename, setFileName] = useState("No file chosen");
  const [processedImage, setProcessedImage] = useState(null);

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

    const response = await fetch("http://localhost:5000/grayscale", {
      method: "POST",
      body: formData
    });
    const binaryResponse = await response.blob();
    const imgURL = URL.createObjectURL(binaryResponse);
    setProcessedImage(imgURL);
  };

  return (
    <div className='formContainer'>
      <h1>Upload your image for Grayscale:</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor='fileupload' className='fileUploaded'>Choose an image</label>
        <input
          type='file'
          id='fileupload'
          accept='image/*'
          onChange={handleImgChange}
        />
        <span className='fileName'>{filename}</span>
        <button type='submit' className='submit'>Convert</button>
      </form>

      {processedImage && (
        <div className='imageFrame'>
          <h3>Processed Image:</h3>
          <img src={processedImage} alt='Grayscale Result' />
        </div>
      )}
    </div>
  );
}

export default Grayscale;