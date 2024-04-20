// ** MUI Imports
import Box from '@mui/material/Box'
import Link from 'next/link'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import Button from '@mui/material/Button'
import { styled } from '@mui/material/styles'
import Stack from '@mui/material/Stack'
import Icon from '@mui/material/Icon'
import { useTranslation } from 'react-i18next'

const StyledLink = styled(Link)({
  display: 'flex',
  alignItems: 'center',
  textDecoration: 'none',
  color: '#FFFFFF'
})

const UserFooterContent = props => {
  // ** Var
  const hidden = useMediaQuery(theme => theme.breakpoints.down('md'))
  const theme = props.theme

  const { t } = useTranslation()

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
      <Typography
        sx={{
          mr: 2,
          color: `${
            theme.palette.mode === 'light'
              ? theme.palette.customColors.brandBlack
              : theme.palette.customColors.brandWhite
          }`
        }}
      >
        <i className='icon icon-econ' style={{ fontSize: '1rem' }} />
        {` © Ericsson 1994-${new Date().getFullYear()}`}
      </Typography>
      {hidden ? null : (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', '& :not(:last-child)': { mr: 0 } }}>
          <Stack direction='row' spacing={3}>
            <Button variant='contained' color='primary'>
              <StyledLink href='/oscar/docs'>{t('Academy')}</StyledLink>
            </Button>
            <Button variant='contained' color='primary'>
              <StyledLink href='/support'>{t('Feedback')}</StyledLink>
            </Button>
            <Button variant='contained' color='primary'>
              <StyledLink href='/support'>{t('Support')}</StyledLink>
            </Button>
          </Stack>
        </Box>
      )}
    </Box>
  )
}

export default UserFooterContent
