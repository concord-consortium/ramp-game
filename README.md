# Inquiry Space 2

This repository reproduces the Inquiry Space project, previously designed in NetLogo, in JavaScript.

## Testing

Latest published builds for the IS2 demo:

https://concord-consortium.github.io/inquiry-space-2/

Authoring page:

https://concord-consortium.github.io/inquiry-space-2/?authoring

Run in latest CODAP:

https://codap.concord.org/releases/latest?di=https://concord-consortium.github.io/inquiry-space-2/?game

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

#### Github Pages:

Run `./build-and-deploy.sh`

Deploys to https://concord-consortium.github.io/inquiry-space-2/
