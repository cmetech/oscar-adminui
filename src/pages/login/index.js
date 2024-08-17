// ** React Imports
import { useState } from 'react'

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

import { useRouter } from 'next/router'
import { getProviders, signIn } from 'next-auth/react'
import useBgColor from 'src/@core/hooks/useBgColor'
import { useSettings } from 'src/@core/hooks/useSettings'

// ** Configs
import themeConfig from 'src/configs/themeConfig'

// ** Layout Import
import BlankLayout from 'src/@core/layouts/BlankLayout'

// ** Demo Imports
import FooterIllustrationsV2 from 'src/views/pages/auth/FooterIllustrationsV2'

// ** Styled Components
const LoginIllustrationWrapper = styled(Box)(({ theme }) => ({
  padding: theme.spacing(20),
  paddingRight: '0 !important',
  [theme.breakpoints.down('lg')]: {
    padding: theme.spacing(10)
  }
}))

const LoginIllustration = styled('img')(({ theme }) => ({
  maxWidth: '48rem',
  [theme.breakpoints.down('lg')]: {
    maxWidth: '35rem'
  }
}))

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

const CheckboxStyled = styled(Checkbox)(({ theme }) => ({
  color: theme.palette.customColors.accent,
  '&.Mui-checked': {
    color: theme.palette.customColors.accent
  }
}))

const TypographyStyled = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  marginBottom: theme.spacing(1.5),
  [theme.breakpoints.down('md')]: { mt: theme.spacing(8) }
}))

const LinkStyled = styled(Link)(({ theme }) => ({
  fontSize: '0.875rem',
  textDecoration: 'none',
  color: theme.palette.customColors.brandYellow
}))

