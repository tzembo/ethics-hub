// main.js
// Content script that runs on GitHub pages. Renders the GitHub UI changes
// and EthicsHub applications, and communicates with background script using
// messages.

import React from "react";
import ReactDOM from "react-dom";
import { HashRouter } from "react-router-dom";
import App from "./components/App";
import NavButton from "./components/NavButton";
import $ from "jquery";

console.log("Loading EthicsHub...");

// GitHub UI constants
const PAGEHEAD_CLASS = "pagehead";
const REPONAV_CLASS = "reponav";
const REPOSITORY_CONTENT_CLASS = "repository-content";

// EthicsHub UI constants
const E_BUTTON_ID = "e-button";

// Determine whether page needs new button
function shouldShowButton(mutation: MutationRecord) {
  if (mutation.addedNodes.length > 0) {
    let addedNode = <Element>mutation.addedNodes[0];
    if (
      addedNode.tagName == "DIV" &&
      addedNode.classList[0] == PAGEHEAD_CLASS
    ) {
      return true;
    } else {
      return false;
    }
  }
}

// Correct application hash?
function isAppHash() {
  if (window.location.hash == "#/ethics") {
    return true;
  } else {
    return false;
  }
}

// Run when page ready
$(document).ready(() => {
  var appVisible = false;
  var myVar = setInterval(onTimer, 500);

  function onTimer() {
    if (!appVisible && isAppHash()) {
      // Mark
      document
        .getElementsByClassName(REPONAV_CLASS)[0]
        .getElementsByClassName("selected")[0]
        .classList.remove("selected");
      let ethicsButton = document.getElementById(E_BUTTON_ID);
      if (ethicsButton != null) {
        (<Element>ethicsButton.childNodes[0]).classList.add("selected");
      }
      document.title = "Ethics";

      // Show application
      (<HTMLElement>(
        document.getElementsByClassName(REPOSITORY_CONTENT_CLASS)[0]
      )).style.display = "none";
      let repoContainer = document.getElementById("js-repo-pjax-container");
      if (repoContainer != null) {
        ReactDOM.render(
          React.createElement(App),
          repoContainer.getElementsByClassName(
            "new-discussion-timeline experiment-repo-nav"
          )[0]
        );
      }
    } else if (appVisible && !isAppHash()) {
      // Hide application
      (<HTMLElement>(
        document.getElementsByClassName(REPOSITORY_CONTENT_CLASS)[0]
      )).style.display = "visible";
    }
  }

  var target = <Node>$("#js-repo-pjax-container").get(0).parentNode;
  var reponav = document.getElementsByClassName(REPONAV_CLASS)[0];

  // Create button wrapper
  var navbutton = document.createElement("div");
  navbutton.id = E_BUTTON_ID;
  if (reponav) reponav.append(navbutton);

  // Render the NavButton component
  var ethicsButton = document.getElementById(E_BUTTON_ID);
  ReactDOM.render(React.createElement(NavButton), ethicsButton);

  // Observe GitHub UI for changes
  var observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (shouldShowButton(mutation)) {
        // Create NavButton wrapper
        navbutton = document.createElement("div");
        navbutton.id = E_BUTTON_ID;
        var reponav = document.getElementsByClassName(REPONAV_CLASS)[0];
        reponav.append(navbutton);

        // Render the NavButton component
        ethicsButton = document.getElementById(E_BUTTON_ID);
        ReactDOM.render(React.createElement(NavButton), ethicsButton);
      }
    });
  });
  observer.observe(target, { childList: true, subtree: true });
});
