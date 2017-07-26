import React, {PureComponent} from 'react'
import Plane from './plane'
import SimulationBase from './simulation-base'

const App = () => (
  <div className="appContainer">
    <SimulationBase message="Let's Time Stuff!" durationMs={2000}></SimulationBase>
  </div>
)

export default App