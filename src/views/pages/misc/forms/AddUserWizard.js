// ** React Imports
import { Fragment, use, useState } from 'react'
import axios from 'axios'
import { useSession } from 'next-auth/react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Step from '@mui/material/Step'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import Stepper from '@mui/material/Stepper'
import MenuItem from '@mui/material/MenuItem'
import StepLabel from '@mui/material/StepLabel'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import InputLabel from '@mui/material/InputLabel'
import CardContent from '@mui/material/CardContent'
import FormControl from '@mui/material/FormControl'
import OutlinedInput from '@mui/material/OutlinedInput'
import InputAdornment from '@mui/material/InputAdornment'
import Select from '@mui/material/Select'
import Checkbox from '@mui/material/Checkbox'
import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormGroup from '@mui/material/FormGroup'
import FormLabel from '@mui/material/FormLabel'
import Autocomplete from '@mui/material/Autocomplete'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Custom Components Imports
import StepperCustomDot from './StepperCustomDot'
import { useTheme, styled } from '@mui/material/styles'

// ** Third Party Imports
import toast from 'react-hot-toast'

// ** Styled Component
import StepperWrapper from 'src/@core/styles/mui/stepper'

// ** Import yup for form validation
import * as yup from 'yup'

// Define steps for the wizard
const steps = [
  {
    title: 'User Information',
    subtitle: 'Enter User Details',
    description: 'Enter the First Name, Last Name, Username, Email, and Status for the new user.'
  },
  {
    title: 'Review',
    subtitle: 'Review and Submit',
    description: 'Review the new user details and submit.'
  }
]

