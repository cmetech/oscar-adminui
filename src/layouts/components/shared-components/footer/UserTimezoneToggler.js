import { Fragment, useState } from 'react'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import IconButton from '@mui/material/IconButton'
import Icon from 'src/@core/components/icon'
import { useTranslation } from 'react-i18next'
import { useAtom } from 'jotai'
import { timezoneAtom } from 'src/lib/atoms'
import Box from '@mui/material/Box'

const UserTimezoneToggler = ({ settings, saveSettings }) => {
  // ** State
  const [anchorEl, setAnchorEl] = useState(null)
  const [timezone, setTimezone] = useAtom(timezoneAtom)

  // ** Translation
  const { t } = useTranslation()

  // ** Var
  const { layout } = settings

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

  const handleTimezoneDropdownOpen = event => {
    setAnchorEl(event.currentTarget)
  }

  const handleTimezoneDropdownClose = () => {
    setAnchorEl(null)
  }

  const handleTimezoneItemClick = tz => {
    setTimezone(tz)
    handleTimezoneDropdownClose()
  }

  const timezones = [
    { label: 'UTC', value: 'UTC' },
    { label: 'Pacific Time', value: 'America/Los_Angeles' },
    { label: 'Mountain Time', value: 'America/Denver' },
    { label: 'Central Time', value: 'America/Chicago' },
    { label: 'Eastern Time', value: 'America/New_York' },
    { label: 'Sweden', value: 'Europe/Stockholm' },
    { label: 'India Standard Time', value: 'Asia/Kolkata' }
  ]

  return (
    <Fragment>
      <IconButton
        color='inherit'
        aria-haspopup='true'
        aria-controls='timezone-menu'
        onClick={handleTimezoneDropdownOpen}
        sx={layout === 'vertical' ? { mr: 0.75 } : { mx: 0.75 }}
      >
        <Icon icon='mdi:timezone' />
      </IconButton>
      <Menu
        id='timezone-menu'
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleTimezoneDropdownClose}
        sx={{ '& .MuiMenu-paper': { mt: 4, minWidth: 200 } }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        {timezones.map(tz => (
          <MenuItem
            key={tz.value}
            sx={{ py: 2, display: 'flex', alignItems: 'center' }}
            selected={timezone === tz.value}
            onClick={() => handleTimezoneItemClick(tz.value)}
          >
            <Box sx={styles}>
              <Icon icon='mdi:timezone-outline' sx={{ mr: 3 }} />
              {tz.label}
            </Box>
          </MenuItem>
        ))}
      </Menu>
    </Fragment>
  )
}

export default UserTimezoneToggler
