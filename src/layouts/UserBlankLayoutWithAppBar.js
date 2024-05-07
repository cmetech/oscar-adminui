// ** MUI Imports
import { styled, useTheme } from '@mui/material/styles'
import Box from '@mui/material/Box'
import { useSettings } from 'src/@core/hooks/useSettings'

// ** AppBar Imports
// import AppBar from 'src/@core/layouts/components/blank-layout-with-appBar'
import AppBarContent from 'src/layouts/components/vertical/AppBarContentNoSearch'

// Styled component for Blank Layout with AppBar component
const BlankLayoutWithAppBarWrapper = styled(Box)(({ theme }) => ({
  height: '100vh',

  // For V1 Blank layout pages
  '& .content-center': {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(5),
    minHeight: `calc(100vh - ${theme.spacing(theme.mixins.toolbar.minHeight / 4)})`
  },

  // For V2 Blank layout pages
  '& .content-right': {
    display: 'flex',
    overflowX: 'hidden',
    position: 'relative',
    minHeight: `calc(100vh - ${theme.spacing(theme.mixins.toolbar.minHeight / 4)})`
  }
}))

const BlankLayoutWithAppBar = props => {
  // ** Props
  const { children } = props
  const { settings, saveSettings } = useSettings()
  const theme = useTheme()

  return (
    <BlankLayoutWithAppBarWrapper>
      <Box
        sx={{
          padding: theme => theme.spacing(4), // Adjusts padding around the AppBar
          width: '100%',
          backgroundImage: `${
            theme.palette.mode === 'dark'
              ? 'url(/images/black-spotlight-bg.jpg)'
              : 'url(/images/white-spotlight-bg-1.jpg)'
          }`,
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed'
        }}
      >
        <AppBarContent settings={settings} saveSettings={saveSettings} />
        <Box
          className='content-center'
          sx={{
            overflowX: 'hidden',
            position: 'relative',
            minHeight: theme => `calc(100vh - ${theme.spacing(theme.mixins.toolbar.minHeight / 4)})`
          }}
        >
          {children}
        </Box>
      </Box>
    </BlankLayoutWithAppBarWrapper>
  )
}

export default BlankLayoutWithAppBar
