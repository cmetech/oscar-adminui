// ** MUI Imports
import { useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import Link from 'next/link'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import Button from '@mui/material/Button'
import { styled } from '@mui/material/styles'
import Stack from '@mui/material/Stack'
import Icon from '@mui/material/Icon'
import { useTranslation } from 'react-i18next'
import getConfig from 'next/config'
import oscarConfig from 'src/configs/oscarConfig'

const StyledLink = styled(Link)({
  display: 'flex',
  alignItems: 'center',
  textDecoration: 'none',
  color: '#FFFFFF'
})

const { publicRuntimeConfig } = getConfig()

const UserFooterContent = props => {
  // ** Var
  const hidden = useMediaQuery(theme => theme.breakpoints.down('md'))
  const theme = props.theme

  const { t } = useTranslation()

  const docs_host = publicRuntimeConfig.MKDOCS_HOST || 'localhost'

  // Determine the root domain or IP from the URL
  const [rootDomain, setRootDomain] = useState(docs_host)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname
      setRootDomain(hostname)
    }
  }, [docs_host])

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
        {` © ${oscarConfig.COMPANY_NAME} ${new Date().getFullYear()}`}
      </Typography>
      {hidden ? null : (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', '& :not(:last-child)': { mr: 0 } }}>
          <Stack direction='row' spacing={3}>
            <Button variant='contained' color='primary'>
              <Link href={`https://${rootDomain}/ext/docs/?theme=${theme.palette.mode}`} passHref legacyBehavior>
                <StyledLink target='_blank' rel='noopener noreferrer'>
                  {t('Academy')}
                </StyledLink>
              </Link>
            </Button>
            {/* <Button variant='contained' color='primary'>
              <StyledLink href='/support'>{t('Feedback')}</StyledLink>
            </Button> */}
            {/* <Button variant='contained' color='primary'>
              <StyledLink href='/support'>{t('Support')}</StyledLink>
            </Button> */}
          </Stack>
        </Box>
      )}
    </Box>
  )
}

export default UserFooterContent
