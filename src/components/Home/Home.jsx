import React, { useEffect } from "react";
import Footer from "./Footer";
import { analytics } from "../../services/firebase";

import Hero from "./Hero";
import Skills from "./Skills";
import Works from "./Works";

export default function Home({ setPageNow }) {
  useEffect(() => {
    setPageNow("HOME");
    analytics.logEvent("event", "page_view", {
      page_path: "/",
      page_title: "HOME",
    });
  }, [setPageNow]);

  return (
    <div className="Home">
      <Hero />
      <Skills />
      <Works />
      <Footer />
    </div>
  );
}
