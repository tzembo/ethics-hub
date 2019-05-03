// App.tsx
// Top-level component for EthicsHub. Handles between components.

import * as React from "react";
import { HashRouter, Switch, Route, Redirect } from "react-router-dom";
import Landing from "./Landing";
import Docs from "./Docs";
import Discussion from "./Discussion";

class App extends React.Component {
  render() {
    return (
      <div id="ethics-hub-application">
        <HashRouter>
          <Switch>
            <Route
              exact
              path="/ethics"
              render={() => <Redirect to="/ethics/docs" />}
            />
            <Route path="/ethics/docs" component={Docs} />
            <Route path="/ethics/discussion" component={Discussion} />
          </Switch>
        </HashRouter>
      </div>
    );
  }
}

export default App;
