import { Fragment } from 'react'

// ** MUI Imports
import IconButton from '@mui/material/IconButton'

// ** Jotai imports
import { useAtom } from 'jotai'
import { showOscarChatAtom } from 'src/lib/atoms'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

import OscarChatSideBar from 'src/layouts/components/shared-components/OscarChatSideBar'

const OscarChatToggler = ({ settings, saveSettings }) => {
  const [showOscarChat, setShowOscarChat] = useAtom(showOscarChatAtom)

  const handleToggle = () => {
    setShowOscarChat(!showOscarChat)
  }

  return (
    <Fragment>
      <IconButton color='inherit' aria-haspopup='true' onClick={handleToggle}>
        <Icon icon={settings.mode === 'dark' ? 'mdi:robot' : 'mdi:robot'} />
      </IconButton>
      <OscarChatSideBar />
    </Fragment>
  )
}

export default OscarChatToggler
