// ** MUI Imports
import Box from '@mui/material/Box'
import Link from 'next/link'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import Button from '@mui/material/Button'
import { styled } from '@mui/material/styles'

const StyledLink = styled(Link)({
  display: 'flex',
  alignItems: 'center',
  textDecoration: 'none',
  color: '#FFFFFF'
})

const UserFooterContent = () => {
  // ** Var
  const hidden = useMediaQuery(theme => theme.breakpoints.down('md'))

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
      <Typography sx={{ mr: 2 }}>
        <i class='icon icon-econ' style={{ fontSize: '1rem' }} />
        {` © Ericsson 1994-${new Date().getFullYear()}`}
      </Typography>
      {hidden ? null : (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', '& :not(:last-child)': { mr: 0 } }}>
          <Button variant='contained' color='primary'>
            <StyledLink href='/support'>Support</StyledLink>
          </Button>
        </Box>
      )}
    </Box>
  )
}

export default UserFooterContent
