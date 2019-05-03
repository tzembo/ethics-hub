// Discussion.tsx
// Top-level component for

import * as React from "react";

type Props = {};

type State = {};

class Documentation extends React.Component<Props, State> {
  constructor(props: any) {
    super(props);
  }

  addEthicsLabel() {
    chrome.runtime.sendMessage(
      { type: "createLabel", location: location },
      function(response) {}
    );
  }

  render() {
    return (
      <div className="flash">
        <strong>Discussion is still under construction.</strong> Check back
        later for tools allowing you to add an ethics label to your issue
        labels, as well as make and respond to requests for more documentation.
      </div>
    );
  }
}

export default Documentation;
