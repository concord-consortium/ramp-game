# Ramp Game interactive

This repository reproduces the Ramp Game interactive used by Inquiry Space project, previously designed in NetLogo, in JavaScript.

## Testing

Latest published build:
http://ramp-game.concord.org/

Master deployment:
http://ramp-game.concord.org/branch/master/index.html

Authoring page:
http://ramp-game.concord.org/?authoring

Run in latest CODAP:

https://codap.concord.org/releases/latest?di=http://ramp-game.concord.org/?game

## Development

First, you need to make sure that webpack is installed and all the NPM packages required by this project are available:

```
npm install -g webpack
npm install
```
Then you can build the project files using:
```
webpack
```
or start webpack dev server:
```
npm install -g webpack-dev-server
webpack-dev-server
```
and open http://localhost:8080/ or http://localhost:8080/webpack-dev-server/ (auto-reload after each code change).

## Deployment

This project automatically deploys branches using a travis build script.
The branches are deployed to http://ramp-game.concord.org/branch/<banch>/index.html
see `.travis.yml` and `s3_deploy.sh` for more info.
