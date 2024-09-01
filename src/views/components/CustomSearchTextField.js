import React, { useState, useEffect, forwardRef } from 'react'
import { Box, TextField, IconButton } from '@mui/material'
import Icon from 'src/@core/components/icon'
import { useTheme, styled } from '@mui/material/styles'
import { useTranslation } from 'react-i18next'  // Add this import

const TextfieldStyled = styled(TextField)(({ theme }) => ({
  '& label.Mui-focused': {
    color: theme.palette.customColors.accent
  },
  '& .MuiOutlinedInput-root': {
    '&.Mui-focused fieldset': {
      borderColor: theme.palette.customColors.accent
    }
  }
}))

// Custom hook for debouncing
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

const CustomSearchTextField = forwardRef(({ value, onChange, clearSearch, delay = 500, ...props }, ref) => {
  const [inputValue, setInputValue] = useState(value)
  const debouncedInputValue = useDebounce(inputValue, delay)
  const { t } = useTranslation()  // Add this line to use the translation function

  // When debounced value changes or Enter is pressed
  const handleChange = newValue => {
    // Construct an event-like object with value
    const event = { target: { value: newValue } }

    // Call the onChange prop with the new value
    console.log('calling onChange', newValue)
    onChange(event)
  }

  // Effect to call onChange prop after debounced value changes
  useEffect(() => {
    if (debouncedInputValue !== value) {
      // Prevent calling onChange if the value hasn't changed
      handleChange(debouncedInputValue)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedInputValue])

  const handleInputChange = event => {
    setInputValue(event.target.value)
  }

  const handleKeyDown = event => {
    if (event.key === 'Enter') {
      console.log('Enter key pressed')
      handleChange(inputValue) // Immediately apply the search on Enter key press
    }
  }

  return (
    <TextfieldStyled
      ref={ref}
      size='small'
      value={inputValue}
      onChange={handleInputChange}
      onKeyDown={handleKeyDown}
      placeholder={t('Filter Current Page')}  // Update this line
      InputProps={{
        startAdornment: (
          <Box sx={{ mr: 2, display: 'flex' }}>
            <Icon icon='mdi:magnify' fontSize={20} />
          </Box>
        ),
        endAdornment: inputValue && (
          <IconButton
            size='small'
            title='Clear'
            aria-label='Clear'
            onClick={() => {
              setInputValue('')
              clearSearch()
            }}
          >
            <Icon icon='mdi:close' fontSize={20} />
          </IconButton>
        )
      }}
      {...props} // Pass down any additional props
    />
  )
})

export default CustomSearchTextField
