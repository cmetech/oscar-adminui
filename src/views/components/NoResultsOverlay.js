import React from 'react'
import { Button, Stack, Typography } from '@mui/material'
import { useTheme } from '@mui/material/styles'

const NoResultsOverlay = ({ message, buttonText, onButtonClick }) => {
  const theme = useTheme()

  return (
    <Stack height='100%' alignItems='center' justifyContent='center' spacing={2}>
      <Typography
        noWrap
        variant='body1'
        sx={{
          marginBottom: '.5rem',
          color:
            theme.palette.mode === 'light'
              ? theme.palette.customColors.brandBlack
              : theme.palette.customColors.brandYellow
        }}
      >
        {message}
      </Typography>
      {buttonText && (
        <Button variant='contained' onClick={onButtonClick}>
          {buttonText}
        </Button>
      )}
    </Stack>
  )
}

export default NoResultsOverlay
