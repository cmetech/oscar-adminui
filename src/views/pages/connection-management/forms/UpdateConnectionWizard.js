import React, { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import axios from 'axios'
import { useTranslation } from 'react-i18next'

// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import FormControl from '@mui/material/FormControl'
import FormHelperText from '@mui/material/FormHelperText'
import CircularProgress from '@mui/material/CircularProgress'
import { styled } from '@mui/material/styles'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Third Party Imports
import toast from 'react-hot-toast'

const UpdateConnectionWizard = ({ connectionId, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false)
  const { t } = useTranslation()

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm()

  useEffect(() => {
    const fetchConnectionDetails = async () => {
      try {
        const response = await axios.get(`/api/connections/${connectionId}`)
        const connectionData = response.data
        
        // Set form values based on the fetched data
        setValue('conn_id', connectionData.conn_id)
        setValue('conn_type', connectionData.conn_type)
        setValue('description', connectionData.description)
        setValue('host', connectionData.host)
        setValue('login', connectionData.login)
        setValue('schema', connectionData.schema)
        setValue('port', connectionData.port)
      } catch (error) {
        console.error('Error fetching connection details:', error)
        toast.error('Failed to fetch connection details')
      }
    }

    if (connectionId) {
      fetchConnectionDetails()
    }
  }, [connectionId, setValue])

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const response = await axios.put(`/api/connections/${connectionId}`, data)
      if (response.status === 200) {
        toast.success('Connection updated successfully')
        onSuccess()
        onClose()
      }
    } catch (error) {
      console.error('Error updating connection:', error)
      toast.error('Failed to update connection')
    } finally {
      setLoading(false)
    }
  }

  const handleTestConnection = async () => {
    setLoading(true)
    try {
      const response = await axios.post(`/api/connections/${connectionId}/test`)
      if (response.data.status === 'success') {
        toast.success('Connection test successful')
      } else {
        toast.error('Connection test failed')
      }
    } catch (error) {
      console.error('Error testing connection:', error)
      toast.error('Connection test failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader title='Update Connection' />
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={5}>
            <Grid item xs={12}>
              <Controller
                name='conn_id'
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label='Connection ID'
                    error={Boolean(errors.conn_id)}
                    helperText={errors.conn_id && 'This field is required'}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name='conn_type'
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label='Connection Type'
                    error={Boolean(errors.conn_type)}
                    helperText={errors.conn_type && 'This field is required'}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name='description'
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    multiline
                    rows={3}
                    label='Description'
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name='host'
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label='Host'
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name='login'
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label='Login'
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name='schema'
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label='Schema'
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name='port'
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type='number'
                    label='Port'
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Button
                  variant='contained'
                  onClick={handleTestConnection}
                  startIcon={<Icon icon='mdi:connection' />}
                  disabled={loading}
                >
                  Test Connection
                </Button>
                <Box>
                  <Button
                    type='submit'
                    variant='contained'
                    sx={{ mr: 3 }}
                    disabled={loading}
                  >
                    Submit
                  </Button>
                  <Button
                    variant='outlined'
                    color='secondary'
                    onClick={onClose}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </form>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <CircularProgress />
          </Box>
        )}
      </CardContent>
    </Card>
  )
}

export default UpdateConnectionWizard