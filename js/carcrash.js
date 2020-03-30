import 'babel-polyfill'
import React from 'react'
import { render } from 'react-dom'
import App from './components/app'
import CarCrash from './components/car-crash'

render(<App simulation={CarCrash} />, document.getElementById('app'))
