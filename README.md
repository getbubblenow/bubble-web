bubble-web
==========

Bubble frontend VueJS web application

The initial basis for the bubble-web frontend was Jason Watmore's wonderfully well-written
[Vue/Vuex Registration and Login Example](https://jasonwatmore.com/post/2018/07/14/vue-vuex-user-registration-and-login-tutorial-example).
The [LICENSE](vue-vuex-registration-login-example-docs/LICENSE) and [README.md](vue-vuex-registration-login-example-docs/README.md)
files for this code are in the [vue-vuex-registration-login-example-docs](vue-vuex-registration-login-example-docs) directory.

# Install Requirements
If you've ever built the Bubble API jar, you have already run `npm install` and can skip this step.

If you're not sure, it is safe to run it again, from this (the `bubble-web`) directory:
```shell script
npm install
```

# Build the Webapp
Bubble uses [webpack](https://webpack.js.org/) to build the Bubble VueJS webapp.

In the `bubble-web` directory, run this to build the webapp:
```shell script
webpack
```
The output files will be in the `bubble-web/dist` directory.

To perform a production build, run:
```shell script
webpack --mode=production
```

# Run Webapp with a Remote Bubble API Server
To connect to a remote Bubble API, set the `BUBBLE_API` environment variable and run:
```shell script
BUBBLE_API=https://bubble-api.example.com/api npm start 
```
This will run a local web server where you can use the webapp. The local web server will
proxy API calls to the remote Bubble API server.

# Run Webapp with a Local Bubble API Server
To run the backend API locally, run this from the `bubble` directory (one level above `bubble-web`):
```shell script
./bin/run.sh
```
If this is the first time you have run the Bubble API, you will need to
[activate](https://git.bubblev.org/bubblev/bubble/src/branch/master/docs/activation.md) it.

## Enable Hot Reloading
If you have a Bubble API running locally, you can update the web UI without restarting
the server.

Set the `BUBBLE_ASSETS_DIR` environment variable in the Bubble environment file to be the
path to the `bubble-web/dist` directory, then start the API server. It will serve static
assets from that directory, so you can update the webapp just by overwriting those files
via `webpack`.

To enable hot reloading: in your `${HOME}/.bubble.env` file, add this line (fix the path
to point to the correct location of your `bubble-web/dist` directory):
```shell script
export BUBBLE_ASSETS_DIR=/path/to/bubble-web/dist
```

You can now use and test the frontend.

If you make changes to the frontend code, you can simply run `webpack` again and
reload the page in your browser.
