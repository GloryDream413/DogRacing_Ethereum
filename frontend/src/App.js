import React from "react";
import { BrowserRouter, Route, Switch, Redirect } from "react-router-dom";
import 'react-app-polyfill/ie11';
import 'react-app-polyfill/stable';
// styles for this kit
import "./input.css"
import "./assets/scss/now-ui-kit.scss?v=1.5.0";
// pages
import Home from "./pages/Home";

function App({...rest}) {
  return (
    <>
      <BrowserRouter>
        <Switch>
          <Route path="/" render={(props) => <Home {...props} />} />
        </Switch>
      </BrowserRouter>
    </>
  );
}

export default App;
