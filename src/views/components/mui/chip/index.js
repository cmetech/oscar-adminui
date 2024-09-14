// ** MUI Imports
import MuiChip from '@mui/material/Chip'

// ** Third Party Imports
import clsx from 'clsx'

// ** Hooks Imports
import useBgColor from 'src/@core/hooks/useBgColor'

const Chip = props => {
  // ** Props
  const { sx, skin, color, rounded } = props

  // ** Hook
  const bgColors = useBgColor()

  const colors = {
    primary: { ...bgColors.primaryLight },
    secondary: { ...bgColors.secondaryLight },
    success: { ...bgColors.successLight },
    error: { ...bgColors.errorLight },
    warning: { ...bgColors.warningLight },
    info: { ...bgColors.infoLight }
  }

  // Ensure we have a valid color, defaulting to 'default' if not
  const validColor = color && colors.hasOwnProperty(color) ? color : 'default'

  // Create a safe version of sx that's always an object
  const safeSx = typeof sx === 'object' && sx !== null ? sx : {}

  // Safely merge colors with sx if needed
  const chipSx = skin === 'light' && validColor !== 'default' ? { ...colors[validColor], ...safeSx } : safeSx

  const propsToPass = { ...props }
  delete propsToPass.rounded // Remove rounded from props to avoid passing it to MuiChip

  return (
    <MuiChip
      {...propsToPass}
      variant='filled'
      className={clsx({
        'MuiChip-rounded': rounded,
        'MuiChip-light': skin === 'light'
      })}
      sx={chipSx}
    />
  )
}

export default Chip
