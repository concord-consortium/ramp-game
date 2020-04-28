import 'babel-polyfill'
import React from 'react'
import { render } from 'react-dom'
import App from './components/app'
import PhoneDrop from './components/phone-drop'

render(<App simulation={PhoneDrop} />, document.getElementById('app'))
