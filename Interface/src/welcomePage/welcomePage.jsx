import { Link } from "react-router-dom";
import "./welcomePage.css";
import "./media.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHandPointUp } from "@fortawesome/free-regular-svg-icons";

const Welcome = () => {
  return (
    <div className="container">
      <header>
        <div className="logo-container">
          <img src="Assets/logo.png" alt="logo" />
          <p>DeepSeek #1</p>
        </div>
        <div className="nav">
          <li>
            <Link to="#">Home</Link>
          </li>
          <li>
            <Link to="/about">About us</Link>
          </li>
        </div>
        <div className="dark"></div>
      </header>
      <section className="info">
        <div className="words">
          <span>IMAGE</span>
          <span className="title">PROCCESSOR</span>
          <p>
            A website that helps you <b>edit</b> your <b>images</b>{" "}
          </p>
          <div className="start-btn">
            <Link to="/choose" className="start-a">
              Start
            </Link>
            <div className="click">
              <FontAwesomeIcon
                icon={faHandPointUp}
                size={"30px"}
                color={"rgb(81, 100, 70)"}
                className={`hand-icon `}
              />
            </div>
          </div>
        </div>
        <div className="gif">
          <img src="Assets/welcome.png" />
        </div>
      </section>

      <section className="section-2">
        <div className="content">
          <div className="div-1">
            <img src="Assets/bottom.png" />
          </div>
          <div className="div-2">
            Our website helps you edit your image easily
          </div>
          <div className="div-3">With a nice and user-friendly interface</div>
          <div className="div-4">Created by DeepSeek#1</div>
        </div>
      </section>
    </div>
  );
};
export default Welcome;
