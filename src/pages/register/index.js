// ** React Imports
import { useState, Fragment } from 'react'
import https from 'https'

// ** Next Imports
import Link from 'next/link'
import { useRouter } from 'next/router'

// ** MUI Components
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Checkbox from '@mui/material/Checkbox'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import InputLabel from '@mui/material/InputLabel'
import IconButton from '@mui/material/IconButton'
import CardContent from '@mui/material/CardContent'
import FormControl from '@mui/material/FormControl'
import FormHelperText from '@mui/material/FormHelperText'
import OutlinedInput from '@mui/material/OutlinedInput'
import { styled, useTheme } from '@mui/material/styles'
import MuiCard from '@mui/material/Card'
import InputAdornment from '@mui/material/InputAdornment'
import MuiFormControlLabel from '@mui/material/FormControlLabel'
import Paper from '@mui/material/Paper'
import useMediaQuery from '@mui/material/useMediaQuery'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Configs
import themeConfig from 'src/configs/themeConfig'

// ** Layout Import
import BlankLayout from 'src/@core/layouts/BlankLayout'

// ** Demo Imports
import FooterIllustrations from 'src/views/pages/auth/FooterIllustrations'

// ** Third Party Imports
import axios from 'axios'
import * as yup from 'yup'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'

import useBgColor from 'src/@core/hooks/useBgColor'
import { useSettings } from 'src/@core/hooks/useSettings'

// ** Styled Components
const Card = styled(MuiCard)(({ theme }) => ({
  [theme.breakpoints.up('sm')]: { width: '28rem' }
}))

