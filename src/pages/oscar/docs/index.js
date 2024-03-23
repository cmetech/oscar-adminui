import { useState } from 'react'
import Container from '@mui/material/Container'
import Box from '@mui/material/Box'

// ** Configs
import themeConfig from 'src/configs/themeConfig'
import { styled, useTheme } from '@mui/material/styles'

// ** Layout Import
import BlankLayout from 'src/@core/layouts/BlankLayout'

const ResponsiveMkDocsEmbed = ({ src }) => {
  return (
    <Box
      sx={{
        flexGrow: 1, // Allows the Box to grow and fill the available space
        height: '100%' // Sets the height to fill the available space
        // Additional styling can be applied as needed
      }}
    >
      <iframe
        key={src}
        src={src}
        title='MkDocs Site'
        style={{
          width: '100%', // Ensures the iframe fills the width of the Box
          height: '100%', // Ensures the iframe fills the height of the Box
          border: 'none' // Optionally remove the border
        }}
      />
    </Box>
  )
}

const DocsPage = () => {
  const theme = useTheme()

  return (
    <Container maxWidth='false' disableGutters={true} sx={{ p: 0, m: 0, height: '100vh', width: '100vw' }}>
      {/* Other components can go here */}
      <ResponsiveMkDocsEmbed src={`http://localhost:8005?theme=${theme.palette.mode}`} />
      {/* More components */}
    </Container>
  )
}

// DocsPage.getLayout = page => <BlankLayout>{page}</BlankLayout>

export default DocsPage
