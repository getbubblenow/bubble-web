# Bubble Web Development
This document describes how to develop on the Bubble web application.

## Requirements
Along with expert-level knowledge of HTML, CSS and JavaScript, you'll need at least a basic understanding of:
 * [npm](https://www.npmjs.com/)
 * [webpack](https://webpack.js.org/)
 * [VueJS](https://vuejs.org/)
 * [Bootstrap](https://getbootstrap.com/)
 * [git](https://git-scm.com/)
 * [SSH](https://www.ssh.com/ssh/)
 * [rsync](https://linux.die.net/man/1/rsync) and/or [scp](https://linux.die.net/man/1/scp) commands

It will be easiest to develop on Linux or Mac OS X. If you are comfortable using all the above tools on Windows,
then there should be no problems developing on Windows.

In order to commit and push your changes to the `bubble-web` git repository, you will need an account on https://git.bubblev.org

## Development Setup
Ensure that you have installed and know how to use these programs at the command line:
  * `npm`
  * `webpack`
  * `git`
  * `ssh`
  * `rsync` or `scp`

Clone this repository:

    git clone git@git.bubblev.org:bubblev/bubble-web.git

Change into the `bubble-web` directory that was just created:

    cd bubble-web

Create a branch to do your work on:

    git checkout -b design/your-git-username

Install dependencies:

    npm install

Build it:

    webpack

## Development Process
As a web designer, the easiest way to develop the Bubble web UI will be to use a live, running instance of Bubble.

Ask another Bubble developer for access to a Bubble server instance.

Send your SSH public key to the developer, they can install it on the server.
With your key installed, you can copy files from your local system to the server.

After you have made changes to your local `bubble-web` code, package up the code for distribution:
 
    webpack

Copy your local build to the remote server:

    scp dist/* bubble@remote-server.example.com:site/

If you prefer to use `rsync` instead of `scp`:

    rsync -avzc dist/* bubble@remote-server.example.com:site/

Then reload the page https://remote-server.example.com/ in your web browser to see your changes.

## Committing and Pushing Changes
When you are ready save your changes, commit them to git and then push them to your branch.