const LinkStyled = styled(Link)(({ theme }) => ({
  fontSize: '0.875rem',
  textDecoration: 'none',
  color: theme.palette.customColors.brandBlue
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

const FormControlLabel = styled(MuiFormControlLabel)(({ theme }) => ({
  marginTop: theme.spacing(1.5),
  marginBottom: theme.spacing(4),
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

const InputLabelStyled = styled(InputLabel)(({ theme }) => ({
  '&.Mui-focused': {
    color: theme.palette.customColors.accent
  }
}))

const schema = yup.object().shape({
  firstname: yup.string().max(20).required(),
  lastname: yup.string().max(20).required(),
  username: yup.string().max(20).required(),
  phone_number: yup.string().max(20),
  organization: yup.string().max(50),
  email: yup.string().email().required(),
  password: yup.string().min(5).required()
})

const defaultValues = {
  username: '',
  firstname: '',
  lastname: '',
  phone_number: '',
  organization: '',
  address: '',
  city: '',
  state: '',
  zip: '',
  country: '',
  language: 'en',
  timezone: '',
  email: ''
}

const RegisterPage = () => {
  // ** States
  const [showPassword, setShowPassword] = useState(false)

  // ** Hook
  const theme = useTheme()
  const router = useRouter()
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

  const onSubmit = async data => {
    try {
      // Construct the data payload
      const payload = {
        username: data.username,
        first_name: data.firstname,
        last_name: data.lastname,
        phone_number: data.phone_number ? data.phone_number : '',
        organization: data.organization ? data.organization : '',
        address: data.address ? data.address : '',
        city: data.city ? data.city : '',
        state: data.state ? data.state : '',
        postal_code: data.zip ? data.zip : '',
        language: data.language ? data.language : 'en',
        timezone: data.timezone ? data.timezone : 'UTC',
        email: data.email,
        password: data.password,
        is_active: 1,
        is_superuser: 0,
        is_verified: 0
      }

      // Register User
      const response = await axios.post('/api/auth/register', payload)

      console.log('status', response.status)
      if (response.status === 201) {
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
          <Card sx={{ zIndex: 1, border: '2px solid white' }}>
            <CardContent sx={{ p: theme => `${theme.spacing(12, 9, 7)} !important` }}>
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
                  <Box
                    bgcolor={theme.palette.mode === 'dark' ? 'customColors.dark' : 'F4F5FA'}
                    component='img'
                    sx={{ display: 'flex', alignItems: 'center', padding: '0.5rem' }}
                    src={
                      theme.palette.mode == 'dark' ? '/images/logo.png' : '/images/ERI_horizontal_black_login_RGB.png'
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
                    Adventure starts here 🚀
                  </Typography>
                  <Typography variant='body2'>Please provide account details</Typography>
                </Box>
                <form noValidate autoComplete='off' onSubmit={handleSubmit(onSubmit)}>
                  <FormControl fullWidth sx={{ mb: 4 }}>
                    <Controller
                      name='username'
                      control={control}
                      rules={{ required: true }}
                      render={({ field: { value, onChange, onBlur } }) => (
                        <TextfieldStyled
                          autoFocus
                          label='Username'
                          value={value}
                          onBlur={onBlur}
                          onChange={onChange}
                          error={Boolean(errors.username)}
                          placeholder='Enter Username'
                        />
                      )}
                    />
                    {errors.username && (
                      <FormHelperText sx={{ color: 'error.main' }}>{errors.username.message}</FormHelperText>
                    )}
                  </FormControl>
                  <FormControl fullWidth sx={{ mb: 4 }}>
                    <Controller
                      name='firstname'
                      control={control}
                      rules={{ required: true }}
                      render={({ field: { value, onChange, onBlur } }) => (
                        <TextfieldStyled
                          autoFocus
                          label='First Name'
                          value={value}
                          onBlur={onBlur}
                          onChange={onChange}
                          error={Boolean(errors.firstname)}
                          placeholder='Enter First Name'
                        />
                      )}
                    />
                    {errors.firstname && (
                      <FormHelperText sx={{ color: 'error.main' }}>{errors.firstname.message}</FormHelperText>
                    )}
                  </FormControl>
                  <FormControl fullWidth sx={{ mb: 4 }}>
                    <Controller
                      name='lastname'
                      control={control}
                      rules={{ required: true }}
                      render={({ field: { value, onChange, onBlur } }) => (
                        <TextfieldStyled
                          autoFocus
                          label='Last Name'
                          value={value}
                          onBlur={onBlur}
                          onChange={onChange}
                          error={Boolean(errors.lastname)}
                          placeholder='Enter Last Name'
                        />
                      )}
                    />
                    {errors.lastname && (
                      <FormHelperText sx={{ color: 'error.main' }}>{errors.lastname.message}</FormHelperText>
                    )}
                  </FormControl>
                  <FormControl fullWidth sx={{ mb: 4 }}>
                    <Controller
                      name='phone_number'
                      control={control}
                      rules={{ required: true }}
                      render={({ field: { value, onChange, onBlur } }) => (
                        <TextfieldStyled
                          autoFocus
                          label='Phone Number'
                          value={value}
                          onBlur={onBlur}
                          onChange={onChange}
                          error={Boolean(errors.phone_number)}
                          placeholder='Enter Phone Number'
                        />
                      )}
                    />
                    {errors.phone_number && (
                      <FormHelperText sx={{ color: 'error.main' }}>{errors.phone_number.message}</FormHelperText>
                    )}
                  </FormControl>
                  <FormControl fullWidth sx={{ mb: 4 }}>
                    <Controller
                      name='organization'
                      control={control}
                      rules={{ required: true }}
                      render={({ field: { value, onChange, onBlur } }) => (
                        <TextfieldStyled
                          autoFocus
                          label='Organization'
                          value={value}
                          onBlur={onBlur}
                          onChange={onChange}
                          error={Boolean(errors.phone_number)}
                          placeholder='Enter Organization'
                        />
                      )}
                    />
                    {errors.organization && (
                      <FormHelperText sx={{ color: 'error.main' }}>{errors.organization.message}</FormHelperText>
                    )}
                  </FormControl>
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
                          placeholder='name@emailaddress.com'
                        />
                      )}
                    />
                    {errors.email && (
                      <FormHelperText sx={{ color: 'error.main' }}>{errors.email.message}</FormHelperText>
                    )}
                  </FormControl>
                  <FormControl fullWidth>
                    <InputLabelStyled htmlFor='auth-register-password' error={Boolean(errors.password)}>
                      Password
                    </InputLabelStyled>
                    <Controller
                      name='password'
                      control={control}
                      rules={{ required: true }}
                      render={({ field: { value, onChange, onBlur } }) => (
                        <OutlinedInput
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
                  <Button fullWidth size='large' type='submit' variant='contained' sx={{ mt: 5, mb: 7 }}>
                    Sign up
                  </Button>
                  <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
                    <Typography variant='body2' sx={{ mr: 2 }}>
                      Already have an account?
                    </Typography>
                    <Typography variant='body2'>
                      <LinkStyled href='/login'>Sign in instead</LinkStyled>
                    </Typography>
                  </Box>
                </form>
              </BoxWrapper>
            </CardContent>
          </Card>
        </RightWrapper>
      </Paper>
    </Box>
  )
}
RegisterPage.getLayout = page => <BlankLayout>{page}</BlankLayout>
RegisterPage.guestGuard = true

export default RegisterPage
