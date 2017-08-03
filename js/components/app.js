import React, {PureComponent} from 'react'
import SimulationBase from './simulation-base'

const App = () => (
  <div className="appContainer">
    <SimulationBase width={document.body.clientWidth} height={document.body.clientHeight} groundheight={30}/>
  </div>
)

export default App