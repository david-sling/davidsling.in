import React, { useState, lazy, Suspense } from "react";
import "./css/App.css";
//IMPORT LIBRARIES
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

//IMPORT ROUTES
import AppBar from "./components/AppBar";
import Loading from "./components/Loading";
import NotFound from "./components/Home/NotFound";
// import Home from "./components/Home/Home";
// import Contact from "./components/Contact/Contact";

const Home = lazy(() => import("./components/Home/Home"));
const Contact = lazy(() => import("./components/Contact/Contact"));

export default function App() {
  const [pageNow, setPageNow] = useState(null);
  const [navOpen, setNavOpen] = useState(false);
  // return <Loading />;
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
            <Suspense fallback={<Loading />}>
              <Home setPageNow={setPageNow} />
            </Suspense>
          </Route>
          <Route exact path="/contact">
            <Suspense fallback={<Loading />}>
              <Contact setPageNow={setPageNow} />
            </Suspense>
          </Route>
          <Route path="/" status={404}>
            <NotFound setPageNow={setPageNow} />
          </Route>
        </Switch>
      </Router>
    </div>
  );
}
