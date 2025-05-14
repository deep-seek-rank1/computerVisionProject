import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImage } from "@fortawesome/free-solid-svg-icons";
import { DotLoader } from "react-spinners";
import "./App.css";
import Welcome from "./welcomePage/welcomePage";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import About from "./about/about";
import Choose from "./choose/choose";
import Gray from "./grayscale/grayscale";
import Picker from "./picker/picker";
import Sketch from "./sketch/sketch";
import Segment from "./segment/segment";
import Detect from "./detect/detect";
import Puzzle from "./puzzle/puzzle";
import Remover from "./remover/remover";

const Loader = ({ isVisible }) => {
  return (
    <div className={`loader-overlay ${!isVisible ? "fade-out" : ""}`}>
      <div className="loader-content">
        <FontAwesomeIcon icon={faImage} className="image-icon" size="3x" />
        <DotLoader color="#fff" size={30} speedMultiplier={1} />
      </div>
    </div>
  );
};

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [loaderVisible, setLoaderVisible] = useState(true);

  useEffect(() => {
    const hideLoader = setTimeout(() => {
      setIsLoading(false);
    }, 4000);

    // Start fade out animation slightly before hiding
    const startFadeOut = setTimeout(() => {
      setLoaderVisible(false);
    }, 3500);

    return () => {
      clearTimeout(hideLoader);
      clearTimeout(startFadeOut);
    };
  }, []);

  return (
    <>
      {isLoading && <Loader isVisible={loaderVisible} />}
      <div className="app-content">
        <Router>
          <Routes>
            <Route path="/" element={<Welcome />} />
            <Route path="/about" element={<About />} />
            <Route path="/choose" element={<Choose />} />
            <Route path="/" element={<Choose />} />
            <Route path="/grayscale" element={<Gray />} />
            <Route path="/picker" element={<Picker />} />
            <Route path="/sketch" element={<Sketch />} />
            <Route path="/segment" element={<Segment />} />
            <Route path="/detect" element={<Detect />} />
            <Route path="/puzzle" element={<Puzzle />} />
            <Route path="/remover" element={<Remover />} />
          </Routes>
        </Router>
      </div>
    </>
  );
};

export default App;
