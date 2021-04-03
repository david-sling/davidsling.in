import React, { useEffect } from "react";
import Footer from "./Footer";

import Hero from "./Hero";
import Skills from "./Skills";
import Works from "./Works";

export default function Home({ setPageNow }) {
  useEffect(() => {
    setPageNow("HOME");
  }, []);

  return (
    <div className="Home">
      <Hero />
      <Skills />
      <Works />
      <Footer />
    </div>
  );
}