// Custom styled components
const CheckboxStyled = styled(Checkbox)(({ theme }) => ({
  color: theme.palette.customColors.accent,
  '&.Mui-checked': {
    color: theme.palette.customColors.accent
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

// Validation schema using yup
const validationSchema = yup.object({
  firstName: yup.string().trim().required('First name is required').min(3, 'First name must be at least 3 characters'),
  lastName: yup.string().trim().required('Last name is required').min(3, 'Last name must be at least 3 characters'),
  username: yup.string().trim().required('Username is required').min(3, 'Username must be at least 3 characters'),
  email: yup.string().email('Enter a valid email').required('Email is required').trim(),
  password: yup.string().required('Password is required').min(6, 'Password must be at least 6 characters')
})

const AddUserWizard = props => {
  const { setRows } = props

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isActive, setIsActive] = useState(false)
  const [isSuperUser, setIsSuperUser] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [activeStep, setActiveStep] = useState(0)
  const [formErrors, setFormErrors] = useState({})
      
  const theme = useTheme()
  const session = useSession()

  const validateForm = async () => {
    try {
      await validationSchema.validate({ firstName, lastName, username, email, password }, { abortEarly: false })
      setFormErrors({})
      return true
    } catch (yupError) {
      const transformedErrors = yupError.inner.reduce(
        (acc, currentError) => ({
          ...acc,
          [currentError.path]: currentError.message
        }),
        {}
      )
      setFormErrors(transformedErrors)
      return false
    }
  }

  const handleBack = () => {
      setActiveStep(prevActiveStep => prevActiveStep - 1)
  }

  const handleNext = async () => {
    const isValid = await validateForm()
    if (!isValid) return

    setActiveStep(prevActiveStep => prevActiveStep + 1)

    if (activeStep === steps.length - 1) {
      try {
        const apiToken = session?.data?.user?.apiToken
        const headers = {
          Accept: 'application/json',
          Authorization: `Bearer ${apiToken}`
        }
        const payload = {
          username: username,
          first_name: firstName,
          last_name: lastName,
          email: email,
          password: password,
          is_active: isActive,
          is_superuser: isSuperUser,
          is_verified: isVerified
        }

        // POST request to create a new user
        const endpoint = `/api/users`
        const response = await axios.post(endpoint, payload, { headers })

        if (response.data) {
          const newUser = response.data
          setRows(prevRows => [...prevRows, newUser]) // Use setRows from props
            toast.success('User added successfully')
        }
      } catch (error) {
        console.error('Error adding new user', error)
        toast.error('Error adding new user')
      }
    }
  }

  const handleReset = () => {
    setFirstName('')
    setLastName('')
    setUsername('')
    setEmail('')
    setPassword('')
    setIsActive(false)
    setIsSuperUser(false)
    setIsVerified(false)
    setActiveStep(0) 
  }

  const handleInputChange = setter => event => {
    setter(event.target.value)
  }

  const handleCheckboxChange = setter => event => {
    setter(event.target.checked)
  }

  const getStepContent = step => {
    switch (step) {
      case 0:
        return (
          <Fragment>
            <Grid container spacing={6}>
              <Grid item sm={6} xs={12}>
                <FormControl fullWidth>
                  <TextfieldStyled
                    fullWidth
                    value={firstName}
                    onChange={handleInputChange(setFirstName)}
                    label='First Name'
                    error={Boolean(formErrors.firstName)}
                    helperText={formErrors.firstName}
                  />
                </FormControl>
              </Grid>
              <Grid item sm={6} xs={12}>
                <FormControl fullWidth>
                  <TextfieldStyled
                    fullWidth
                    value={lastName}
                    onChange={handleInputChange(setLastName)}
                    label='Last Name'
                    error={Boolean(formErrors.lastName)}
                    helperText={formErrors.lastName}
                  />
                </FormControl>
              </Grid>
              <Grid item sm={6} xs={12}>
                <FormControl fullWidth>
                  <TextfieldStyled
                    fullWidth
                    value={username}
                    onChange={handleInputChange(setUsername)}
                    label='Username'
                    error={Boolean(formErrors.username)}
                    helperText={formErrors.username}
                  />
                </FormControl>
              </Grid>
              <Grid item sm={6} xs={12}>
                <FormControl fullWidth>
                  <TextfieldStyled
                    fullWidth
                    value={email}
                    onChange={handleInputChange(setEmail)}
                    label='Email'
                    error={Boolean(formErrors.email)}
                    helperText={formErrors.email}
                  />
                </FormControl>
              </Grid>
              <Grid item sm={6} xs={12}>
                <FormControl fullWidth>
                  <TextfieldStyled
                    fullWidth
                    value={password}
                    onChange={handleInputChange(setPassword)}
                    type='password'
                    label='Password'
                    error={Boolean(formErrors.password)}
                    helperText={formErrors.password}
                  />
                </FormControl>
              </Grid>
              <Grid item sm={4} xs={12}>
                <FormControl fullWidth>
                  <FormControlLabel
                    control={<CheckboxStyled checked={isActive} onChange={handleCheckboxChange(setIsActive)} />}
                    label='Status (Active)'
                  />
                </FormControl>
              </Grid>
              <Grid item sm={4} xs={12}>
                <FormControl fullWidth>
                  <FormControlLabel
                    control={<CheckboxStyled checked={isSuperUser} onChange={handleCheckboxChange(setIsSuperUser)} />}
                    label='Is Admin'
                  />
                </FormControl>
              </Grid>
              <Grid item sm={4} xs={12}>
                <FormControl fullWidth>
                  <FormControlLabel
                    control={<CheckboxStyled checked={isVerified} onChange={handleCheckboxChange(setIsVerified)} />}
                    label='Is Verified'
                  />
                </FormControl>
              </Grid>
            </Grid>
          </Fragment>
        )
      case 1:
        return (
          <Fragment>
            <Grid container spacing={1}>
              <Grid item xs={4}>
                <Typography variant='h6' sx={{ mt: 2, mb: 1, textDecoration: 'underline' }}>
                  General Information
                </Typography>
                <Grid item xs={12}>
                  <Typography>
                    Name:{' '}
                    <strong>
                      {firstName} {lastName}
                    </strong>
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography>
                    Username: <strong>{username}</strong>
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography>
                    Email: <strong>{email}</strong>
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography>
                    Status: <strong>{isActive.toString()}</strong>
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography>
                    Is Admin: <strong>{isSuperUser.toString()}</strong>
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography>
                    Is Verified: <strong>{isVerified.toString()}</strong>
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
          </Fragment>
        )
      default:
        return 'Unknown step'
    }
  }

  const renderContent = () => {
    if (activeStep === steps.length) {

      return (
        <form  onload ={e => e.preventDefault()}>
          <Fragment>
            <Typography>New user details have been submitted.</Typography>
            <Grid container spacing={1}>
              <Grid item xs={4}>
                <Typography
                  variant='h6'
                  sx={{
                    mt: 2,
                    mb: 1,
                    textDecoration: 'underline',
                    color:
                      theme.palette.mode === 'light'
                        ? theme.palette.customColors.brandBlack
                        : theme.palette.customColors.brandYellow
                  }}
                >
                  General Information
                </Typography>
                <Grid item xs={12}>
                  <Typography>
                    Name:{' '}
                    <strong>
                      {firstName} {lastName}
                    </strong>
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography>
                    Username: <strong>{username}</strong>
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography>
                    Status: <strong>{isActive.toString()}</strong>
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography>
                    Is Admin: <strong>{isSuperUser.toString()}</strong>
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography>
                    Is Verified: <strong>{isVerified.toString()}</strong>
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
              <Button size='large' variant='contained' onClick={handleReset}>
                Reset
              </Button>
            </Box>
            </Fragment>
          </form>
      )
    } else {
      
      return(
        <form onSubmit={e => e.preventDefault()}>
            <Grid container spacing={5}>
              <Grid item xs={12}>
                <Typography variant='body2' sx={{ fontWeight: 600, color: 'text.primary' }}>
                  {steps[activeStep].title}
                </Typography>
                <Typography variant='caption' component='p' paddingBottom={5}>
                  {steps[activeStep].description}
                </Typography>
              </Grid>
              {getStepContent(activeStep)}
              <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Button
                  size='large'
                  variant='outlined'
                  color='secondary'
                  disabled={activeStep === 0}
                  onClick={handleBack}
                >
                  Back
                </Button>
                <Button size='large' variant='contained' onClick={handleNext}>
                  {activeStep === steps.length - 1 ? 'Submit' : 'Next'}
                </Button>
              </Grid>
            </Grid>
          </form> 
          )
    }

  }

  return (
    <Fragment>
      <StepperWrapper>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((step, index) => {
            return (
              <Step key={index}>
                <StepLabel StepIconComponent={StepperCustomDot}>
                  <div className='step-label'>
                    <div>
                      <Typography className='step-title'>{step.title}</Typography>
                      <Typography className='step-subtitle'>{step.subtitle}</Typography>
                    </div>
                  </div>
                </StepLabel>
              </Step>
            )
          })}
        </Stepper>
      </StepperWrapper>
      <Card sx={{ mt: 4, minHeight: 500 }}>
        <CardContent>{renderContent()}</CardContent>
      </Card>
    </Fragment>
  )
}

export default AddUserWizard
