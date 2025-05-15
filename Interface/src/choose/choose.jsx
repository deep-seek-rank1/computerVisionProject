import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState, useEffect } from "react";
import { DotLoader } from "react-spinners";
import { faUserPen } from "@fortawesome/free-solid-svg-icons";
import "./choose.css";
import ChooseComponent from "../choosecomponent/chooseComponent";

const ChooseLoader = ({ isVisible }) => (
  <div
    className={`choose-loader-overlay ${
      !isVisible ? "choose-loader-overlay--hidden" : ""
    }`}
  >
    <div className="choose-loader-content">
      <FontAwesomeIcon
        icon={faUserPen}
        className="choose-loader-icon"
        aria-hidden="true"
      />
      <DotLoader
        color="#fff"
        size={30}
        speedMultiplier={1}
        className="choose-loader-spinner"
        aria-label="Loading content"
      />
    </div>
  </div>
);

const Choose = () => {
  const [shouldRender, setShouldRender] = useState(true);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const fadeOutTimer = setTimeout(() => setIsVisible(false), 3400); // Reduced from 3600ms
    const unmountTimer = setTimeout(() => setShouldRender(false), 3600); // Reduced from 4500ms

    return () => {
      clearTimeout(fadeOutTimer);
      clearTimeout(unmountTimer);
    };
  }, []);

  return shouldRender ? (
    <ChooseLoader isVisible={isVisible} />
  ) : (
    <main className="content-container">
      <div className="title-contain">
        <h1 className="title">Categories</h1>
      </div>
      <div className="component-contain">
        <ChooseComponent
          img="/Assets/grayscale.jpg"
          name="Gray scale"
          link="/grayscale"
        />
        <ChooseComponent
          img="/Assets/picker.jpg"
          name="Color Picker"
          link="/picker"
        />
        <ChooseComponent
          img="/Assets/sketch.jfif"
          name="Sketching"
          link="/sketch"
        />
        <ChooseComponent
          img="/Assets/puzzle.jpg"
          name="Puzzle game"
          link="/puzzle"
        />
        <ChooseComponent
          img="/Assets/segment.png"
          name="Segmentation"
          link="/segment"
        />
        <ChooseComponent
          img="/Assets/detect.jpg"
          name="HOG Detection"
          link="/detect"
        />
        <ChooseComponent
          img="/Assets/remove.jpg"
          name="Object Remover"
          link="/remover"
        />
      </div>
    </main>
  );
};

export default Choose;
