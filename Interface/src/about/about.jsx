import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState, useEffect } from "react";
import "./about.css";
import { DotLoader } from "react-spinners";
import { faCameraRetro } from "@fortawesome/free-solid-svg-icons";

const Loader = ({ isVisible }) => {
  return (
    <div
      className={`about__loader-overlay ${
        !isVisible ? "about__loader-overlay--fade-out" : ""
      }`}
    >
      <div className="about__loader-content">
        <FontAwesomeIcon icon={faCameraRetro} className="about__loader-icon" />
        <DotLoader
          color="#fff"
          size={30}
          speedMultiplier={1}
          className="about__loader-spinner"
        />
      </div>
    </div>
  );
};

const About = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [loaderVisible, setLoaderVisible] = useState(true);
  const [contentLoaded, setContentLoaded] = useState(false);

  useEffect(() => {
    const hideLoader = setTimeout(() => {
      setIsLoading(false);
      setContentLoaded(true); // Trigger content loaded state
    }, 4000);

    const startFadeOut = setTimeout(() => {
      setLoaderVisible(false);
    }, 3500);

    return () => {
      clearTimeout(hideLoader);
      clearTimeout(startFadeOut);
    };
  }, []);

  const images = [
    "/Assets/6.jpg",
    "/Assets/photo1.jpg",
    "/Assets/photo2.jpg",
    "/Assets/photo3.jpg",
    "/Assets/4.jpg",
    "/Assets/5.jpg",
  ];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [animationClass, setAnimationClass] = useState("slide-in");

  if (images.length === 0) {
    return <div className="no-images">No images to display</div>;
  }

  const goToPrevious = () => {
    setAnimationClass("slide-out");
    setTimeout(() => {
      const isFirstImage = currentIndex === 0;
      const newIndex = isFirstImage ? images.length - 1 : currentIndex - 1;
      setCurrentIndex(newIndex);
      setAnimationClass("slide-in");
    }, 300); // must be shorter or equal to CSS animation duration
  };

  const goToNext = () => {
    setAnimationClass("slide-out");
    setTimeout(() => {
      const isLastImage = currentIndex === images.length - 1;
      const newIndex = isLastImage ? 0 : currentIndex + 1;
      setCurrentIndex(newIndex);
      setAnimationClass("slide-in");
    }, 300);
  };

  return (
    <>
      {isLoading && <Loader isVisible={loaderVisible} />}
      <div
        className={`about__container ${contentLoaded ? "content-loaded" : ""}`}
      >
        <header className="header-about">
          <h1>About Us</h1>
          <div className="header-underline"></div>
        </header>

        <div className="slider-page">
          <div className="slider">
            <button className="left-arrow" onClick={goToPrevious}>
              &lt;
            </button>

            <div className={`slide ${animationClass}`}>
              <img src={images[currentIndex]} alt={`Slide ${currentIndex}`} />
            </div>

            <button className="right-arrow" onClick={goToNext}>
              &gt;
            </button>

            <div className="dots-container">
              {images.map((_, index) => (
                <div
                  key={index}
                  className={`dot ${index === currentIndex ? "active" : ""}`}
                  onClick={() => {
                    if (index !== currentIndex) {
                      setAnimationClass("slide-out");
                      setTimeout(() => {
                        setCurrentIndex(index);
                        setAnimationClass("slide-in");
                      }, 300);
                    }
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default About;
