import { useContext, useState } from 'react'

// ** MUI Imports
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Views
import ServicesList from 'src/views/pages/ServicesList'

// ** Context Imports
import { AbilityContext } from 'src/layouts/components/acl/Can'
import { set } from 'nprogress'

const ServicesDashboard = () => {
  // ** Hooks
  const ability = useContext(AbilityContext)

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <ServicesList />
      </Grid>
    </Grid>
  )
}

ServicesDashboard.acl = {
  action: 'read',
  subject: 'services-page'
}

export default ServicesDashboard
