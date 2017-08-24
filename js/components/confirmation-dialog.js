import React, { PureComponent } from 'react'
import Dialog from 'react-toolbox/lib/dialog'
import Checkbox from 'react-toolbox/lib/checkbox'
import dialogTheme from '../../css/dialog-theme.less'

export default class ConfirmationDialog extends PureComponent {
  get actions () {
    const { onHide, onConfirm } = this.props
    return [
      { label: 'Cancel', onClick: onHide },
      { label: 'OK', onClick: onConfirm }
    ]
  }

  render () {
    const { active, dontShowAgain, onHide, onDontShowAgainToggle, title, children } = this.props
    return (
      <div>
        <Dialog
          theme={dialogTheme}
          actions={this.actions}
          active={active}
          onEscKeyDown={onHide}
          onOverlayClick={onHide}
          title={title}
        >
          { children }
          <Checkbox
            className={dialogTheme.dontShowAgain}
            checked={dontShowAgain}
            label="Don't show this message again"
            onChange={onDontShowAgainToggle}
          />
        </Dialog>
      </div>
    )
  }
}
