import React from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import 'react-app-polyfill/ie11';
import 'react-app-polyfill/stable';
// styles for this kit
import "./input.css"
import "./assets/scss/now-ui-kit.scss?v=1.5.0";
// pages
import Home from "./pages/Home";

import { WagmiConfig } from 'wagmi';
import { config } from './wallectConfig';

function App({...rest}) {
  return (
    <WagmiConfig config={config}>
      <BrowserRouter>
        <Switch>
          <Route path="/" render={(props) => <Home {...props} />} />
        </Switch>
      </BrowserRouter>
    </WagmiConfig>
  );
}

export default App;
