// background.js
// Runs in background of extension. Handles messages from content script,
// authentication, and calls to the GitHub API.

// API constants
const api_endpoint = "https://api.github.com";
const redirect_uri = chrome.identity.getRedirectURL("oauth2");

// Path of file that stores ethics data
const ethics_data_path = ".ethicsdata";

// Get application ID and secret from config
const config = require("../config");
const client_id = config.client_id;
const client_secret = config.client_secret;

// Ethics issue label constants
const ethics_label = {
  name: "ethics",
  color: "000000", // black
  description: "Ethical questions and concerns"
};

// buildQueryString creates a query string from the passed objects
const buildQueryString = (params: any) =>
  Object.keys(params)
    .map(key => [key, params[key]].map(encodeURIComponent).join("="))
    .join("&")
    .replace(/%20/g, "+");

// getRepoFromUrl returns
const getRepoFromUrl = (url: string) => {
  const reg = "/github.com/([^/]*)/([^/#]*)"; // regex to capture repo user and name
  const match = url.match(reg);
  if (match == null) {
    return ["", ""];
  } else {
    return [match[1], match[2]];
  }
};

// authorize begins a web authorization flow and saves the access token
const authorize = () =>
  new Promise((resolve, reject) => {
    chrome.identity.launchWebAuthFlow(
      {
        url:
          "https://github.com/login/oauth/authorize?" +
          buildQueryString({
            client_id,
            redirect_uri,
            scope: "repo user admin:repo_hook"
          }),
        interactive: true
      },
      redirectURL => {
        if (redirectURL == undefined) {
          return reject("no redirect url");
        }

        const params = new URLSearchParams(redirectURL.split("?")[1]);
        const code = params.get("code");

        if (code == null) {
          return reject("no code");
        }

        // Use code to get access token
        var data = new FormData();
        data.append("client_id", client_id);
        data.append("client_secret", client_secret);
        data.append("code", code);
        var xhr = new XMLHttpRequest();
        xhr.addEventListener("readystatechange", function(event) {
          if (xhr.readyState == 4) {
            if (this.status === 200) {
              // Successful exchange
              const params = new URLSearchParams(this.responseText);
              const accessToken = params.get("access_token");
              if (accessToken == null) {
                // No access token returned
              } else {
                // Set access token in local storage
                chrome.storage.local.set({ accessToken }, () => {
                  resolve(accessToken);
                });
              }
            } else {
              reject("bad response");
            }
          }
        });

        xhr.open("POST", "https://github.com/login/oauth/access_token");
        xhr.send(data);
      }
    );
  });

// Get token from local storage
const getToken = () =>
  new Promise((resolve, reject) => {
    chrome.storage.local.get("accessToken", result => {
      resolve(authorize());
    });
  });

// Make an API call
const api = async (url: string, options: any = { headers: {} }) => {
  const access_token = await getToken();

  options.headers = {
    ...options.headers,
    Authorization: "token " + access_token,
    "Content-Type": "application/json"
  };

  const response = await fetch(api_endpoint + url, options);
  const status = response.status;
  console.log(response);
  const data = await response.json();

  if (data.error) {
    switch (data.error.status) {
      case 404: {
        // Retry if unauthenticated, means that access token is wrong
        return new Promise((resolve, reject) => {
          chrome.storage.local.remove("accessToken", () => {
            resolve(api(url, options));
          });
        });
      }
    }
  }

  return { status: status, data: data };
};

// Get repositories
const getRepos = async (response: any) => {
  const repos = await api("/user/repos", { headers: {} });
  response(repos);
};

// Create a file
const createFile = async (
  message: string,
  location: string,
  path: string,
  content: string,
  response: any
) => {
  // TODO: do GET request to get replacement.
  const [repouser, reponame] = getRepoFromUrl(location);
  if (repouser == "" || reponame == "") return;
  const res = await api(`/repos/${repouser}/${reponame}/contents/${path}`, {
    method: "PUT",
    headers: {},
    body: JSON.stringify({ message: message, content: content })
  });
  response(res);
};

// Create ethics label
const createLabel = async (location: string, response: any) => {
  const [repouser, reponame] = getRepoFromUrl(location);
  if (repouser == "" || reponame == "") return;
  const res = await api(`/repos/${repouser}/${reponame}/labels`, {
    method: "POST",
    headers: {},
    body: JSON.stringify({ ethics_label })
  });
  response(res);
};

const getEthicsData = async (location: string, response: any) => {
  const [repouser, reponame] = getRepoFromUrl(location);
  if (repouser == "" || reponame == "") return;
  const res = await api(
    `/repos/${repouser}/${reponame}/contents/${ethics_data_path}`,
    { method: "GET", headers: {} }
  );
  response(res);
};

// Listen for messages from content script
chrome.runtime.onMessage.addListener((msg, sender, response) => {
  switch (msg.type) {
    case "getRepo":
      getRepos(response);
      break;
    case "createFile":
      createFile(msg.message, msg.location, msg.path, msg.content, response);
      break;
    case "getEthicsData": {
      getEthicsData(msg.location, response);
      break;
    }
    case "createLabel":
      createLabel(msg.location, response);
      break;
    default:
      response("unknown request");
      break;
  }
  return true;
});
