// ** React Imports
import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import axios from 'axios'

// ** MUI Imports
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Select from '@mui/material/Select'
import Dialog from '@mui/material/Dialog'
import { styled } from '@mui/material/styles'
import Checkbox from '@mui/material/Checkbox'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import InputLabel from '@mui/material/InputLabel'
import CardHeader from '@mui/material/CardHeader'
import FormControl from '@mui/material/FormControl'
import CardContent from '@mui/material/CardContent'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import FormHelperText from '@mui/material/FormHelperText'
import InputAdornment from '@mui/material/InputAdornment'
import Button from '@mui/material/Button'
import FormControlLabel from '@mui/material/FormControlLabel'
import Autocomplete from '@mui/material/Autocomplete'
import OutlinedInput from '@mui/material/OutlinedInput'

// ** Third Party Imports
import { useForm, Controller } from 'react-hook-form'
import ChangePasswordCard from 'src/views/pages/account-settings/security/ChangePasswordCard'
import oscarConfig from 'src/configs/oscarConfig'
// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Third Party Imports
import toast from 'react-hot-toast'

// ** Library Imports
import { TimezoneEnum, StateEnum, CountryEnum, LanguageEnum } from 'src/lib/enums'
import { Stack } from 'rsuite'

const initialData = {
  first_name: '',
  last_name: '',
  username: '',
  phone_number: '',
  state: '',
  city: '',
  country: 'United States',
  address: '',
  postal_code: '',
  language: 'English',
  timezone: '',
  email: '',
  organization: '',
  is_active: true,
  is_superuser: true,
  is_verified: true
}

const ImgStyled = styled('img')(({ theme }) => ({
  width: 120,
  height: 120,
  borderRadius: 4,
  marginRight: theme.spacing(5)
}))

const ButtonStyled = styled(Button)(({ theme }) => ({
  [theme.breakpoints.down('sm')]: {
    width: '100%',
    textAlign: 'center'
  }
}))

const ResetButtonStyled = styled(Button)(({ theme }) => ({
  marginLeft: theme.spacing(4),
  [theme.breakpoints.down('sm')]: {
    width: '100%',
    marginLeft: 0,
    textAlign: 'center',
    marginTop: theme.spacing(4)
  }
}))

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

const SelectStyled = styled(Select)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    fieldset: {
      borderColor: 'inherit' // default border color
    },
    '&.Mui-focused fieldset': {
      borderColor: theme.palette.customColors.accent // border color when focused
    }
  }
}))

// Replace 'defaultBorderColor' with your default border color.

