import 'babel-polyfill'
import React from 'react'
import { render } from 'react-dom'
import App from './components/app'
import Authoring from './components/authoring'
import { getURLParam } from './utils'

render(getURLParam('authoring') ? <Authoring /> : <App />, document.getElementById('app'))
