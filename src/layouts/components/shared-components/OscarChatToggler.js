// ** MUI Imports
import IconButton from '@mui/material/IconButton'

// ** Next Import
import { useRouter } from 'next/router'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

const OscarChatToggler = props => {
  // ** Props
  const { settings, saveSettings } = props

  // ** Hooks
  const router = useRouter()

  const handleModeChange = mode => {
    saveSettings({ ...settings, mode: mode })
  }

  const handleModeToggle = () => {
    console.log('oscar chat toggler')
    router.push('/oscar')
  }

  return (
    <IconButton color='inherit' aria-haspopup='true' onClick={handleModeToggle}>
      <Icon icon={settings.mode === 'dark' ? 'mdi:robot' : 'mdi:robot'} />
    </IconButton>
  )
}

export default OscarChatToggler
