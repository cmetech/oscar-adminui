// ** React Imports
import { useState } from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'

// ** Next Imports
import Link from 'next/link'

// ** MUI Components
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Checkbox from '@mui/material/Checkbox'
import TextField from '@mui/material/TextField'
import InputLabel from '@mui/material/InputLabel'
import IconButton from '@mui/material/IconButton'
import Box from '@mui/material/Box'
import FormControl from '@mui/material/FormControl'
import useMediaQuery from '@mui/material/useMediaQuery'
import OutlinedInput from '@mui/material/OutlinedInput'
import { styled, useTheme } from '@mui/material/styles'
import FormHelperText from '@mui/material/FormHelperText'
import InputAdornment from '@mui/material/InputAdornment'
import Typography from '@mui/material/Typography'
import MuiFormControlLabel from '@mui/material/FormControlLabel'
import Paper from '@mui/material/Paper'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Third Party Imports
import * as yup from 'yup'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'

// ** Hooks
// import { useAuth } from 'src/hooks/useAuth'

import { useSettings } from 'src/@core/hooks/useSettings'

// ** Configs
import themeConfig from 'src/configs/themeConfig'

// ** Layout Import
import BlankLayout from 'src/@core/layouts/BlankLayout'
import oscarConfig from 'src/configs/oscarConfig'

const RightWrapper = styled(Box)(({ theme }) => ({
  width: '100%',
  [theme.breakpoints.up('md')]: {
    maxWidth: 450
  }
}))

const BoxWrapper = styled(Box)(({ theme }) => ({
  [theme.breakpoints.down('xl')]: {
    width: '100%'
  },
  [theme.breakpoints.down('md')]: {
    maxWidth: 400
  }
}))

const TypographyStyled = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  marginBottom: theme.spacing(1.5),
  [theme.breakpoints.down('md')]: { mt: theme.spacing(8) }
}))

const LinkStyled = styled(Link)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  textDecoration: 'none',
  justifyContent: 'center',
  color: theme.palette.customColors.brandYellow
}))

