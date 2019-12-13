# bubble-web

Bubble frontend VueJS web application

The initial basis for the bubble-web frontend was Jason Watmore's wonderfully well-written
[Vue/Vuex Registration and Login Example](https://jasonwatmore.com/post/2018/07/14/vue-vuex-user-registration-and-login-tutorial-example).
The [LICENSE](vue-vuex-registration-login-example-docs/LICENSE) and [README.md](vue-vuex-registration-login-example-docs/README.md)
files for this code are in the [vue-vuex-registration-login-example-docs](vue-vuex-registration-login-example-docs) directory.

To use this frontend with a Bubble API:

Build it:

    npm install
    webpack

In your `${HOME}/.bubble-test.env` file, add this line (fix the path to point to the correct location of your `bubble-web/dist` directory):

    export ASSETS_DIR=/path/to/bubble-web/dist

In the `bubble/bubble-server` directory, run the test named `bubble.test.dev.DevServerTest`, like so:

    mvn -Dtest=bubble.test.dev.DevServerTest test

You can now test the frontend. If you make changes to the frontend code, you can simply run `webpack` again and reload the page in your browser.
