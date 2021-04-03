import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <div className="Footer">
      <div className="text">
        <h4>Thanks for visiting!</h4>
        <Link to="/contact">
          <button>CONTACT ME</button>
        </Link>
      </div>
    </div>
  );
}
