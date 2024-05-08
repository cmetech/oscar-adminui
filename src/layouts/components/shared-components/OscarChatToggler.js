import { useState, Fragment, useContext } from 'react'

// ** MUI Imports
import IconButton from '@mui/material/IconButton'

// ** Next Import
import { useRouter } from 'next/router'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import ChatBot from 'src/views/chat'
import Box from '@mui/material/Box'
import { styled, useTheme } from '@mui/material/styles'
import Drawer from '@mui/material/Drawer'

// Define the responsive Box using styled
const ResponsiveBox = styled(Box)(({ theme }) => ({
  width: '100%', // Default width
  height: '100%', // Default height
  maxWidth: '900px', // Default max width
  mx: 'auto', // Center the box
  [theme.breakpoints.down('sm')]: {
    maxWidth: '90%' // Slightly less than full width for sm devices
  },
  [theme.breakpoints.down('md')]: {
    maxWidth: '75%' // Use more space on md devices, but not full width
  },
  [theme.breakpoints.up('lg')]: {
    maxWidth: '900px' // Limit maxWidth for lg and xl devices
  }

  // Add more responsive styles if needed
}))

const OscarChatToggler = props => {
  // ** Props
  const { settings, saveSettings } = props
  const [state, setState] = useState(false)
  const theme = useTheme()

  // ** Hooks
  const router = useRouter()

  const handleModeChange = mode => {
    saveSettings({ ...settings, mode: mode })
  }

  const handleModeToggle = open => event => {
    console.log('oscar chat toggler')

    // router.push('/oscar')

    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return
    }

    setState(open)
  }

  return (
    <Fragment>
      <IconButton color='inherit' aria-haspopup='true' onClick={handleModeToggle(true)}>
        <Icon icon={settings.mode === 'dark' ? 'mdi:robot' : 'mdi:robot'} />
      </IconButton>
      <Drawer
        anchor='right'
        open={state}
        onClose={handleModeToggle(false)}
        sx={{
          '& .MuiDrawer-paper': {
            backgroundColor:
              theme.palette.mode === 'dark'
                ? theme.palette.customColors.brandBlack
                : theme.palette.customColors.brandWhite
          }
        }}
      >
        <ResponsiveBox>
          <ChatBot />
        </ResponsiveBox>
      </Drawer>
    </Fragment>
  )
}

export default OscarChatToggler