const FormControlLabel = styled(MuiFormControlLabel)(({ theme }) => ({
  '& .MuiFormControlLabel-label': {
    fontSize: '0.875rem',
    color: theme.palette.text.secondary
  }
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

const OutlinedInputStyled = styled(OutlinedInput)(({ theme }) => ({
  // Style the border color
  // '& .MuiOutlinedInput-notchedOutline': {
  //   borderColor: 'inherit' // Replace with your default border color
  // },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: 'inherit' // Replace with your hover state border color
  },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: theme.palette.customColors.accent // Border color when focused
  }

  // You can add more styles here for other parts of the input
}))

const InputLabelStyled = styled(InputLabel)(({ theme }) => ({
  '&.Mui-focused': {
    color: theme.palette.customColors.accent
  }
}))

const schema = yup.object().shape({
  email: yup.string().email('Must be a valid email').required('Email is required'),
  password: yup.string().min(5, 'Password must be at least 5 characters').required('Password is required')
})

const defaultValues = {
  password: '$spl2019@$$',
  email: 'admin@oscar.com'
}

const LoginPage = ({ csrfToken, providers }) => {
  const [rememberMe, setRememberMe] = useState(true)
  const [showPassword, setShowPassword] = useState(false)

  // ** Hooks
  // const auth = useAuth()
  const router = useRouter()
  const theme = useTheme()
  const bgColors = useBgColor()
  const { settings } = useSettings()
  const hidden = useMediaQuery(theme.breakpoints.down('md'))

  // ** Vars
  const { skin } = settings

  const {
    control,
    setError,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues,
    mode: 'onBlur',
    resolver: yupResolver(schema)
  })

  // console.log('CSRF: ' + csrfToken)
  // console.log('Providers: ' + JSON.stringify(providers))

  const onSubmit = async (data) => {
    const { email, password } = data

    try {
      const res = await signIn('oscar', { email, password, redirect: false })
      console.log('Sign in response:', res)

      if (res?.ok) {
        const returnUrl = router.query.returnUrl
        const redirectUrl = returnUrl && returnUrl !== '/' ? returnUrl : '/'
        console.log('Login successful, redirecting to:', redirectUrl)
        router.replace(redirectUrl)
      } else {
        console.error('Login failed:', res?.error)
        setError('email', {
          type: 'manual',
          message: 'Email or Password is invalid'
        })
      }
    } catch (error) {
      console.error('An error occurred during sign in:', error)
      setError('email', {
        type: 'manual',
        message: 'An unexpected error occurred'
      })
    }
  }

  const imageSource = skin === 'bordered' ? 'auth-v2-login-illustration-bordered' : 'auth-v2-login-illustration'

  const handleKeycloakLogin = () => {
    signIn('keycloak', { callbackUrl: '/' })
  }

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
                  bgcolor={theme.palette.mode === 'dark' ? 'customColors.dark' : ''}
                  component='img'
                  sx={{ display: 'flex', alignItems: 'center', padding: '0.5rem' }}
                  src={theme.palette.mode == 'dark' ? '/images/logo.png' : '/images/ERI_horizontal_black_login_RGB.png'}
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
              <Button
                fullWidth
                size='large'
                variant='outlined'
                color='warning'
                onClick={handleKeycloakLogin}
                sx={{ mb: 2 }}
                startIcon={<Icon icon='mdi:shield' />}
              >
                Login with Keycloak
              </Button>
              <Divider sx={{ my: theme => `${theme.spacing(4)} !important` }}>or</Divider>
              <Box sx={{ mb: 6 }}>
                <Typography variant='h6'>Please sign-in using local account</Typography>
              </Box>
              <form noValidate autoComplete='off' onSubmit={handleSubmit(onSubmit)}>
                <FormControl fullWidth sx={{ mb: 4 }}>
                  <Controller
                    name='email'
                    control={control}
                    rules={{ required: true }}
                    render={({ field: { value, onChange, onBlur } }) => (
                      <TextfieldStyled
                        autoFocus
                        label='Email'
                        value={value}
                        onBlur={onBlur}
                        onChange={onChange}
                        error={Boolean(errors.email)}
                        placeholder='admin@oscar.com'
                      />
                    )}
                  />
                  {errors.email && <FormHelperText sx={{ color: 'error.main' }}>{errors.email.message}</FormHelperText>}
                </FormControl>
                <FormControl fullWidth>
                  <InputLabelStyled htmlFor='auth-login-v2-password' error={Boolean(errors.password)}>
                    Password
                  </InputLabelStyled>
                  <Controller
                    name='password'
                    control={control}
                    rules={{ required: true }}
                    render={({ field: { value, onChange, onBlur } }) => (
                      <OutlinedInputStyled
                        value={value}
                        onBlur={onBlur}
                        label='Password'
                        onChange={onChange}
                        id='auth-login-v2-password'
                        error={Boolean(errors.password)}
                        type={showPassword ? 'text' : 'password'}
                        endAdornment={
                          <InputAdornment position='end'>
                            <IconButton
                              edge='end'
                              onMouseDown={e => e.preventDefault()}
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              <Icon icon={showPassword ? 'mdi:eye-outline' : 'mdi:eye-off-outline'} fontSize={20} />
                            </IconButton>
                          </InputAdornment>
                        }
                      />
                    )}
                  />
                  {errors.password && (
                    <FormHelperText sx={{ color: 'error.main' }} id=''>
                      {errors.password.message}
                    </FormHelperText>
                  )}
                </FormControl>
                <Box
                  sx={{
                    mt: 2,
                    mb: 4,
                    display: 'flex',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    justifyContent: 'flex-end'
                  }}
                >
                  <LinkStyled href='/forgot-password'>Forgot Password?</LinkStyled>
                </Box>
                <Button fullWidth size='large' type='submit' variant='contained' sx={{ mb: 2 }}>
                  Login
                </Button>
              </form>
            </BoxWrapper>
          </Box>
        </RightWrapper>
      </Paper>
    </Box>
  )
}
LoginPage.getLayout = page => <BlankLayout>{page}</BlankLayout>
LoginPage.guestGuard = true

export default LoginPage
