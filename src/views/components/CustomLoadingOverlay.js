import React from 'react'
import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import { useTheme } from '@mui/material/styles'

const CustomLoadingOverlay = () => {
  const theme = useTheme()

  return (
    <Stack height='100%' alignItems='center' justifyContent='center' spacing={2}>
      <CircularProgress
        sx={{
          color: theme =>
            theme.palette.mode === 'light'
              ? theme.palette.customColors.brandBlack
              : theme.palette.customColors.brandYellow
        }}
      />
    </Stack>
  )
}

export default CustomLoadingOverlay
