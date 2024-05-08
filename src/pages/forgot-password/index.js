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

const TextfieldStyled = styled(TextField)(({ theme }) => ({
  '& label.Mui-focused': {
    color: theme.palette.customColors.accent
  },
  '& .MuiOutlinedInput-root': {
    '&.Mui-focused fieldset': {
      borderColor: theme.palette.customColors.accent
    }
  }
}))

const ForgotPassword = () => {
  const theme = useTheme()
  const router = useRouter()
  const { settings } = useSettings()
  const hidden = useMediaQuery(theme.breakpoints.down('md'))

  // ** Vars
  const { skin } = settings

  const handleSubmit = async e => {
    e.preventDefault()
    console.log(e.target[0].value)

    try {
      // Construct the data payload
      const payload = {
        email: e.target[0].value
      }

      // Make the POST request
      const response = await axios.post('/api/auth/forgot-password', payload)

      console.log('status', response.status)
      if (response.status === 202) {
        // Redirect to the login page
        router.replace('/login')
      } else {
        // Handle and log errors
        console.log('Error:', response.data)
      }
    } catch (error) {
      // Handle and log errors
      console.log('Error:', error.response ? error.response.data : error.message)
    }
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
                  src={theme.palette.mode == 'dark' ? '/images/logo.png' : '/images/logo.png'}
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
                <TypographyStyled variant='h5'>Forgot Password? 🔒</TypographyStyled>
                <Typography variant='body2'>
                  Enter your email and we&prime;ll send you instructions to reset your password
                </Typography>
              </Box>
              <form noValidate autoComplete='off' onSubmit={handleSubmit}>
                <TextfieldStyled autoFocus type='email' label='Email' sx={{ display: 'flex', mb: 4 }} />
                <Button fullWidth size='large' type='submit' variant='contained' sx={{ mb: 5.25 }}>
                  Send reset link
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
ForgotPassword.getLayout = page => <BlankLayout>{page}</BlankLayout>
ForgotPassword.guestGuard = true

export default ForgotPassword
