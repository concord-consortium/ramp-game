import 'babel-polyfill'
import React from 'react'
import { render } from 'react-dom'
import App from './components/app'
import Authoring from './components/authoring'
import { getURLParam } from './utils'

import '../css/app.less'

render(getURLParam('authoring') ? <Authoring /> : <App />, document.getElementById('app'))
