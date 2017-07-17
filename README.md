# Inquiry Space 2
This repository reproduces the Inquiry Space project, previously designed in NetLogo, in Javascript.

## Testing
Latest published builds for the IS2 demo are deployed to https://concord-consortium.github.io/inquiry-space-2/

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
