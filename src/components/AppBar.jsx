import React from "react";
import nav from "../config/nav";

import { Link } from "react-router-dom";
import close from "../assets/cancel.svg";
import menu from "../assets/menu.svg";

export default function AppBar({ pageNow, setPageNow, navOpen, setNavOpen }) {
  return (
    <div className="AppBar">
      <header>
        <p>
          <Link to="/">
            DAVID<span>SLING</span>
          </Link>
        </p>
        <img
          alt="menu"
          onClick={() => setNavOpen(true)}
          src={menu}
          className="menu"
        />
        <nav className={navOpen ? "open" : null}>
          {nav.map((link) => (
            <Link
              key={link.link}
              to={link.link}
              onClick={() => {
                setPageNow(link.name);
                setNavOpen(false);
              }}
            >
              <div
                className={pageNow === link.name ? "navLink active" : "navLink"}
              >
                <div className="cover"></div>
                <div className="text"> {link.name} </div>
              </div>
            </Link>
          ))}
          <div className="close" onClick={() => setNavOpen(false)}>
            {" "}
            <img alt="close" src={close} />{" "}
          </div>
        </nav>
      </header>
    </div>
  );
}
