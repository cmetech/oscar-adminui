// src/layouts/components/UserLanguageDropdown.js

import { Fragment, useState } from 'react'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import IconButton from '@mui/material/IconButton'
import { useTranslation } from 'react-i18next'
import Icon from 'src/@core/components/icon'
import Box from '@mui/material/Box'

const UserLanguageDropdown = ({ settings }) => {
  // ** State
  const [anchorEl, setAnchorEl] = useState(null)

  // ** Hook
  const { i18n } = useTranslation()

  // ** Var
  const { layout } = settings

  const handleLangDropdownOpen = event => {
    setAnchorEl(event.currentTarget)
  }

  const handleLangDropdownClose = () => {
    setAnchorEl(null)
  }

  const handleLangItemClick = lang => {
    i18n.changeLanguage(lang)
    handleLangDropdownClose()
  }

  const styles = {
    py: 1,
    px: 1,
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    color: 'text.primary',
    textDecoration: 'none',
    '& svg': {
      mr: 2,
      fontSize: '1.375rem',
      color: 'text.primary'
    }
  }

  return (
    <Fragment>
      <IconButton
        color='inherit'
        aria-haspopup='true'
        aria-controls='customized-menu'
        onClick={handleLangDropdownOpen}
        sx={layout === 'vertical' ? { mr: 0.75 } : { mx: 0.75 }}
      >
        <Icon icon='mdi:translate' />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleLangDropdownClose}
        sx={{ '& .MuiMenu-paper': { mt: 4, minWidth: 130 } }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem sx={{ py: 2 }} selected={i18n.language === 'en'} onClick={() => handleLangItemClick('en')}>
          <Box sx={styles}>
            <Icon icon='mdi:translate-variant' sx={{ mr: 3 }} />
            English
          </Box>
        </MenuItem>
        <MenuItem sx={{ py: 2 }} selected={i18n.language === 'sv'} onClick={() => handleLangItemClick('sv')}>
          <Box sx={styles}>
            <Icon icon='mdi:translate-variant' sx={{ mr: 3 }} />
            Swedish
          </Box>
        </MenuItem>
        <MenuItem sx={{ py: 2 }} selected={i18n.language === 'fr'} onClick={() => handleLangItemClick('fr')}>
          <Box sx={styles}>
            <Icon icon='mdi:translate-variant' sx={{ mr: 3 }} />
            French
          </Box>
        </MenuItem>
        <MenuItem sx={{ py: 2 }} selected={i18n.language === 'es'} onClick={() => handleLangItemClick('es')}>
          <Box sx={styles}>
            <Icon icon='mdi:translate-variant' sx={{ mr: 3 }} />
            Spanish
          </Box>
        </MenuItem>
      </Menu>
    </Fragment>
  )
}

export default UserLanguageDropdown
