import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { analytics } from "../../services/firebase";

export default function NotFound({ setPageNow }) {
  useEffect(() => {
    setPageNow("404");
    analytics.logEvent("event", "page_view", {
      page_path: "/404",
      page_title: "NOT FOUND",
    });
  }, [setPageNow]);
  return (
    <div className="NotFound">
      <h1>404</h1>
      <p>Oops. The page you are looking for was not found.</p>
      <Link to="/">
        <button>Take me to the Home Page</button>
      </Link>
    </div>
  );
}
