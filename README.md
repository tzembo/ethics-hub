# Welcome to EthicsHub

EthicsHub is a Google Chrome extension that modifies the GitHub user interface to integrate ethical questions and documentation into user workflows. The project hopes to alleviate the ethical issues that have arisen in artificial intelligence and machine learning, when models and datasets are widely available for potential misuse.

### Quickstart

To try out the extension, first clone the GitHub repository.

    git clone git@github.com:tzembo/ethics-hub.git

Before you build the extension, you'll need to create a `config.json` file in the root directory with two attributes, `client_id` and `client_secret` that correspond to the GitHub application's ID and secret. Contact me to receive these. Then, run the following:

    npm run build

Finally, load the `/dist` directory into Google Chrome through the extensions manager. Navigate to a GitHub repository and you should notice the Ethics tab in the navigation bar. Happy documenting!

### Collaborators

I would love help on this project going forward! If you're interested, send me an email at <tzembowicz@gmail.com>.
