import { PureComponent } from 'react'

export default class DraggableComponent extends PureComponent {
  onHover = () => {
    const { draggable } = this.props
    if (draggable) {
      this.setState({ active: true })
      document.body.style.cursor = 'pointer'
    }
  }

  onHoverEnd = () => {
    const { draggable } = this.props
    if (draggable) {
      document.body.style.cursor = 'auto'
      this.setState({ active: false })
    }
  }

  onDragStart = () => {
    const { draggable, onUnallowedDrag } = this.props
    if (draggable) {
      if (this.props.onDragStart) {
        this.props.onDragStart()
      }
      this.setState({ active: true })
      document.addEventListener('mousemove', this.onDrag)
      document.addEventListener('mouseup', this.onDragEnd)
      document.addEventListener('touchmove', this.onDrag)
      document.addEventListener('touchend', this.onDragEnd)
    } else {
      onUnallowedDrag()
    }
  }

  onDragEnd = () => {
    const { draggable } = this.props
    if (draggable) {
      if (this.props.onDragEnd) {
        this.props.onDragEnd()
      }
      this.setState({ active: false })
      document.removeEventListener('mousemove', this.onDrag)
      document.removeEventListener('mouseup', this.onDragEnd)
      document.removeEventListener('touchmove', this.onDrag)
      document.removeEventListener('touchend', this.onDragEnd)
    }
  }

  onDrag = (e) => {
    const { onDrag } = this.props
    const x = e.touches ? e.touches[0].pageX : e.layerX
    const y = e.touches ? e.touches[0].pageY : e.layerY
    onDrag(x, y)
  }
}
