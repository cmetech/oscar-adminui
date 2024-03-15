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
import Box from '@mui/material/Box'
import { styled } from '@mui/material/styles'

// Define the responsive Box using styled
const ResponsiveBox = styled(Box)(({ theme }) => ({
  width: '100%', // Default width
  maxWidth: '900px', // Default max width
  mx: 'auto', // Center the box
  [theme.breakpoints.down('sm')]: {
    maxWidth: '90%' // Slightly less than full width for sm devices
  },
  [theme.breakpoints.down('md')]: {
    maxWidth: '75%' // Use more space on md devices, but not full width
  },
  [theme.breakpoints.up('lg')]: {
    maxWidth: '900px' // Limit maxWidth for lg and xl devices
  }

  // Add more responsive styles if needed
}))

const Oscar = () => {
  // ** Hooks
  const ability = useContext(AbilityContext)

  return (
    <Grid container spacing={6} justifyContent='center'>
      <Grid item xs={12} sm={10} md={8} lg={6}>
        <ResponsiveBox>
          <ChatBot />
        </ResponsiveBox>
      </Grid>
    </Grid>
  )
}
Oscar.acl = {
  action: 'read',
  subject: 'oscar-page'
}

export default Oscar
