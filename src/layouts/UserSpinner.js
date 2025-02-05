// ** MUI Imports
import { useTheme } from '@mui/material/styles'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

import { useSettings } from 'src/@core/hooks/useSettings'
import oscarConfig from 'src/configs/oscarConfig'

const UserFallbackSpinner = ({ sx }) => {
  // ** Hook
  const { settings } = useSettings()
  const { navCollapsed, mode } = settings
  const theme = useTheme()

  let textColor = 'customColors.brandBlack'
  if (mode === 'dark') {
    textColor = 'customColors.brandWhite'
  }

  const companySlug = oscarConfig.COMPANY_NAME.toLowerCase()

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column',
        justifyContent: 'center',
        ...sx
      }}
    >
      <Stack>
        <img src='/images/oscar.png' width='200' height='200' alt='spinner' />
        {navCollapsed ? (
          <Box
            bgcolor={theme.palette.mode === 'dark' ? 'customColors.dark' : '#F4F5FA'}
            component='img'
            sx={{ display: 'flex', alignItems: 'center', marginLeft: 3, marginTop: 2 }}
            src={
              theme.palette.mode == 'dark'
                ? `/images/${companySlug}-logo-dark-48.png`
                : `/images/${companySlug}-logo-light-48.png`
            }
            alt='logo'
            width='48px'
            height='48px'
          />
        ) : (
          <Box
            bgcolor={theme.palette.mode === 'dark' ? 'customColors.dark' : '#F4F5FA'}
            component='img'
            sx={{ display: 'flex', alignItems: 'center', paddingLeft: 3, paddingTop: 1, paddingBottom: 1 }}
            src={
              theme.palette.mode == 'dark'
                ? `/images/${companySlug}-logo-dark.png`
                : `/images/${companySlug}-logo-light.png`
            }
            alt='logo'
            width='170px'
            height='40px'
          />
        )}
        {/* <Typography noWrap variant='caption' color={textColor}>
          {oscarConfig.BRANDING_TAGLINE}
        </Typography> */}
      </Stack>
      <CircularProgress
        disableShrink
        sx={{
          mt: 10,
          color: `${
            theme.palette.mode == 'dark'
              ? theme.palette.customColors.brandYellow4
              : theme.palette.customColors.brandBlack
          }`
        }}
      />
    </Box>
  )
}

export default UserFallbackSpinner