const ResetPassword = () => {
  // ** States
  const [values, setValues] = useState({
    newPassword: '',
    showNewPassword: false,
    confirmNewPassword: '',
    showConfirmNewPassword: false
  })

  // ** Hook
  const theme = useTheme()
  const router = useRouter()
  const { settings } = useSettings()
  const hidden = useMediaQuery(theme.breakpoints.down('md'))
  const token = router.query.token
  const companySlug = oscarConfig.COMPANY_NAME.toLowerCase()
  // ** Vars
  const { skin } = settings

  const handleSubmit = async e => {
    e.preventDefault()

    try {
      // Construct the data payload
      const payload = {
        token: token,
        password: values.newPassword
      }

      // Make the POST request
      const response = await axios.post('/api/auth/reset-password', payload)

      console.log('status', response.status)
      if (response.status === 200) {
        // Redirect to the login page
        router.replace('/login')
      } else if (response.status === 400) {
        // Handle and log errors
        console.log('Error:', response.data)
      }
    } catch (error) {
      // Handle and log errors
      console.log('Error:', error.response ? error.response.data : error.message)
    }
  }

  // Handle New Password
  const handleNewPasswordChange = prop => event => {
    setValues({ ...values, [prop]: event.target.value })
  }

  const handleClickShowNewPassword = () => {
    setValues({ ...values, showNewPassword: !values.showNewPassword })
  }

  const handleMouseDownNewPassword = event => {
    event.preventDefault()
  }

  // Handle Confirm New Password
  const handleConfirmNewPasswordChange = prop => event => {
    setValues({ ...values, [prop]: event.target.value })
  }

  const handleClickShowConfirmNewPassword = () => {
    setValues({ ...values, showConfirmNewPassword: !values.showConfirmNewPassword })
  }

  const handleMouseDownConfirmNewPassword = event => {
    event.preventDefault()
  }

  const imageSource = skin === 'bordered' ? 'auth-v2-login-illustration-bordered' : 'auth-v2-login-illustration'

  return (
    <Box
      className='content-center'
      sx={{
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
      <Paper elevation={20}>
        <RightWrapper sx={skin === 'bordered' && !hidden ? { borderLeft: `1px solid ${theme.palette.divider}` } : {}}>
          <Box
            sx={{
              p: 12,
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'background.paper',
              border: '2px solid white'
            }}
          >
            <BoxWrapper>
              <Box
                sx={{
                  top: 30,
                  left: 40,
                  display: 'flex',
                  position: 'absolute',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white'
                }}
              >
                {/* <i className='icon icon-econ' /> */}
                <Box
                  bgcolor={theme.palette.mode === 'dark' ? 'customColors.dark' : '#F4F5FA'}
                  component='img'
                  sx={{ display: 'flex', alignItems: 'center', padding: '0.5rem' }}
                  src={
                    theme.palette.mode == 'dark'
                      ? `/images/${companySlug}-logo-dark.png`
                      : `/images/${companySlug}-logo-light.png`
                  }
                  alt='logo'
                />
                <Typography
                  variant='h6'
                  sx={{
                    ml: 3,
                    lineHeight: 1,
                    fontWeight: 600,
                    textTransform: 'none',
                    fontSize: '1.5rem !important',
                    color: `${theme.palette.mode === 'light' ? '#101217' : 'white'}`
                  }}
                >
                  {/* {themeConfig.templateName} */}
                </Typography>
              </Box>
              <Box sx={{ mb: 6 }}>
                <Typography variant='h5' sx={{ fontWeight: 600, mb: 1.5 }}>
                  Reset Password 🔒
                </Typography>
                <Typography variant='body2'>
                  Your new password must be different from previously used passwords
                </Typography>
              </Box>
              <form noValidate autoComplete='off' onSubmit={handleSubmit}>
                <FormControl sx={{ display: 'flex', mb: 4 }}>
                  <InputLabel htmlFor='auth-reset-password-new-password'>New Password</InputLabel>
                  <OutlinedInput
                    autoFocus
                    label='New Password'
                    value={values.newPassword}
                    id='auth-reset-password-new-password'
                    onChange={handleNewPasswordChange('newPassword')}
                    type={values.showNewPassword ? 'text' : 'password'}
                    endAdornment={
                      <InputAdornment position='end'>
                        <IconButton
                          edge='end'
                          onClick={handleClickShowNewPassword}
                          aria-label='toggle password visibility'
                          onMouseDown={handleMouseDownNewPassword}
                        >
                          <Icon icon={values.showNewPassword ? 'mdi:eye-outline' : 'mdi:eye-off-outline'} />
                        </IconButton>
                      </InputAdornment>
                    }
                  />
                </FormControl>
                <FormControl sx={{ display: 'flex', mb: 4 }}>
                  <InputLabel htmlFor='auth-reset-password-confirm-password'>Confirm Password</InputLabel>
                  <OutlinedInput
                    label='Confirm Password'
                    value={values.confirmNewPassword}
                    id='auth-reset-password-confirm-password'
                    type={values.showConfirmNewPassword ? 'text' : 'password'}
                    onChange={handleConfirmNewPasswordChange('confirmNewPassword')}
                    endAdornment={
                      <InputAdornment position='end'>
                        <IconButton
                          edge='end'
                          aria-label='toggle password visibility'
                          onClick={handleClickShowConfirmNewPassword}
                          onMouseDown={handleMouseDownConfirmNewPassword}
                        >
                          <Icon icon={values.showConfirmNewPassword ? 'mdi:eye-outline' : 'mdi:eye-off-outline'} />
                        </IconButton>
                      </InputAdornment>
                    }
                  />
                </FormControl>
                <Button fullWidth size='large' type='submit' variant='contained' sx={{ mb: 5.25 }}>
                  Set New Password
                </Button>
                <Typography variant='body2' sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <LinkStyled href='/login'>
                    <Icon icon='mdi:chevron-left' />
                    <span>Back to login</span>
                  </LinkStyled>
                </Typography>
              </form>
            </BoxWrapper>
          </Box>
        </RightWrapper>
      </Paper>
    </Box>
  )
}
ResetPassword.getLayout = page => <BlankLayout>{page}</BlankLayout>
ResetPassword.authGuard = false

export default ResetPassword
