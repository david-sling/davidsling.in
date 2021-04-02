import React from "react";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";

import Logo from "../../assets/logo-white.svg";
import BlueArrow from "../../assets/blueArrow.svg";
import BlueLine from "../../assets/blueLine.svg";
import WhiteArrow from "../../assets/whiteArrow.svg";
import WhiteLine from "../../assets/whiteLine.svg";
import githubIcon from "../../assets/github.svg";

export default function Hero() {
  return (
    <div className="Hero">
      <div className="top">
        <div className="left">
          <div className="text">
            <p className="grey">Hi, I'm</p>
            <h1>DAVID</h1>
            <p className="primary">I build websites</p>
            <a href="https://github.com/david-sling" target="_blank">
              <button>
                <p>See GitHub Profile</p>
                <img src={githubIcon} alt="GitHub logo" />
              </button>
            </a>
          </div>
        </div>
        <div className="right">
          <img src={Logo} alt="David Sling Logo" />
        </div>
      </div>
      <div className="bottom">
        <div className="one">
          <div className="inner">
            <a href="#skills">
              <div className="link">
                <h4>MY SKILLS</h4>
                <div className="arrowLine">
                  <img className="arrow" src={WhiteArrow} alt="" />
                  <img className="line" src={WhiteLine} alt="" />
                </div>
              </div>
            </a>
          </div>
        </div>
        <div className="two">
          <div className="inner">
            <a href="#work">
              <div className="link">
                <h4>MY WORK</h4>
                <div className="arrowLine">
                  <img className="arrow" src={BlueArrow} alt="" />
                  <img className="line" src={BlueLine} alt="" />
                </div>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