const InputLabelStyled = styled(InputLabel)(({ theme }) => ({
  '&.Mui-focused': {
    color: theme.palette.customColors.accent
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

const AutocompleteStyled = styled(Autocomplete)(({ theme }) => ({
  '& .MuiInputLabel-outlined.Mui-focused': {
    color: theme.palette.customColors.accent
  },
  '& .MuiOutlinedInput-root': {
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.palette.customColors.accent
    }
  }
}))

const timezoneOptions = Object.values(TimezoneEnum)
const stateOptions = Object.values(StateEnum)
const countryOptions = Object.values(CountryEnum)
const languageOptions = Object.values(LanguageEnum)

// FIXME: Language field is not updating

const TabAccount = () => {
  const session = useSession()
  const userFullName = session?.data?.user?.name || 'John Doe'
  const imageFileName = userFullName.toLowerCase().replace(/\s+/g, '') || '1'
  const apiToken = session?.data?.user?.apiToken

  // ** State
  const [open, setOpen] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [userInput, setUserInput] = useState('yes')
  const [formData, setFormData] = useState(initialData)
  const [imgSrc, setImgSrc] = useState(imageFileName ? `/images/avatars/${imageFileName}.png` : '/images/avatars/1.png')
  const [secondDialogOpen, setSecondDialogOpen] = useState(false)

  // ** Hooks
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({ defaultValues: initialData })
  const handleClose = () => setOpen(false)
  const handleSecondDialogClose = () => setSecondDialogOpen(false)
  const onSubmit = () => setOpen(true)

  const handleConfirmation = value => {
    handleClose()
    setUserInput(value)
    setSecondDialogOpen(true)
  }

  const handleInputImageChange = file => {
    const reader = new FileReader()
    const { files } = file.target
    if (files && files.length !== 0) {
      reader.onload = () => setImgSrc(reader.result)
      reader.readAsDataURL(files[0])
      if (reader.result !== null) {
        setInputValue(reader.result)
      }
    }
  }

  const handleInputImageReset = () => {
    setInputValue('')
    setImgSrc(`/images/avatars/${imageFileName}.png`)
  }

  const handleFormChange = (field, value) => {
    // For Autocomplete, the value argument directly contains the selected value
    // For traditional inputs, the value is nested inside event.target
    const newValue = value?.target ? value.target.value : value

    setFormData(prevState => ({
      ...prevState,
      [field]: newValue
    }))
  }

  const resetForm = () => {
    setFormData(initialData)
    reset(initialData)
  }

  // Function to fetch user profile and update form data
  const fetchUserProfile = useCallback(async () => {
    try {
      const response = await axios.get('/api/users/me', {
        headers: {
          'Content-Type': 'application/json',

          // Assuming your session object has the API token
          Authorization: `Bearer ${apiToken}`
        }
      })

      // Update form data with fetched user profile
      if (response.data) {
        console.log('User profile:', response.data)

        const newData = {
          ...initialData,
          ...response.data,
          email: response.data.email

          // Make sure all fields are included here
        }
        setFormData(newData)
        reset(newData) // Reset form with fetched data
        if (response.data.image_url) {
          setImgSrc(response.data.image_url)
        }
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error)
    }
  }, [apiToken, reset])

  // useEffect hook to fetch user profile on component mount
  useEffect(() => {
    fetchUserProfile()
  }, [fetchUserProfile]) // Empty dependency array means this effect runs once on mount

  const submitForm = async data => {
    const submitData = {
      ...data,
      username: formData.username, // Preserved from initial fetch
      is_active: formData.is_active,
      is_superuser: formData.is_superuser,
      is_verified: formData.is_verified,
      language: formData.language || 'English', // Make sure this is fetched and set initially
      email: formData.email // Make sure this is fetched and set initially
      // Any other fields you wish to preserve but not change
    }

    try {
      await axios.patch('/api/users/me', submitData, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiToken}` // Make sure apiToken is correctly retrieved from session
        }
      })

      toast.success('Profile updated successfully') // Notify user of success
      // Implement any additional logic needed after successful update
    } catch (error) {
      console.error('Failed to update profile:', error)
      toast.error('Failed to update profile') // Notify user of failure
    }
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <form onSubmit={handleSubmit(submitForm)}>
            <CardContent sx={{ pb: theme => `${theme.spacing(10)}` }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <ImgStyled src={imgSrc} alt='Profile Pic' />
                <div>
                  <ButtonStyled component='label' variant='contained' htmlFor='account-settings-upload-image'>
                    Upload New Photo
                    <input
                      hidden
                      type='file'
                      value={inputValue}
                      accept='image/png, image/jpeg'
                      onChange={handleInputImageChange}
                      id='account-settings-upload-image'
                    />
                  </ButtonStyled>
                  <ResetButtonStyled color='secondary' variant='outlined' onClick={handleInputImageReset}>
                    Reset
                  </ResetButtonStyled>
                  <Typography variant='caption' sx={{ mt: 4, display: 'block', color: 'text.disabled' }}>
                    Allowed PNG or JPEG. Max size of 800K.
                  </Typography>
                </div>
              </Box>
            </CardContent>
            <CardContent>
              <Grid container spacing={5}>
                <Grid item xs={12} sm={6}>
                  <Controller
                    name='first_name'
                    control={control}
                    defaultValue=''
                    render={({ field }) => (
                      <TextfieldStyled {...field} fullWidth label='First Name' placeholder='John' />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Controller
                    name='last_name'
                    control={control}
                    defaultValue=''
                    render={({ field }) => <TextfieldStyled {...field} fullWidth label='Last Name' placeholder='Doe' />}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Controller
                    name='email'
                    control={control}
                    defaultValue=''
                    render={({ field }) => (
                      <TextfieldStyled
                        {...field}
                        fullWidth
                        type='email'
                        label='Email'
                        placeholder='john.doe@example.com'
                        InputProps={{ readOnly: true }}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Controller
                    name='organization'
                    control={control}
                    defaultValue=''
                    render={({ field }) => (
                      <TextfieldStyled
                        {...field}
                        fullWidth
                        label='Organization'
                        placeholder={oscarConfig.COMPANY_NAME}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Controller
                    name='phone_number'
                    control={control}
                    defaultValue=''
                    render={({ field }) => (
                      <TextfieldStyled
                        {...field}
                        fullWidth
                        label='Phone Number'
                        placeholder='202 555 0111'
                        InputProps={{ startAdornment: <InputAdornment position='start'>US (+1)</InputAdornment> }}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Controller
                    name='address'
                    control={control}
                    defaultValue=''
                    render={({ field }) => (
                      <TextfieldStyled {...field} fullWidth label='Address' placeholder='Address' />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Controller
                    name='city'
                    control={control}
                    defaultValue=''
                    render={({ field }) => <TextfieldStyled {...field} fullWidth label='City' placeholder='City' />}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <Controller
                      name='state'
                      control={control}
                      defaultValue={formData.state}
                      render={({ field }) => (
                        <Autocomplete
                          {...field}
                          options={stateOptions}
                          getOptionLabel={option => option}
                          value={stateOptions.find(option => option === field.value) || null}
                          onChange={(event, newValue) => {
                            field.onChange(newValue)
                            handleFormChange('state', newValue || '')
                          }}
                          renderInput={params => <TextfieldStyled {...params} label='State' />}
                        />
                      )}
                    />
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Controller
                    name='postal_code'
                    control={control}
                    defaultValue={formData.postal_code}
                    render={({ field }) => <TextfieldStyled {...field} fullWidth label='Postal Code' placeholder='' />}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <Controller
                      name='country'
                      control={control}
                      defaultValue={formData.country}
                      render={({ field }) => (
                        <AutocompleteStyled
                          {...field}
                          options={countryOptions}
                          getOptionLabel={option => option}
                          value={countryOptions.find(option => option === field.value) || null}
                          onChange={(event, newValue) => {
                            field.onChange(newValue)
                            handleFormChange('country', newValue || '')
                          }}
                          renderInput={params => <TextfieldStyled {...params} label='Country' />}
                        />
                      )}
                    />
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <Controller
                      name='language'
                      control={control}
                      defaultValue={formData.language}
                      render={({ field }) => (
                        <AutocompleteStyled
                          {...field}
                          options={languageOptions}
                          getOptionLabel={option => option}
                          value={languageOptions.find(option => option === field.value) || null}
                          onChange={(event, newValue) => {
                            field.onChange(newValue)
                            handleFormChange('language', newValue || '')
                          }}
                          renderInput={params => <TextfieldStyled {...params} label='Language' />}
                        />
                      )}
                    />
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <Controller
                      name='timezone'
                      control={control}
                      defaultValue={formData.timezone}
                      render={({ field }) => (
                        <AutocompleteStyled
                          {...field}
                          options={timezoneOptions}
                          getOptionLabel={option => option}
                          value={timezoneOptions.find(option => option === field.value) || null}
                          onChange={(event, newValue) => {
                            field.onChange(newValue)
                            handleFormChange('timezone', newValue || '')
                          }}
                          renderInput={params => <TextfieldStyled {...params} label='Timezone' />}
                        />
                      )}
                    />
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', mt: 1 }}>
                    <Grid container direction='row' spacing={5}>
                      <Grid item>
                        {formData.is_active ? (
                          <Icon color='success' icon='mdi:user-outline' />
                        ) : (
                          <Icon color='error' icon='mdi:user-off-outline' />
                        )}
                      </Grid>
                      <Grid item>
                        {formData.is_superuser && <Icon color='success' icon='mdi:shield-crown-outline' />}
                      </Grid>
                      <Grid item>{formData.is_verified && <Icon color='info' icon='mdi:verified-user' />}</Grid>
                    </Grid>
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Button type='submit' variant='contained' sx={{ mr: 4 }}>
                    Save Changes
                  </Button>
                  <Button type='reset' variant='outlined' color='secondary' onClick={resetForm}>
                    Reset
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </form>
        </Card>
      </Grid>
      <Grid item xs={12}>
        <ChangePasswordCard />
      </Grid>
    </Grid>
  )
}

export default TabAccount
