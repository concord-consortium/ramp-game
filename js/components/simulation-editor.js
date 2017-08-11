import React from 'react'

const SimulationEditor = (props) => {
  let handleValueChange = function (evt) {
    props.onChange(evt.target.dataset.prop, evt.target.value)
  }

  function createInput (key, val) {
    let label = key
    return (
      <div key={key}>
        <span>{label}</span>
        <input type='text' data-prop={key} value={val} onChange={handleValueChange} />
      </div>
    )
  }

  function createConstantEditorForm () {
    let rows = []
    for (let key in props.simConstants) {
      let val = props.simConstants[key]
      rows.push(createInput(key, val))
    }
    return rows
  }

  return (
    <div className='sim-constants'>
      {createConstantEditorForm()}
    </div>
  )
}

export default SimulationEditor
