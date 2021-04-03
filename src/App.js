import React, { useState } from "react";
import "./css/App.css";

//IMPORT LIBRARIES
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";

//IMPORT ROUTES
import AppBar from "./components/AppBar";
import Home from "./components/Home/Home";
import Contact from "./components/Contact/Contact";

export default function App() {
  const [pageNow, setPageNow] = useState(null);
  const [navOpen, setNavOpen] = useState(false);
  return (
    <div className="App">
      <Router>
        <AppBar
          pageNow={pageNow}
          setPageNow={setPageNow}
          navOpen={navOpen}
          setNavOpen={setNavOpen}
        />
        <Switch>
          <Route exact path="/">
            <Home setPageNow={setPageNow} />
          </Route>
          <Route exact path="/contact">
            <Contact setPageNow={setPageNow} />
          </Route>
          <Route path="/">
            <h1>404</h1>
          </Route>
        </Switch>
      </Router>
    </div>
  );
}
