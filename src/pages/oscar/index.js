// ** React Imports
import { useContext } from 'react'

// ** Context Imports
import { AbilityContext } from 'src/layouts/components/acl/Can'

// ** MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import ChatBot from 'src/views/chat'

const Oscar = () => {
  // ** Hooks
  const ability = useContext(AbilityContext)

  return (
    <Grid container spacing={6}>
      <Grid item md={12} xs={12}>
        <ChatBot />
      </Grid>
    </Grid>
  )
}
Oscar.acl = {
  action: 'read',
  subject: 'oscar-page'
}

export default Oscar
