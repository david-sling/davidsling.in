import React, { useEffect } from "react";

export default function Contact({ setPageNow }) {
  useEffect(() => {
    setPageNow("CONTACT");
  }, []);

  return (
    <div className="Contact">
      <h3>DAVID SLING</h3> <br />
      <h4>+91 80725 39328</h4>
      <h4>sddavid.johan@gmail.com</h4>
      <div className="circle one"></div>
      <div className="circle two"></div>
    </div>
  );
}
