import * as React from "react";
import { HashRouter, Switch, Route } from "react-router-dom";
import Documentation from "./Documentation";
import NewDocumentation from "./NewDocumentation";
import Landing from "./Landing";
import { parse, Checklist, Section, Line } from "../lib/parser";

type State = {
  data: Checklist;
};

class Docs extends React.Component<{}, State> {
  constructor(props: any) {
    super(props);
    this.state = {
      data: {
        title: "",
        sections: []
      }
    };
    this.handleDataChange = this.handleDataChange.bind(this);
  }

  handleDataChange(newData: Checklist) {
    this.setState({ data: newData });
  }

  render() {
    return (
      <HashRouter basename="/ethics/docs">
        <Switch>
          <Route
            exact
            path="/"
            render={() => (
              <Landing
                data={this.state.data}
                onDataChange={this.handleDataChange}
              />
            )}
          />
          <Route
            path="/new"
            render={props => (
              <NewDocumentation
                {...props}
                data={this.state.data}
                onDataChange={this.handleDataChange}
              />
            )}
          />
          <Route
            path="/edit"
            render={props => (
              <Documentation {...props} initData={this.state.data} />
            )}
          />
        </Switch>
      </HashRouter>
    );
  }
}

export default Docs;
